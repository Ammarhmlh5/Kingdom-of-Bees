import { Request, Response } from 'express';
import { inspectionScheduleService } from '../services/inspectionSchedule.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class InspectionScheduleController {
  /**
   * GET /api/hives/:hiveId/schedules
   * عرض جداول فحص خلية محددة
   */
  async getByHiveId(req: Request, res: Response) {
    try {
      const hiveId = req.params.hiveId as string;
      const schedules = await inspectionScheduleService.getByHiveId(hiveId);
      
      ApiResponse.success(res, schedules);
    } catch (error) {
      logger.error('Error fetching hive schedules:', error);
      ApiResponse.error(res, 'فشل في جلب الجداول', 500);
    }
  }

  /**
   * GET /api/apiaries/:apiaryId/schedules
   * عرض جميع جداول المنحل
   */
  async getByApiaryId(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const schedules = await inspectionScheduleService.getAll(apiaryId);
      
      ApiResponse.success(res, schedules);
    } catch (error) {
      logger.error('Error fetching apiary schedules:', error);
      ApiResponse.error(res, 'فشل في جلب الجداول', 500);
    }
  }

  /**
   * GET /api/schedules/upcoming
   * عرض الجداول القادمة
   */
  async getUpcoming(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const schedules = await inspectionScheduleService.getUpcoming(limit);
      
      ApiResponse.success(res, schedules);
    } catch (error) {
      logger.error('Error fetching upcoming schedules:', error);
      ApiResponse.error(res, 'فشل في جلب الجداول القادمة', 500);
    }
  }

  /**
   * GET /api/schedules/overdue
   * عرض الجداول المتأخرة
   */
  async getOverdue(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const schedules = await inspectionScheduleService.getOverdue(limit);
      
      ApiResponse.success(res, schedules);
    } catch (error) {
      logger.error('Error fetching overdue schedules:', error);
      ApiResponse.error(res, 'فشل في جلب الجداول المتأخرة', 500);
    }
  }

  /**
   * POST /api/schedules
   * إنشاء جدول جديد
   */
  async create(req: Request, res: Response) {
    try {
      const { hiveId, settingId, scheduledDate, notes } = req.body;
      
      if (!hiveId || !settingId || !scheduledDate) {
        return ApiResponse.error(res, 'يرجى إدخال جميع البيانات المطلوبة', 400);
      }
      
      const schedule = await inspectionScheduleService.create({
        hiveId,
        settingId,
        scheduledDate: new Date(scheduledDate),
        notes
      });
      
      ApiResponse.success(res, schedule, 'تم إنشاء الجدول بنجاح');
    } catch (error) {
      logger.error('Error creating schedule:', error);
      ApiResponse.error(res, 'فشل في إنشاء الجدول', 500);
    }
  }

  /**
   * PUT /api/schedules/:id/complete
   * تحديد الجدول كمكتمل
   */
  async complete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const schedule = await inspectionScheduleService.complete(id);
      
      ApiResponse.success(res, schedule, 'تم تحديد الفحص كمكتمل');
    } catch (error) {
      logger.error('Error completing schedule:', error);
      ApiResponse.error(res, 'فشل في تحديد الفحص كمكتمل', 500);
    }
  }

  /**
   * PUT /api/schedules/:id/cancel
   * إلغاء الجدول
   */
  async cancel(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const schedule = await inspectionScheduleService.cancel(id);
      
      ApiResponse.success(res, schedule, 'تم إلغاء الجدول');
    } catch (error) {
      logger.error('Error cancelling schedule:', error);
      ApiResponse.error(res, 'فشل في إلغاء الجدول', 500);
    }
  }

  /**
   * DELETE /api/schedules/:id
   * حذف الجدول
   */
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await inspectionScheduleService.delete(id);
      
      ApiResponse.success(res, null, 'تم حذف الجدول');
    } catch (error) {
      logger.error('Error deleting schedule:', error);
      ApiResponse.error(res, 'فشل في حذف الجدول', 500);
    }
  }
}

export const inspectionScheduleController = new InspectionScheduleController();