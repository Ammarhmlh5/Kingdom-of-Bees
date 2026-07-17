import { Request, Response } from 'express';
import { AlertService } from '../services/alert.service';
import type { AuthUser, AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';
import { updateDashboardStats } from '../lib/stats';
import { logger } from '../utils/logger';

interface AlertQueryFilters {
  status?: string;
  priority?: string;
  alertType?: string;
  apiaryId?: string;
  hiveId?: string;
}

const alertService = new AlertService();

export class AlertController {
  async getAll(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const { status, priority, alertType, apiaryId, hiveId } = req.query as AlertQueryFilters;

      const alerts = await alertService.getAlerts(user.id, {
        status: status as any,
        priority: priority as any,
        alertType,
        apiaryId,
        hiveId,
      });

      ApiResponse.success(res, alerts);
    } catch (error) {
      ApiResponse.error(res, 'فشل في جلب التنبيهات');
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const { apiaryId } = req.query as AlertQueryFilters;

      const stats = await alertService.getAlertStats(user.id, apiaryId as string);
      ApiResponse.success(res, stats);
    } catch (error) {
      ApiResponse.error(res, 'فشل في جلب إحصائيات التنبيهات');
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const id = req.params.id as string;

      const alert = await alertService.getAlertById(id, user.id);
      ApiResponse.success(res, alert);
    } catch (error) {
      ApiResponse.error(res, 'التنبيه غير موجود', 404);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const data = req.body;

      if (!data.alertType || !data.title || !data.message) {
        return ApiResponse.badRequest(res, 'نوع التنبيه والعنوان والرسالة مطلوبة');
      }

      const alert = await alertService.createAlert({
        ...data,
        userId: data.userId || user.id,
      });

      updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
      ApiResponse.created(res, alert, 'تم إنشاء التنبيه بنجاح');
    } catch (error) {
      ApiResponse.error(res, 'فشل في إنشاء التنبيه');
    }
  }

  async acknowledge(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const id = req.params.id as string;

      const result = await alertService.updateAlertStatus(id, 'ACKNOWLEDGED', user.id);
      updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
      ApiResponse.success(res, result, 'تم تأكيد استلام التنبيه');
    } catch (error) {
      ApiResponse.error(res, 'فشل في تأكيد التنبيه');
    }
  }

  async dismiss(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const id = req.params.id as string;
      const result = await alertService.updateAlertStatus(id, 'DISMISSED');
      updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
      ApiResponse.success(res, result, 'تم تجاهل التنبيه');
    } catch (error) {
      ApiResponse.error(res, 'فشل في تجاهل التنبيه');
    }
  }

  async resolve(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await alertService.updateAlertStatus(id, 'RESOLVED');
      ApiResponse.success(res, result, 'تم حل التنبيه');
    } catch (error) {
      ApiResponse.error(res, 'فشل في حل التنبيه');
    }
  }

  async dismissAll(req: Request, res: Response) {
    try {
      const user = (req as AuthenticatedRequest).user as AuthUser;
      const { apiaryId } = req.query as AlertQueryFilters;

      const result = await alertService.dismissAll(user.id, apiaryId as string);
      ApiResponse.success(res, result, `تم تجاهل ${result.dismissedCount} تنبيه`);
    } catch (error) {
      ApiResponse.error(res, 'فشل في تجاهل جميع التنبيهات');
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await alertService.deleteAlert(id);
      ApiResponse.success(res, null, 'تم حذف التنبيه');
    } catch (error) {
      ApiResponse.error(res, 'فشل في حذف التنبيه');
    }
  }
}
