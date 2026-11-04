import mongoose from 'mongoose';

const rfpSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    budget: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    deadline: { type: Date },
    paymentTerms: { type: String },
    warranty: { type: String },
    items: [{
        name: { type: String },
        quantity: { type: Number },
        specs: { type: String }
    }],
    status: { type: String, enum: ['Draft', 'Sent', 'Closed'], default: 'Draft' },
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    // Last AI comparison result, so it survives a page reload
    analysis: { type: mongoose.Schema.Types.Mixed },
    analyzedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const RFP = mongoose.model('RFP', rfpSchema);

export default RFP;
