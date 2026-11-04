import express from 'express';
import {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor
} from '../controllers/vendorController.js';
import { validateObjectId } from '../utils/http.js';

const router = express.Router();

router.param('id', validateObjectId);

router.post('/', createVendor);
router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

export default router;
