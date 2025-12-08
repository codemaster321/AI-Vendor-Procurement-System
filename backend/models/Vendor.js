import mongoose from 'mongoose';

const vendorSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactPerson: { type: String },
    phone: { type: String },
    category: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
