import { Request, Response } from 'express';
import { analyticsMatchingService } from '../services/analytics-matching.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export const getApiaryAnalytics = async (req: Request, res: Response) => {
    try {
        const apiaryId = req.params.apiaryId as string;
        const { hiveId } = req.query;

        const summary = await analyticsMatchingService.getAnalyticsSummary(
            apiaryId,
            hiveId as string | undefined
        );

        return ApiResponse.success(res, summary);
    } catch (error: any) {
        logger.error('[AnalyticsController] getApiaryAnalytics error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
};

