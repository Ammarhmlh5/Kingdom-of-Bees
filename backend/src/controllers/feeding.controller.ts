import { Request, Response } from 'express';
import { feedingService } from '../services/feeding.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class FeedingController {

    async getHistory(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const history = await feedingService.getHistory(apiaryId);
            ApiResponse.success(res, history);
        } catch (error) {
            ApiResponse.error(res, 'Failed to fetch feeding history', 500);
        }
    }

    async getTypes(_req: Request, res: Response) {
        try {
            const types = await feedingService.getFeedingTypes();
            ApiResponse.success(res, types);
        } catch (error) {
            ApiResponse.error(res, 'Failed to fetch feeding types', 500);
        }
    }

    async feedHive(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { hiveId, feedingDate, feedingLocation, contentType, quantityKg, purpose, notes } = req.body;

            const record = await feedingService.feedHive(apiaryId, user.id, {
                hiveId,
                feedingDate,
                feedingLocation,
                contentType,
                quantityKg: Number(quantityKg),
                purpose,
                notes
            });
            ApiResponse.created(res, record);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async feedApiary(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { feedingDate, feedingLocation, contentType, quantityKg, purpose, notes } = req.body;

            const result = await feedingService.feedApiary(apiaryId, user.id, {
                feedingDate,
                feedingLocation,
                contentType,
                quantityKg: Number(quantityKg),
                purpose,
                notes
            });
            ApiResponse.created(res, result);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }
}

export const feedingController = new FeedingController();
