
import { Router } from 'express';
import { HarvestController } from '../controllers/harvest.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { recordHarvestSchema, recordHoneySchema } from '../validators/harvest.schema';

const router = Router({ mergeParams: true });
const controller = new HarvestController();

router.use(requireAuth);

// Global Routes (No Apiary Required)
router.get('/my', controller.getMyHarvests);

// Apiary Context Routes
router.get('/', requireApiaryAccess, controller.getHistory);
router.post('/', requireApiaryAccess, validate(recordHarvestSchema), controller.recordHarvest);
router.post('/honey', requireApiaryAccess, validate(recordHoneySchema), controller.recordHoney);

export default router;
