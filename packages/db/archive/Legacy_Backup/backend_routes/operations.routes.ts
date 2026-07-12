import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/apiary/:apiaryId', OperationsController.getApiaryOperations);
router.post('/split', OperationsController.performSplit);
router.post('/merge', OperationsController.performMerge);
router.post('/swarm', OperationsController.recordSwarm);

export default router;
