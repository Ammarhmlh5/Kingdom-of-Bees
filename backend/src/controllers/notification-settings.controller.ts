import { Request, Response } from 'express';
import { NotificationSettingsService } from '../services/notification-settings.service';
import type { AuthUser, AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

const settingsService = new NotificationSettingsService();

export class NotificationSettingsController {
  async getSettings(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const settings = await settingsService.getSettings(user.id);
      ApiResponse.success(res, settings);
    } catch (error) {
      ApiResponse.error(res, 'فشل في جلب إعدادات الإشعارات');
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const settings = await settingsService.updateSettings(user.id, req.body);
      ApiResponse.success(res, settings, 'تم حفظ إعدادات الإشعارات');
    } catch (error) {
      ApiResponse.error(res, 'فشل في حفظ إعدادات الإشعارات');
    }
  }

  async getTypeConfigs(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const configs = await settingsService.getTypeConfigs(user.id);
      ApiResponse.success(res, configs);
    } catch (error) {
      ApiResponse.error(res, 'فشل في جلب إعدادات أنواع التنبيهات');
    }
  }
}
