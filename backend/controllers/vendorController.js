import Vendor from '../models/Vendor.js';
import RFP from '../models/RFP.js';
import Proposal from '../models/Proposal.js';
import { serverError, pick } from '../utils/http.js';

const VENDOR_FIELDS = ['name', 'email', 'contactPerson', 'phone', 'category'];

// Create vendor
export const createVendor = async (req, res) => {
    try {
        const data = pick(req.body, VENDOR_FIELDS);

        if (!data.name || !data.email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const email = String(data.email).trim().toLowerCase();
        const vendorExists = await Vendor.findOne({ owner: req.user._id, email });
        if (vendorExists) {
            return res.status(400).json({ message: 'Vendor with this email already exists' });
        }

        const vendor = await Vendor.create({ ...data, email, owner: req.user._id });
        res.status(201).json(vendor);
    } catch (error) {
        serverError(res, error);
    }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(vendors);
    } catch (error) {
        serverError(res, error);
    }
};

// Get single vendor
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ _id: req.params.id, owner: req.user._id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        serverError(res, error);
    }
};

// Update vendor
export const updateVendor = async (req, res) => {
    try {
        const updates = pick(req.body, VENDOR_FIELDS);
        const vendor = await Vendor.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updates, {
            returnDocument: 'after',
            runValidators: true,
        });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        serverError(res, error);
    }
};

// Delete vendor (and detach it from RFPs / remove its proposals)
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        await Promise.all([
            RFP.updateMany({ owner: req.user._id, vendors: vendor._id }, { $pull: { vendors: vendor._id } }),
            Proposal.deleteMany({ owner: req.user._id, vendorId: vendor._id }),
        ]);
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        serverError(res, error);
    }
};
