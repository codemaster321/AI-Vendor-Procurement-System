import express from 'express';
import {
    createProposal,
    fetchVendorEmails,
    getProposalsByRFP,
    compareRFPProposals,
    updateProposal,
    deleteProposal
} from '../controllers/proposalController.js';

const router = express.Router();

router.post('/', createProposal);
router.get('/rfp/:rfpId', getProposalsByRFP);
router.post('/fetch/:rfpId', fetchVendorEmails);
router.get('/compare/:rfpId', compareRFPProposals);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

export default router;
