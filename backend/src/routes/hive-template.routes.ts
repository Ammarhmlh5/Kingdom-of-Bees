import { Router } from 'express';
import { HiveTemplateController } from '../controllers/hive-template.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createHiveTemplateSchema } from '../validators/hive-template.schema';

const router = Router();
const controller = new HiveTemplateController();

router.use(requireAuth);

router.get('/', controller.getAll.bind(controller));
router.post('/', validate(createHiveTemplateSchema), controller.create.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
