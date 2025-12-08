import Proposal from '../models/Proposal.js';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { parseVendorResponse, compareProposals } from '../services/aiService.js';
import { fetchEmails } from '../services/emailService.js';

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

// Fetch and process vendor emails
export const fetchVendorEmails = async (req, res) => {
    try {
        const { rfpId } = req.params;

        const rfp = await RFP.findById(rfpId).populate('vendors');
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        // Fetch emails
        const emails = await fetchEmails();

        const processed = [];
        for (const email of emails) {
            // Try to match email with vendors
            const vendor = rfp.vendors.find(v => email.from.includes(v.email));

            if (vendor) {
                // Check if proposal already exists
                const existingProposal = await Proposal.findOne({ rfpId, vendorId: vendor._id });

                if (!existingProposal) {
                    const parsedData = await parseVendorResponse(email.text, rfp);

                    const proposal = new Proposal({
                        rfpId,
                        vendorId: vendor._id,
                        rawEmail: email.text,
                        parsedData
                    });

                    await proposal.save();
                    processed.push({ vendor: vendor.name, status: 'created' });
                } else {
                    processed.push({ vendor: vendor.name, status: 'already exists' });
                }
            }
        }

        res.json({ message: 'Emails processed', results: processed });
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
