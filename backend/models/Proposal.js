import mongoose from 'mongoose';

const proposalSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFP', required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rawEmail: { type: String },
    parsedData: {
        totalPrice: { type: Number },
        currency: { type: String },
        items: [{
            name: { type: String },
            unitPrice: { type: Number },
            quantity: { type: Number },
            totalPrice: { type: Number }
        }],
        deliveryTime: { type: String },
        paymentTerms: { type: String },
        warranty: { type: String },
        notes: { type: String }
    },
    score: { type: Number },
    aiAnalysis: { type: String },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
