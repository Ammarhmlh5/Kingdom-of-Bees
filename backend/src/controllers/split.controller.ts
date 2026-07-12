import { Request, Response } from 'express';
import { splitService } from '../services/split.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class SplitController {
  /**
   * GET /api/apiaries/:apiaryId/hives/split-candidates
   * Get hives ready for splitting
   */
  async getSplitCandidates(req: Request, res: Response) {
    try {
      const { apiaryId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const candidates = await splitService.getSplitCandidates(apiaryId);

      ApiResponse.success(res, { data: candidates, count: candidates.length });
    } catch (error) {
      logger.error('Error fetching split candidates:', error);
      ApiResponse.error(res, 'فشل في جلب المرشحين للتقسيم', 500);
    }
  }

  /**
   * POST /api/apiaries/:apiaryId/hives/:hiveId/split
   * Execute split operation
   */
  async executeSplit(req: Request, res: Response) {
    try {
      const { apiaryId, hiveId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const splitData = req.body;

      // Validate required fields
      if (!splitData.newHiveNumber) {
        return ApiResponse.error(res, 'رقم الخلية الجديدة مطلوب', 400);
      }

      if (!splitData.framesTransferred || splitData.framesTransferred.length === 0) {
        return ApiResponse.error(res, 'يجب تحديد الإطارات المنقولة', 400);
      }

      if (!splitData.queenLocation) {
        return ApiResponse.error(res, 'يجب تحديد موقع الملكة', 400);
      }

      const result = await splitService.executeSplit(
        apiaryId,
        hiveId,
        userId,
        splitData
      );

      ApiResponse.created(res, result, 'تم تقسيم الخلية بنجاح');
    } catch (error) {
      logger.error('Error executing split:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'فشل في تقسيم الخلية', 500);
    }
  }
}

export const splitController = new SplitController();
