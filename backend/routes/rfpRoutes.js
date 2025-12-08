import express from 'express';
import {
    createRFP,
    getAllRFPs,
    getRFPById,
    sendRFPToVendors,
    updateRFP,
    deleteRFP
} from '../controllers/rfpController.js';

const router = express.Router();

router.post('/', createRFP);
router.get('/', getAllRFPs);
router.get('/:id', getRFPById);
router.post('/send', sendRFPToVendors);
router.put('/:id', updateRFP);
router.delete('/:id', deleteRFP);

export default router;
