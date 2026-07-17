import { Request, Response } from 'express';
import { inspectionService } from '../services/inspection.service';
import { hasApiaryAccess } from '../lib/access';
import { updateDashboardStats } from '../lib/stats';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class InspectionController {
  /**
   * GET /api/apiaries/:apiaryId/inspections
   * Get all inspections for an apiary
   */
  async getInspections(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
      if (!hasAccess) {
        return ApiResponse.forbidden(res, 'Access denied');
      }

      const inspections = await inspectionService.getInspectionsByApiary(apiaryId);

      ApiResponse.success(res, { data: inspections, count: inspections.length });
    } catch (error) {
      logger.error('Error fetching inspections:', error);
      ApiResponse.error(res, 'فشل في جلب الفحوصات', 500);
    }
  }

  /**
   * GET /api/apiaries/:apiaryId/hives/inspection-queue
   * Get inspection queue with priority sorting
   */
  async getInspectionQueue(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
      if (!hasAccess) {
        return ApiResponse.forbidden(res, 'Access denied');
      }

      // Update priorities before fetching queue
      await inspectionService.updatePriorities(apiaryId);

      const queue = await inspectionService.getInspectionQueue(apiaryId);

      ApiResponse.success(res, { data: queue, count: queue.length });
    } catch (error) {
      logger.error('Error fetching inspection queue:', error);
      ApiResponse.error(res, 'فشل في جلب قائمة الفحص', 500);
    }
  }

  /**
   * POST /api/apiaries/:apiaryId/hives/:hiveId/inspect
   * Record a new inspection
   */
  async recordInspection(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const hiveId = req.params.hiveId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
      if (!hasAccess) {
        return ApiResponse.forbidden(res, 'Access denied');
      }

      const inspectionData = req.body;

      // Validate required fields
      if (!inspectionData.inspectionDate) {
        return ApiResponse.error(res, 'تاريخ الفحص مطلوب', 400);
      }

      const inspection = await inspectionService.recordInspection(
        apiaryId,
        hiveId,
        userId,
        inspectionData
      );

      ApiResponse.created(res, inspection, 'تم تسجيل الفحص بنجاح');

      updateDashboardStats(userId).catch((err) => logger.error('Dashboard stats update failed:', err));
    } catch (error) {
      logger.error('Error recording inspection:', error);
      ApiResponse.error(res, 'فشل في تسجيل الفحص', 500);
    }
  }

  /**
   * PUT /api/apiaries/:apiaryId/hives/priorities
   * Manually update all hive priorities
   */
  async updatePriorities(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
      if (!hasAccess) {
        return ApiResponse.forbidden(res, 'Access denied');
      }

      await inspectionService.updatePriorities(apiaryId);

      ApiResponse.success(res, null, 'تم تحديث الأولويات بنجاح');
    } catch (error) {
      logger.error('Error updating priorities:', error);
      ApiResponse.error(res, 'فشل في تحديث الأولويات', 500);
    }
  }
}

export const inspectionController = new InspectionController();
