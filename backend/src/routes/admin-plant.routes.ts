import { Router } from 'express';
import { AdminPlantController } from '../controllers/admin-plant.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createPlantSchema, updatePlantSchema } from '../validators/plant.schema';

const router = Router();
const controller = new AdminPlantController();

router.use(requireAuth);

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.post('/', validate(createPlantSchema), controller.create.bind(controller));
router.put('/:id', validate(updatePlantSchema), controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.post('/:id/verify', controller.verify.bind(controller));

export default router;
