import { Request, Response } from 'express';
import { assessmentService } from '../services/assessment.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class AssessmentController {
    /**
     * Record flight assessment
     */
    async recordFlightAssessment(req: Request, res: Response) {
        try {
            const hiveId = req.params.hiveId as string;
            const apiaryId = (req as AuthenticatedRequest).apiaryId || (req.params.apiaryId as string);
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res, 'غير مصرح');
            }

            if (!apiaryId) {
                return ApiResponse.badRequest(res, 'معرف المنحل مطلوب');
            }

            const result = await assessmentService.recordFlightAssessment(
                apiaryId,
                hiveId,
                userId,
                req.body
            );

            ApiResponse.success(res, result, 'تم حفظ تقييم السروح بنجاح');
        } catch (error) {
            logger.error('Error recording flight assessment:', error);
            ApiResponse.error(res, 'فشل في حفظ تقييم السروح', 500);
        }
    }

    /**
     * Record pollen assessment
     */
    async recordPollenAssessment(req: Request, res: Response) {
        try {
            const hiveId = req.params.hiveId as string;
            const apiaryId = (req as AuthenticatedRequest).apiaryId || (req.params.apiaryId as string);
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res, 'غير مصرح');
            }

            if (!apiaryId) {
                return ApiResponse.badRequest(res, 'معرف المنحل مطلوب');
            }

            const result = await assessmentService.recordPollenAssessment(
                apiaryId,
                hiveId,
                userId,
                req.body
            );

            ApiResponse.success(res, result, 'تم حفظ تقييم حبوب اللقاح بنجاح');
        } catch (error) {
            logger.error('Error recording pollen assessment:', error);
            ApiResponse.error(res, 'فشل في حفظ تقييم حبوب اللقاح', 500);
        }
    }

    /**
     * Record weather data
     */
    async recordWeatherData(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId || (req.params.apiaryId as string);
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res, 'غير مصرح');
            }

            if (!apiaryId) {
                return ApiResponse.badRequest(res, 'معرف المنحل مطلوب');
            }

            const result = await assessmentService.recordWeatherData(
                apiaryId,
                userId,
                req.body
            );

            ApiResponse.success(res, result, 'تم حفظ بيانات الطقس بنجاح');
        } catch (error) {
            logger.error('Error recording weather data:', error);
            ApiResponse.error(res, 'فشل في حفظ بيانات الطقس', 500);
        }
    }

    /**
     * Auto-fetch weather data for a specific date
     */
    async recordAutoWeatherData(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId || (req.params.apiaryId as string);
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res, 'غير مصرح');
            }

            if (!apiaryId) {
                return ApiResponse.badRequest(res, 'معرف المنحل مطلوب');
            }

            const { date } = req.body;
            if (!date) {
                return ApiResponse.badRequest(res, 'التاريخ مطلوب');
            }

            const result = await assessmentService.recordAutoWeatherData(
                apiaryId,
                userId,
                date
            );

            ApiResponse.success(res, result, 'تم جلب وحفظ بيانات الطقس تلقائياً');
        } catch (error: any) {
            logger.error('Error auto-recording weather data:', error);
            const message = error?.message || 'فشل في جلب بيانات الطقس';
            ApiResponse.error(res, message, 500);
        }
    }
}

export const assessmentController = new AssessmentController();
