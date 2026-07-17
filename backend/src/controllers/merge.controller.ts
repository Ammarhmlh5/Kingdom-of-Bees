import { Request, Response } from 'express';
import { mergeService } from '../services/merge.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class MergeController {
  /**
   * GET /api/apiaries/:apiaryId/hives/merge-candidates
   * Get weak hives and merge suggestions
   */
  async getMergeCandidates(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const { season } = req.query;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      // Determine season if not provided
      const currentMonth = new Date().getMonth() + 1;
      const determinedSeason = season as 'SPRING' | 'AUTUMN' || 
        (currentMonth >= 3 && currentMonth <= 5 ? 'SPRING' : 'AUTUMN');

      const candidates = await mergeService.getMergeCandidates(
        apiaryId,
        determinedSeason
      );

      ApiResponse.success(res, { data: candidates, season: determinedSeason });
    } catch (error) {
      logger.error('Error fetching merge candidates:', error);
      ApiResponse.error(res, 'فشل في جلب المرشحين للدمج', 500);
    }
  }

  /**
   * POST /api/apiaries/:apiaryId/hives/:hiveId/merge
   * Execute merge operation
   */
  async executeMerge(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const hiveId = req.params.hiveId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const mergeData = req.body;

      // Validate required fields
      if (!mergeData.targetHiveId) {
        return ApiResponse.error(res, 'يجب تحديد الخلية الهدف', 400);
      }

      if (!mergeData.mergeMethod) {
        return ApiResponse.error(res, 'يجب تحديد طريقة الدمج', 400);
      }

      if (!mergeData.queenKept) {
        return ApiResponse.error(res, 'يجب تحديد الملكة المحتفظ بها', 400);
      }

      const result = await mergeService.executeMerge(
        apiaryId,
        hiveId,
        userId,
        mergeData
      );

      ApiResponse.created(res, result, 'تم دمج الخلايا بنجاح');
    } catch (error) {
      logger.error('Error executing merge:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'فشل في دمج الخلايا', 500);
    }
  }
}

export const mergeController = new MergeController();
