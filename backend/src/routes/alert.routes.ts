import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createAlertSchema } from '../validators/alert.schema';

const router = Router();
const controller = new AlertController();

router.use(requireAuth);

router.get('/', controller.getAll.bind(controller));
router.get('/stats', controller.getStats.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', validate(createAlertSchema), controller.create.bind(controller));
router.put('/:id/acknowledge', controller.acknowledge.bind(controller));
router.put('/:id/dismiss', controller.dismiss.bind(controller));
router.put('/:id/resolve', controller.resolve.bind(controller));
router.post('/dismiss-all', controller.dismissAll.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
