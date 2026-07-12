import { Router } from 'express';
import { feedingController } from '../controllers/feeding.controller';

const router = Router();

// Static routes (must be before :id)
router.get('/types', feedingController.getTypes.bind(feedingController));

// CRUD operations
router.post('/', feedingController.create.bind(feedingController));
router.get('/', feedingController.getAll.bind(feedingController));
router.get('/recommendations/:hiveId', feedingController.getRecommendations.bind(feedingController));
router.get('/summary/:apiaryId', feedingController.getSummary.bind(feedingController));

// Parameterized routes (keep at bottom to avoid collisions)
router.get('/:id', feedingController.getById.bind(feedingController));
router.put('/:id', feedingController.update.bind(feedingController));
router.delete('/:id', feedingController.delete.bind(feedingController));

export default router;
