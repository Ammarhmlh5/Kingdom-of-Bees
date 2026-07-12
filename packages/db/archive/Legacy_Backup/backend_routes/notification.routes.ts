import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

// Notifications CRUD
router.get('/', notificationController.getAll.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.get('/:id', notificationController.getById.bind(notificationController));
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));
router.put('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', notificationController.delete.bind(notificationController));
router.delete('/read/all', notificationController.deleteAllRead.bind(notificationController));

// Settings
router.get('/settings/me', notificationController.getSettings.bind(notificationController));
router.put('/settings/me', notificationController.updateSettings.bind(notificationController));

export default router;
