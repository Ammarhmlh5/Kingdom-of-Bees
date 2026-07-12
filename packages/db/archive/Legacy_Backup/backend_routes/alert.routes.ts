import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';

const router = Router();

router.get('/', alertController.getAll.bind(alertController));
router.post('/', alertController.create.bind(alertController));
router.put('/:id', alertController.updateStatus.bind(alertController));

export default router;
