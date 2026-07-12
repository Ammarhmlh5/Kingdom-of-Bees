import { Router } from 'express';
import { financialsController } from '../controllers/financials.controller';
import { requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { createFinancialRecordSchema } from '../validators/financials.schema';

const router = Router({ mergeParams: true });

router.use(requireApiaryAccess);

router.get('/', financialsController.getFinancials.bind(financialsController));
router.post('/', validate(createFinancialRecordSchema), financialsController.createRecord.bind(financialsController));
router.delete('/:recordId', financialsController.deleteRecord.bind(financialsController));

export default router;
