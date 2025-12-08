import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import { generateRFPFromNL } from '../services/aiService.js';
import { sendRFPEmail } from '../services/emailService.js';

export const createRFP = async (req, res) => {
    try {
        const { naturalLanguageInput } = req.body;

        if (!naturalLanguageInput) {
            return res.status(400).json({ message: 'Please describe your procurement needs' });
        }

        if (typeof naturalLanguageInput !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        if (naturalLanguageInput.length < 10) {
            return res.status(400).json({ message: 'Please provide more details (minimum 10 characters)' });
        }

        if (naturalLanguageInput.length > 5000) {
            return res.status(400).json({ message: 'Input too long (maximum 5000 characters)' });
        }

        const structuredRFP = await generateRFPFromNL(naturalLanguageInput);

        const rfp = new RFP({
            title: structuredRFP.title,
            description: structuredRFP.description,
            budget: structuredRFP.budget,
            currency: structuredRFP.currency || 'USD',
            deadline: structuredRFP.deadline,
            items: structuredRFP.items || []
        });

        const savedRFP = await rfp.save();
        res.status(201).json(savedRFP);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllRFPs = async (req, res) => {
    try {
        const rfps = await RFP.find().populate('vendors').sort({ createdAt: -1 });
        res.json(rfps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRFPById = async (req, res) => {
    try {
        const rfp = await RFP.findById(req.params.id).populate('vendors');
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        res.json(rfp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendRFPToVendors = async (req, res) => {
    try {
        const { rfpId, vendorIds } = req.body;

        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const vendors = await Vendor.find({ _id: { $in: vendorIds } });

        const emailResults = [];
        for (const vendor of vendors) {
            try {
                const result = await sendRFPEmail(vendor.email, rfp);
                emailResults.push({ vendor: vendor.name, success: true, result });
            } catch (error) {
                emailResults.push({ vendor: vendor.name, success: false, error: error.message });
            }
        }

        rfp.vendors = vendorIds;
        rfp.status = 'Sent';
        await rfp.save();

        res.json({ message: 'RFP sent to vendors', results: emailResults });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRFP = async (req, res) => {
    try {
        const rfp = await RFP.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        res.json(rfp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRFP = async (req, res) => {
    try {
        const rfp = await RFP.findByIdAndDelete(req.params.id);
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        res.json({ message: 'RFP deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
