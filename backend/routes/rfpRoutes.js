import express from 'express';
import {
    createRFP,
    getAllRFPs,
    getRFPById,
    sendRFPToVendors,
    updateRFP,
    deleteRFP
} from '../controllers/rfpController.js';
import { validateObjectId } from '../utils/http.js';

const router = express.Router();

router.param('id', validateObjectId);

router.post('/', createRFP);
router.get('/', getAllRFPs);
router.post('/send', sendRFPToVendors);
router.get('/:id', getRFPById);
router.put('/:id', updateRFP);
router.delete('/:id', deleteRFP);

export default router;
