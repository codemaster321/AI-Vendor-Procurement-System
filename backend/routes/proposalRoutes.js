import express from 'express';
import {
    createProposal,
    fetchVendorEmailsSSE,
    getProposalsByRFP,
    compareRFPProposals,
    updateProposal,
    deleteProposal
} from '../controllers/proposalController.js';

const router = express.Router();

router.post('/', createProposal);
router.get('/rfp/:rfpId', getProposalsByRFP);
router.get('/fetch-sse/:rfpId', fetchVendorEmailsSSE); // SSE endpoint for real-time progress
router.get('/compare/:rfpId', compareRFPProposals);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

export default router;
