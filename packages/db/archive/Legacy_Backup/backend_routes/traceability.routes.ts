import { Router } from 'express';
import { traceabilityController } from '../controllers/traceability.controller';
import { authenticate, requireOwner } from '../middleware/auth.middleware';

const router = Router();

// Public Routes
router.get('/track/:code', traceabilityController.trackProduct.bind(traceabilityController));

// Protected Routes (Owner Only)
router.use(authenticate);
router.use(requireOwner);

router.post('/batches', traceabilityController.createBatch.bind(traceabilityController));
router.get('/batches', traceabilityController.getAllBatches.bind(traceabilityController));
router.get('/batches/:id', traceabilityController.getBatchDetails.bind(traceabilityController));
router.get('/qr/:batchCode', traceabilityController.getQRCode.bind(traceabilityController));

export default router;
