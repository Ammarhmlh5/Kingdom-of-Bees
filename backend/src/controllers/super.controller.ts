import { Request, Response } from 'express';
import { superService } from '../services/super.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class SuperController {
  /**
   * GET /api/apiaries/:apiaryId/hives/super-candidates
   * Get hives ready for supers
   */
  async getSuperCandidates(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const result = await superService.getSuperCandidates(apiaryId);

      ApiResponse.success(res, result);
    } catch (error) {
      logger.error('Error fetching super candidates:', error);
      ApiResponse.error(res, 'فشل في جلب المرشحين للعاسلات', 500);
    }
  }

  /**
   * POST /api/apiaries/:apiaryId/hives/:hiveId/super
   * Add super to hive
   */
  async addSuper(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const hiveId = req.params.hiveId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const superData = req.body;

      // Validate required fields
      if (!superData.operationType) {
        return ApiResponse.error(res, 'يجب تحديد نوع العملية', 400);
      }

      if (!superData.framesInSuper || superData.framesInSuper < 1) {
        return ApiResponse.error(res, 'يجب تحديد عدد الإطارات في العاسلة', 400);
      }

      const result = await superService.addSuper(
        apiaryId,
        hiveId,
        userId,
        superData
      );

      ApiResponse.created(res, result, 'تم إضافة العاسلة بنجاح');
    } catch (error) {
      logger.error('Error adding super:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'فشل في إضافة العاسلة', 500);
    }
  }
}

export const superController = new SuperController();
