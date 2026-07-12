import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAdmin, requireBeekeeper } from '../middleware/role.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication
router.use(authenticate);

// Statistics and activities - relaxed to Beekeeper (Owner) for dashboard visibility
router.get('/stats', requireBeekeeper, adminController.getStats.bind(adminController));
router.get('/activities', requireBeekeeper, adminController.getActivities.bind(adminController));

// User management - keep strictly Admin
router.use(requireAdmin); // All below routes require ADMIN
router.get('/users', adminController.getUsers.bind(adminController));
router.get('/users/:id', adminController.getUserById.bind(adminController));
router.patch('/users/:id/status', adminController.updateUserStatus.bind(adminController));

export default router;
