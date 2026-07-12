import { Router } from 'express';
import { QueenController } from '../controllers/queen.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', QueenController.getQueens);
router.get('/:id', QueenController.getQueen);
router.post('/', QueenController.createQueen);
router.put('/:id', QueenController.updateQueen);
router.delete('/:id', QueenController.deleteQueen);

export default router;
