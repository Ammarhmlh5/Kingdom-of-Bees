import { Router } from 'express';
import { hiveController } from '../controllers/hive.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get('/', hiveController.getAll.bind(hiveController));
router.get('/:id', hiveController.getById.bind(hiveController));
router.post('/', hiveController.create.bind(hiveController));
router.put('/:id', hiveController.update.bind(hiveController));
router.post('/:id/setup', hiveController.setupHive.bind(hiveController));
router.post('/:id/split', hiveController.splitHive.bind(hiveController));
router.post('/:id/super', hiveController.addSuper.bind(hiveController));
router.post('/:id/merge', hiveController.mergeHives.bind(hiveController));
router.delete('/:id', hiveController.delete.bind(hiveController));

export default router;
