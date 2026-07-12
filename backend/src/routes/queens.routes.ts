import { Router } from 'express';
import { queensController } from '../controllers/queens.controller';
import { requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createQueenSchema } from '../validators/queens.schema';

const router = Router({ mergeParams: true });

router.use(requireApiaryAccess);

router.get('/', queensController.getQueens.bind(queensController));
router.post('/', validate(createQueenSchema), queensController.createQueen.bind(queensController));
router.delete('/:queenId', queensController.deleteQueen.bind(queensController));

export default router;
