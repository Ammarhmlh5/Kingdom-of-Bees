
import { Request, Response } from 'express';
import { HarvestService } from '../services/harvest.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';
import { updateDashboardStats } from '../lib/stats';

const service = new HarvestService();

export class HarvestController {

    async getHistory(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const history = await service.getHistory(apiaryId);
            ApiResponse.success(res, history);
        } catch (error) {
            ApiResponse.error(res, 'Failed to fetch harvest history', 500);
        }
    }

    async getMyHarvests(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user!;
            const history = await service.getMyHarvests(user.id);
            ApiResponse.success(res, history);
        } catch (error) {
            logger.error(String(error));
            ApiResponse.error(res, 'Failed to fetch my harvests', 500);
        }
    }


    async recordHoney(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { date, items, notes } = req.body;

            const record = await service.recordHoneyHarvest(apiaryId, user.id, {
                date, items, notes
            });
            updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
            ApiResponse.created(res, record);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async recordHarvest(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { harvestType, harvestDate, totalQuantity, unit, hiveId, notes } = req.body;

            const record = await service.recordHarvest(apiaryId, user.id, {
                harvestType, harvestDate, totalQuantity, unit, hiveId, notes
            });
            updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
            ApiResponse.created(res, record);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }
}
