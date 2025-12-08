import mongoose from 'mongoose';

const rfpSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number },
    currency: { type: String, default: 'USD' },
    deadline: { type: Date },
    items: [{
        name: { type: String },
        quantity: { type: Number },
        specs: { type: String }
    }],
    status: { type: String, enum: ['Draft', 'Sent', 'Closed'], default: 'Draft' },
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    createdAt: { type: Date, default: Date.now }
});

const RFP = mongoose.model('RFP', rfpSchema);

export default RFP;
