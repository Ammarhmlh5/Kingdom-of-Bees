import { Router } from 'express';
import { PlantController } from '../controllers/plant.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';

const router = Router();
const controller = new PlantController();

// All plant routes require authentication
router.use(requireAuth);

// Static routes first (MUST be before :apiaryId to prevent param hijacking)
router.get('/plants/search', controller.search.bind(controller));

// Apiary-scoped routes
router.get('/apiaries/:apiaryId/plants', requireApiaryAccess, controller.listByApiary.bind(controller));
router.post('/apiaries/:apiaryId/plants', requireApiaryAccess, controller.add.bind(controller));
router.put('/apiaries/:apiaryId/plants/:plantId', requireApiaryAccess, controller.update.bind(controller));
router.delete('/apiaries/:apiaryId/plants/:plantId', requireApiaryAccess, controller.remove.bind(controller));

export default router;
