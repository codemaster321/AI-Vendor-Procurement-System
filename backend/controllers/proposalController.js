import mongoose from 'mongoose';
import Proposal from '../models/Proposal.js';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { parseVendorResponse, compareProposals } from '../services/aiService.js';
import { fetchEmailsWithProgress, rfpReference } from '../services/emailService.js';
import { serverError, pick } from '../utils/http.js';

/**
 * Decide whether an inbound email is a reply to this specific RFP.
 * New RFP emails carry a `[Ref: <rfpId>]` tag in the subject, which survives "Re:".
 * Emails sent before the tag existed fall back to matching the RFP title.
 */
const isReplyToRFP = (email, rfp) => {
    const subject = (email.subject || '').toLowerCase();
    if (subject.includes(rfpReference(rfp._id).toLowerCase())) return true;
    return Boolean(rfp.title) && subject.includes(rfp.title.toLowerCase());
};

/**
 * SSE endpoint for fetching vendor emails with real-time progress
 * Uses Server-Sent Events to stream progress updates to the client
 */
export const fetchVendorEmailsSSE = async (req, res) => {
    const { rfpId } = req.params;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Stop doing work (and AI calls) once the client cancels / disconnects
    let clientClosed = false;
    req.on('close', () => {
        clientClosed = true;
    });

    // Helper to send SSE events
    const sendEvent = (event, data) => {
        if (clientClosed) return;
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        sendEvent('progress', { stage: 'initializing', percentage: 0, message: 'Validating RFP...' });

        const rfp = await RFP.findOne({ _id: rfpId, owner: req.user._id }).populate('vendors');
        if (!rfp) {
            sendEvent('error', { message: 'RFP not found' });
            return;
        }

        if (!rfp.vendors.length) {
            sendEvent('error', { message: 'This RFP has not been sent to any vendors yet' });
            return;
        }

        sendEvent('progress', { stage: 'initializing', percentage: 5, message: `Processing RFP: ${rfp.title}` });

        // Fetch emails with progress callback
        const emails = await fetchEmailsWithProgress('UNSEEN', (stage, percentage, message, data) => {
            sendEvent('progress', { stage, percentage, message, ...data });
        });

        if (clientClosed) return;

        sendEvent('progress', { stage: 'processing', percentage: 90, message: 'Matching emails with vendors...' });

        const vendorsByEmail = new Map(rfp.vendors.map((v) => [v.email.toLowerCase(), v]));
        const processed = [];
        const newProposals = [];

        for (const email of emails) {
            if (clientClosed) return;
            if (!isReplyToRFP(email, rfp)) continue;

            const vendor = vendorsByEmail.get(email.fromAddress);
            if (!vendor) continue;

            const existingProposal = await Proposal.findOne({ rfpId: rfp._id, vendorId: vendor._id });
            if (existingProposal) {
                processed.push({ vendor: vendor.name, status: 'already exists' });
                continue;
            }

            sendEvent('progress', {
                stage: 'processing',
                percentage: 92,
                message: `Parsing proposal from ${vendor.name}...`,
            });

            const parsedData = await parseVendorResponse(email.text || '', rfp);

            const proposal = await Proposal.create({
                owner: req.user._id,
                rfpId: rfp._id,
                vendorId: vendor._id,
                rawEmail: email.text,
                parsedData,
            });

            processed.push({ vendor: vendor.name, status: 'created' });
            newProposals.push(proposal);
        }

        sendEvent('complete', {
            message: 'Email processing complete',
            results: processed,
            proposals: newProposals,
            totalFound: emails.length,
            newProposals: newProposals.length,
        });
    } catch (error) {
        console.error('SSE Error:', error);
        sendEvent('error', { message: 'Failed to fetch emails. Check the email configuration.' });
    } finally {
        res.end();
    }
};

// Create proposal manually
export const createProposal = async (req, res) => {
    try {
        const { rfpId, vendorId, rawEmail } = req.body;

        if (!mongoose.isValidObjectId(rfpId) || !mongoose.isValidObjectId(vendorId)) {
            return res.status(400).json({ message: 'Invalid RFP or vendor id' });
        }
        if (!rawEmail || typeof rawEmail !== 'string') {
            return res.status(400).json({ message: 'Proposal text is required' });
        }

        const rfp = await RFP.findOne({ _id: rfpId, owner: req.user._id });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const vendor = await Vendor.findOne({ _id: vendorId, owner: req.user._id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Use AI to parse the email
        const parsedData = await parseVendorResponse(rawEmail, rfp);

        const proposal = await Proposal.create({
            owner: req.user._id,
            rfpId,
            vendorId,
            rawEmail,
            parsedData,
        });

        await RFP.updateOne({ _id: rfp._id }, { $addToSet: { vendors: vendor._id } });

        res.status(201).json(proposal);
    } catch (error) {
        serverError(res, error, 'Failed to create proposal');
    }
};

// Get proposals for an RFP
export const getProposalsByRFP = async (req, res) => {
    try {
        const proposals = await Proposal.find({ rfpId: req.params.rfpId, owner: req.user._id })
            .populate('vendorId')
            .sort({ createdAt: -1 });
        res.json(proposals);
    } catch (error) {
        serverError(res, error);
    }
};

// Compare proposals
export const compareRFPProposals = async (req, res) => {
    try {
        const { rfpId } = req.params;

        const rfp = await RFP.findOne({ _id: rfpId, owner: req.user._id });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const proposals = await Proposal.find({ rfpId, owner: req.user._id }).populate('vendorId');
        const usable = proposals.filter((p) => p.vendorId);

        if (usable.length === 0) {
            return res.status(404).json({ message: 'No proposals found for this RFP' });
        }

        const comparison = await compareProposals(rfp, usable);

        // The model's output is untrusted: keep only scores for vendors that actually bid
        const knownIds = new Set(usable.map((p) => String(p.vendorId._id)));
        const vendorScores = (Array.isArray(comparison.vendorScores) ? comparison.vendorScores : [])
            .filter((s) => s && knownIds.has(String(s.vendorId)))
            .map((s) => ({
                vendorId: String(s.vendorId),
                score: Math.max(0, Math.min(100, Math.round(Number(s.score) || 0))),
                strengths: Array.isArray(s.strengths) ? s.strengths.map(String) : [],
                weaknesses: Array.isArray(s.weaknesses) ? s.weaknesses.map(String) : [],
            }));

        const rec = comparison.recommendation;
        const recommendation =
            rec && knownIds.has(String(rec.recommendedVendorId))
                ? {
                      recommendedVendorId: String(rec.recommendedVendorId),
                      reasoning: String(rec.reasoning || ''),
                      considerations: Array.isArray(rec.considerations) ? rec.considerations.map(String) : [],
                  }
                : null;

        const result = {
            summary: String(comparison.summary || ''),
            vendorScores,
            recommendation,
        };

        // Persist so the analysis survives a reload
        await Promise.all([
            RFP.updateOne({ _id: rfp._id }, { $set: { analysis: result, analyzedAt: new Date() } }),
            ...vendorScores.map((s) =>
                Proposal.updateOne(
                    { rfpId: rfp._id, vendorId: s.vendorId, owner: req.user._id },
                    {
                        $set: {
                            score: s.score,
                            aiAnalysis: JSON.stringify({ strengths: s.strengths, weaknesses: s.weaknesses }),
                            status: 'Reviewed',
                        },
                    }
                )
            ),
        ]);

        res.json(result);
    } catch (error) {
        serverError(res, error, 'Failed to compare proposals');
    }
};

// Update proposal
export const updateProposal = async (req, res) => {
    try {
        const updates = pick(req.body, ['status', 'parsedData', 'score']);
        const proposal = await Proposal.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updates, {
            returnDocument: 'after',
            runValidators: true,
        });
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        res.json(proposal);
    } catch (error) {
        serverError(res, error);
    }
};

// Delete proposal
export const deleteProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        res.json({ message: 'Proposal deleted successfully' });
    } catch (error) {
        serverError(res, error);
    }
};
