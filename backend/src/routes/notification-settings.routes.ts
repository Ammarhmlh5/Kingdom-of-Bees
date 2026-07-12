import { Router } from 'express';
import { NotificationSettingsController } from '../controllers/notification-settings.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { updateNotificationSettingsSchema } from '../validators/notification-settings.schema';

const router = Router();
const controller = new NotificationSettingsController();

router.use(requireAuth);

router.get('/settings', controller.getSettings.bind(controller));
router.put('/settings', validate(updateNotificationSettingsSchema), controller.updateSettings.bind(controller));
router.get('/type-configs', controller.getTypeConfigs.bind(controller));

export default router;
