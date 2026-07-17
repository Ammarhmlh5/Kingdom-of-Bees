import { Request, Response } from 'express';
import { operationsService } from '../services/operations.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class OperationsController {
  /**
   * GET /api/operations/daily
   * Get daily operations with filters
   */
  async getDailyOperations(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const filters: any = {};

      // Extract filters from query params
      if (req.query.apiaryId) filters.apiaryId = req.query.apiaryId as string;
      if (req.query.operationType) filters.operationType = req.query.operationType as string;
      if (req.query.performedBy) filters.performedBy = req.query.performedBy as string;
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const operations = await operationsService.getDailyOperations(filters);

      ApiResponse.success(res, { data: operations, count: operations.length });
    } catch (error) {
      logger.error('Error fetching daily operations:', error);
      ApiResponse.error(res, 'فشل في جلب العمليات اليومية', 500);
    }
  }

  /**
   * GET /api/operations/stats
   * Get operation statistics
   */
  async getOperationStats(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const filters: any = {};

      if (req.query.apiaryId) filters.apiaryId = req.query.apiaryId as string;
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const stats = await operationsService.getOperationStats(filters);

      ApiResponse.success(res, stats);
    } catch (error) {
      logger.error('Error fetching operation stats:', error);
      ApiResponse.error(res, 'فشل في جلب إحصائيات العمليات', 500);
    }
  }

  /**
   * DELETE /api/operations/:operationId
   * Delete operation (rollback)
   */
  async deleteOperation(req: Request, res: Response) {
    try {
      const operationId = req.params.operationId as string;
      const userId = (req as AuthenticatedRequest).user?.id;

      if (!userId) {
        return ApiResponse.unauthorized(res);
      }

      const result = await operationsService.deleteOperation(operationId, userId);

      ApiResponse.success(res, result, 'تم حذف العملية بنجاح');
    } catch (error) {
      logger.error('Error deleting operation:', error);
      ApiResponse.error(res, error instanceof Error ? error.message : 'فشل في حذف العملية', 500);
    }
  }

  /**
   * GET /api/operations/types
   * Get all operation types with labels
   */
    async getOperationTypes(_req: Request, res: Response) {
    try {
      const types = [
        'FRAME_TRANSFER',
        'FOUNDATION_ADD',
        'QUEEN_REPLACE',
        'SPLIT',
        'MERGE',
        'ADD_SUPER',
        'INSPECTION',
        'FEEDING',
        'TREATMENT',
        'HARVEST'
      ];

      const typesWithLabels = types.map(type => ({
        value: type,
        label: operationsService.getOperationTypeLabel(type)
      }));

      ApiResponse.success(res, typesWithLabels);
    } catch (error) {
      logger.error('Error fetching operation types:', error);
      ApiResponse.error(res, 'فشل في جلب أنواع العمليات', 500);
    }
  }
}

export const operationsController = new OperationsController();
