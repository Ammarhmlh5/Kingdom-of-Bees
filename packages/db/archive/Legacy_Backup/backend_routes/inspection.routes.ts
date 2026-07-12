import { Router } from 'express';
import { inspectionController } from '../controllers/inspection.controller';

const router = Router();

router.get('/', inspectionController.getAll.bind(inspectionController));
router.get('/:id', inspectionController.getById.bind(inspectionController));
router.post('/', inspectionController.create.bind(inspectionController));

export default router;
