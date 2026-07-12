import { Router } from 'express';
import { hiveTemplateController } from '../controllers/hive-template.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('OWNER', 'WORKER', 'ADMIN')); // Allow all roles for now, restrict if needed

router.post('/', hiveTemplateController.create);
router.get('/', hiveTemplateController.getAll);
router.delete('/:id', hiveTemplateController.delete);

export default router;
