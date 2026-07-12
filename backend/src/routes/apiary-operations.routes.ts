import { Router } from 'express';
import { apiaryOperationsController } from '../controllers/apiary-operations.controller';
import { requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { updateOperationSchema } from '../validators/apiary-operations.schema';

const router = Router({ mergeParams: true });

router.use(requireApiaryAccess);

router.get('/', apiaryOperationsController.getOperations.bind(apiaryOperationsController));
router.put('/:operationId', validate(updateOperationSchema), apiaryOperationsController.updateOperation.bind(apiaryOperationsController));
router.delete('/:operationId', apiaryOperationsController.deleteOperation.bind(apiaryOperationsController));

export default router;
