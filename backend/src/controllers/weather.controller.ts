import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

export class WeatherController {
    /**
     * GET /api/weather/current/:apiaryId
     * Get current weather for an apiary
     */
    async getCurrentWeather(req: Request, res: Response) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const { apiaryId } = req.params;

            const weather = await prisma.weatherData.findFirst({
                where: { apiaryId },
                orderBy: { date: 'desc' }
            });

            if (!weather) {
                return ApiResponse.success(res, null, 'لا توجد بيانات طقس متاحة');
            }

            ApiResponse.success(res, weather);
        } catch (error) {
            logger.error('Error fetching weather:', error);
            ApiResponse.error(res, 'فشل في جلب بيانات الطقس', 500);
        }
    }

    /**
     * GET /api/weather/forecast/:apiaryId
     * Get weather forecast for an apiary
     */
    async getForecast(req: Request, res: Response) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const { apiaryId } = req.params;
            const days = parseInt(req.query.days as string) || 7;

            const forecasts = await prisma.weatherData.findMany({
                where: {
                    apiaryId,
                    date: { gte: new Date() }
                },
                orderBy: { date: 'asc' },
                take: days
            });

            ApiResponse.success(res, forecasts);
        } catch (error) {
            logger.error('Error fetching forecast:', error);
            ApiResponse.error(res, 'فشل في جلب التوقعات', 500);
        }
    }
}

export const weatherController = new WeatherController();
