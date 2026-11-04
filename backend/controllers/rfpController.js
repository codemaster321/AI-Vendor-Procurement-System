import mongoose from 'mongoose';
import RFP from '../models/RFP.js';
import Vendor from '../models/Vendor.js';
import Proposal from '../models/Proposal.js';
import { generateRFPFromNL } from '../services/aiService.js';
import { sendRFPEmail } from '../services/emailService.js';
import { serverError, pick } from '../utils/http.js';

const UPDATABLE_FIELDS = ['title', 'description', 'budget', 'currency', 'deadline', 'paymentTerms', 'warranty', 'items', 'status'];

const toNumberOrUndefined = (value) => {
    const n = Number(value);
    return value === null || value === undefined || value === '' || Number.isNaN(n) ? undefined : n;
};

const toDateOrUndefined = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
};

export const createRFP = async (req, res) => {
    try {
        const { naturalLanguageInput } = req.body;

        if (!naturalLanguageInput) {
            return res.status(400).json({ message: 'Please describe your procurement needs' });
        }

        if (typeof naturalLanguageInput !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        const input = naturalLanguageInput.trim();

        if (input.length < 10) {
            return res.status(400).json({ message: 'Please provide more details (minimum 10 characters)' });
        }

        if (input.length > 5000) {
            return res.status(400).json({ message: 'Input too long (maximum 5000 characters)' });
        }

        const structured = await generateRFPFromNL(input);

        // The model's output is untrusted: fall back / coerce instead of failing validation
        const items = Array.isArray(structured.items)
            ? structured.items
                  .filter((item) => item && item.name)
                  .map((item) => ({
                      name: String(item.name),
                      quantity: toNumberOrUndefined(item.quantity),
                      specs: item.specs ? String(item.specs) : undefined,
                  }))
            : [];

        const rfp = await RFP.create({
            owner: req.user._id,
            title: (structured.title && String(structured.title).trim()) || input.slice(0, 80),
            description: (structured.description && String(structured.description).trim()) || input,
            budget: toNumberOrUndefined(structured.budget),
            currency: structured.currency || 'USD',
            deadline: toDateOrUndefined(structured.deadline),
            paymentTerms: structured.paymentTerms || undefined,
            warranty: structured.warranty || undefined,
            items,
        });

        res.status(201).json(rfp);
    } catch (error) {
        serverError(res, error, 'Failed to create RFP. Please try again.');
    }
};

export const getAllRFPs = async (req, res) => {
    try {
        const rfps = await RFP.find({ owner: req.user._id })
            .select('-analysis')
            .populate('vendors')
            .sort({ createdAt: -1 });
        res.json(rfps);
    } catch (error) {
        serverError(res, error);
    }
};

export const getRFPById = async (req, res) => {
    try {
        const rfp = await RFP.findOne({ _id: req.params.id, owner: req.user._id }).populate('vendors');
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        res.json(rfp);
    } catch (error) {
        serverError(res, error);
    }
};

export const sendRFPToVendors = async (req, res) => {
    try {
        const { rfpId, vendorIds } = req.body;

        if (!mongoose.isValidObjectId(rfpId)) {
            return res.status(400).json({ message: 'Invalid RFP id' });
        }
        if (!Array.isArray(vendorIds) || vendorIds.length === 0 || !vendorIds.every((id) => mongoose.isValidObjectId(id))) {
            return res.status(400).json({ message: 'Select at least one vendor' });
        }

        const rfp = await RFP.findOne({ _id: rfpId, owner: req.user._id });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }

        const vendors = await Vendor.find({ _id: { $in: vendorIds }, owner: req.user._id });
        if (vendors.length === 0) {
            return res.status(404).json({ message: 'No matching vendors found' });
        }

        const results = [];
        for (const vendor of vendors) {
            try {
                await sendRFPEmail(vendor.email, rfp);
                results.push({ vendorId: vendor._id, vendor: vendor.name, success: true });
            } catch (error) {
                console.error(`Failed to email ${vendor.email}:`, error.message);
                results.push({ vendorId: vendor._id, vendor: vendor.name, success: false, error: 'Email could not be sent' });
            }
        }

        const sent = results.filter((r) => r.success);

        if (sent.length === 0) {
            return res.status(502).json({
                message: 'Could not send the RFP to any vendor. Check the email configuration.',
                results,
            });
        }

        // Add (don't replace) vendors so replies from earlier batches are still matched
        await RFP.updateOne(
            { _id: rfp._id },
            {
                $addToSet: { vendors: { $each: sent.map((r) => r.vendorId) } },
                $set: { status: rfp.status === 'Closed' ? 'Closed' : 'Sent' },
            }
        );

        const failed = results.length - sent.length;
        res.json({
            message: failed
                ? `Sent to ${sent.length} vendor(s); ${failed} failed`
                : `Sent to ${sent.length} vendor(s)`,
            results,
        });
    } catch (error) {
        serverError(res, error, 'Failed to send RFP');
    }
};

export const updateRFP = async (req, res) => {
    try {
        const updates = pick(req.body, UPDATABLE_FIELDS);
        const rfp = await RFP.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updates, {
            returnDocument: 'after',
            runValidators: true,
        });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        res.json(rfp);
    } catch (error) {
        serverError(res, error);
    }
};

export const deleteRFP = async (req, res) => {
    try {
        const rfp = await RFP.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!rfp) {
            return res.status(404).json({ message: 'RFP not found' });
        }
        await Proposal.deleteMany({ rfpId: rfp._id, owner: req.user._id });
        res.json({ message: 'RFP deleted successfully' });
    } catch (error) {
        serverError(res, error);
    }
};
