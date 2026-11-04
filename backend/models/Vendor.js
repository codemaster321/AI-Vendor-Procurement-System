import mongoose from 'mongoose';

const vendorSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    category: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

// Email is unique per user, not globally
vendorSchema.index({ owner: 1, email: 1 }, { unique: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
