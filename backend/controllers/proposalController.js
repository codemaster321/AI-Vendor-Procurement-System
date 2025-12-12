import Proposal from '../models/Proposal.js';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { parseVendorResponse, compareProposals } from '../services/aiService.js';
import { fetchEmailsWithProgress } from '../services/emailService.js';

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

    // Helper to send SSE events
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        // Validate RFP exists
        sendEvent('progress', { stage: 'initializing', percentage: 0, message: 'Validating RFP...' });

        const rfp = await RFP.findById(rfpId).populate('vendors');
        if (!rfp) {
            sendEvent('error', { message: 'RFP not found' });
            res.end();
            return;
        }

        sendEvent('progress', { stage: 'initializing', percentage: 5, message: `Processing RFP: ${rfp.title}` });

        // Fetch emails with progress callback
        const emails = await fetchEmailsWithProgress('UNSEEN', (stage, percentage, message, data) => {
            sendEvent('progress', { stage, percentage, message, ...data });
        });

        // Process matched emails
        sendEvent('progress', { stage: 'processing', percentage: 90, message: 'Matching emails with vendors...' });

        const processed = [];
        const newProposals = [];

        for (const email of emails) {
            const vendor = rfp.vendors.find(v => email.from.includes(v.email));

            if (vendor) {
                const existingProposal = await Proposal.findOne({ rfpId, vendorId: vendor._id });

                if (!existingProposal) {
                    sendEvent('progress', {
                        stage: 'processing',
                        percentage: 92,
                        message: `Parsing proposal from ${vendor.name}...`
                    });

                    const parsedData = await parseVendorResponse(email.text, rfp);

                    const proposal = new Proposal({
                        rfpId,
                        vendorId: vendor._id,
                        rawEmail: email.text,
                        parsedData
                    });

                    await proposal.save();
                    processed.push({ vendor: vendor.name, status: 'created' });
                    newProposals.push(proposal);
                } else {
                    processed.push({ vendor: vendor.name, status: 'already exists' });
                }
            }
        }

        // Send completion event
        sendEvent('complete', {
            message: 'Email processing complete',
            results: processed,
            proposals: newProposals,
            totalFound: emails.length,
            newProposals: newProposals.length
        });

    } catch (error) {
        console.error('SSE Error:', error);
        sendEvent('error', { message: error.message || 'Failed to fetch emails' });
    } finally {
        res.end();
    }
};

// Create proposal manually
export const createProposal = async (req, res) => {
    try {
        const { rfpId, vendorId, rawEmail } = req.body;

        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Use AI to parse the email
        const parsedData = await parseVendorResponse(rawEmail, rfp);

        const proposal = new Proposal({
            rfpId,
            vendorId,
            rawEmail,
            parsedData
        });

        const savedProposal = await proposal.save();
        res.status(201).json(savedProposal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get proposals for an RFP
export const getProposalsByRFP = async (req, res) => {
    try {
        const proposals = await Proposal.find({ rfpId: req.params.rfpId })
            .populate('vendorId')
            .sort({ createdAt: -1 });
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Compare proposals
export const compareRFPProposals = async (req, res) => {
    try {
        const { rfpId } = req.params;

        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const proposals = await Proposal.find({ rfpId }).populate('vendorId');

        if (proposals.length === 0) {
            return res.status(404).json({ message: 'No proposals found for this RFP' });
        }

        // Use AI to compare proposals
        const comparison = await compareProposals(rfp, proposals);

        res.json(comparison);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update proposal
export const updateProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        res.json(proposal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete proposal
export const deleteProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findByIdAndDelete(req.params.id);
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        res.json({ message: 'Proposal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
