import express from 'express';
import {
    createProposal,
    fetchVendorEmailsSSE,
    getProposalsByRFP,
    compareRFPProposals,
    updateProposal,
    deleteProposal
} from '../controllers/proposalController.js';
import { protect, protectSSE } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../utils/http.js';

const router = express.Router();

router.param('id', validateObjectId);
router.param('rfpId', validateObjectId);

// SSE endpoint for real-time progress. EventSource can't send headers, so it uses ?token=
router.get('/fetch-sse/:rfpId', protectSSE, fetchVendorEmailsSSE);

router.post('/', protect, createProposal);
router.get('/rfp/:rfpId', protect, getProposalsByRFP);
router.get('/compare/:rfpId', protect, compareRFPProposals);
router.put('/:id', protect, updateProposal);
router.delete('/:id', protect, deleteProposal);

export default router;
