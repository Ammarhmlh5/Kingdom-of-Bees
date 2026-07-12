/**
 * User Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// GET /api/users/me
router.get('/me', userController.getMe);

// PUT /api/users/me
router.put('/me', userController.updateMe);

// GET /api/users/:id
router.get('/:id', userController.getById);

// GET /api/users/me/notifications
router.get('/me/notifications', userController.getNotifications);

// PUT /api/users/me/notifications/:id/read
router.put('/me/notifications/:id/read', userController.markNotificationRead);

export default router;

