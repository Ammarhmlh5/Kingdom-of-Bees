import { Router } from 'express';
import { apiaryController } from '../controllers/apiary.controller';
import { InviteController } from '../controllers/invite.controller';
import { JoinController } from '../controllers/join.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
    validateCreateApiary,
    validateUpdateApiary,
    validateDeleteApiary,
    validateGetApiaryById
} from '../middleware/apiary.validation';

const router = Router();

// Public routes (no authentication required)
router.get('/search', InviteController.searchByInviteCode);
router.post('/join', JoinController.joinApiary);

// Apply authentication to protected routes
router.use(authenticate);

router.get('/stats/dashboard', apiaryController.getDashboardStats.bind(apiaryController));
router.get('/', apiaryController.getAll.bind(apiaryController));
router.get('/:id', validateGetApiaryById, apiaryController.getById.bind(apiaryController));
router.post('/', validateCreateApiary, apiaryController.create.bind(apiaryController));
router.put('/:id', validateUpdateApiary, apiaryController.update.bind(apiaryController));
router.delete('/:id', validateDeleteApiary, apiaryController.delete.bind(apiaryController));

// Invite management (owner only)
router.post('/:id/invite', InviteController.generateInvite);
router.delete('/:id/invite', InviteController.revokeInvite);

export default router;
