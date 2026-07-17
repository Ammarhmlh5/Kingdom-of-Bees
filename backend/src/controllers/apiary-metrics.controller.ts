import { Request, Response } from 'express';
import { apiaryMetricsService } from '../services/apiary-metrics.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class ApiaryMetricsController {
    /**
     * GET /api/apiaries/:apiaryId/metrics
     * Get latest metrics for an apiary
     */
    async getMetrics(req: Request, res: Response) {
        try {
            const apiaryId = req.params.apiaryId as string;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            // Check if metrics need recalculation
            const needsRecalc = await apiaryMetricsService.needsRecalculation(apiaryId);
            
            let metrics;
            if (needsRecalc) {
                // Calculate new metrics
                metrics = await apiaryMetricsService.calculateMetrics(apiaryId);
            } else {
                // Get latest metrics
                metrics = await apiaryMetricsService.getLatestMetrics(apiaryId);
            }

            if (!metrics) {
                return ApiResponse.error(res, 'لم يتم العثور على مقاييس للمنحل', 404);
            }

            ApiResponse.success(res, metrics);
        } catch (error) {
            logger.error('Error fetching apiary metrics:', error);
            ApiResponse.error(res, 'فشل في جلب مقاييس المنحل', 500);
        }
    }

    /**
     * POST /api/apiaries/:apiaryId/metrics/calculate
     * Force recalculation of metrics
     */
    async calculateMetrics(req: Request, res: Response) {
        try {
            const apiaryId = req.params.apiaryId as string;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const metrics = await apiaryMetricsService.calculateMetrics(apiaryId);

            if (!metrics) {
                return ApiResponse.error(res, 'لا توجد خلايا نشطة في المنحل', 404);
            }

            ApiResponse.success(res, metrics, 'تم حساب المقاييس بنجاح');
        } catch (error) {
            logger.error('Error calculating apiary metrics:', error);
            ApiResponse.error(res, 'فشل في حساب مقاييس المنحل', 500);
        }
    }

    /**
     * GET /api/apiaries/:apiaryId/metrics/history
     * Get metrics history for an apiary
     */
    async getMetricsHistory(req: Request, res: Response) {
        try {
            const apiaryId = req.params.apiaryId as string;
            const { days } = req.query;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const daysNumber = days ? parseInt(days as string) : 30;
            const history = await apiaryMetricsService.getMetricsHistory(apiaryId, daysNumber);

            ApiResponse.success(res, { data: history, count: history.length });
        } catch (error) {
            logger.error('Error fetching metrics history:', error);
            ApiResponse.error(res, 'فشل في جلب سجل المقاييس', 500);
        }
    }
}

export const apiaryMetricsController = new ApiaryMetricsController();
