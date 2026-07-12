
import { Request, Response } from 'express';
import { HiveService } from '../services/hive.service';
import { hasApiaryAccess } from '../lib/access';
import { updateDashboardStats } from '../lib/stats';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

const hiveService = new HiveService();

export class HiveController {

    async getHives(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const hives = await hiveService.getHives(apiaryId);
            ApiResponse.success(res, hives);
        } catch (error) {
            logger.error(`[HiveController] getHives error for apiaryId=${(req as AuthenticatedRequest).apiaryId!}:`, error);
            ApiResponse.error(res, 'Failed to fetch hives', 500);
        }
    }

    async getDetails(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const hive = await hiveService.getHiveDetails(apiaryId, hiveId);
            ApiResponse.success(res, hive);
        } catch (error) {
            ApiResponse.error(res, 'Hive not found', 404);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            logger.info('[HiveController] Create request - apiaryId:', apiaryId, 'body:', req.body);

            const hive = await hiveService.createHive(apiaryId, req.body);
            if (!hive) return ApiResponse.error(res, 'Failed to create hive', 500);

            logger.info('[HiveController] Hive created successfully:', hive.id);
            ApiResponse.created(res, hive);

            updateDashboardStats(userId).catch((err) => logger.error('Dashboard stats update failed:', err));
        } catch (error) {
            logger.error('[HiveController] Create Error:', error);

            // Check for unique constraint violation
            if (error instanceof Error) {
                if (error.message.includes('Unique constraint')) {
                    return ApiResponse.error(res, 'رقم الخلية أو الاسم مستخدم بالفعل في هذا المنحل', 400);
                }
            }

            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const hive = await hiveService.updateHive(apiaryId, hiveId, req.body);
            ApiResponse.success(res, hive);
        } catch (error) {
            ApiResponse.error(res, 'Failed to update hive', 500);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            await hiveService.deleteHive(apiaryId, hiveId);
            ApiResponse.success(res, null);

            updateDashboardStats(userId).catch((err) => logger.error('Dashboard stats update failed:', err));
        } catch (error) {
            ApiResponse.error(res, 'Failed to delete hive', 500);
        }
    }

    async updateFrames(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const { frames } = req.body; // Array of frame objects
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            if (!Array.isArray(frames)) return ApiResponse.error(res, 'Frames must be an array', 400);

            const result = await hiveService.updateFrames(apiaryId, hiveId, frames);
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, 'Failed to update frames', 500);
        }
    }

    async getFrames(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            logger.info(`[HiveController] getFrames called - apiaryId: ${apiaryId}, hiveId: ${hiveId}`);

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const frames = await hiveService.getHiveFrames(apiaryId, hiveId);
            logger.info(`[HiveController] getFrames returned ${frames.length} frames`);
            ApiResponse.success(res, { frames });
        } catch (error) {
            logger.error('[HiveController] getFrames error:', error);
            ApiResponse.error(res, 'Failed to fetch frames', 500);
        }
    }

    // ==========================================
    // NEW OPERATIONS
    // ==========================================

    async setup(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const result = await hiveService.setupHive(apiaryId, hiveId, req.body);
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async split(req: Request, res: Response) {
        logger.info(`[HiveController] Split Request:`, req.params, req.body);
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const result = await hiveService.splitHive(apiaryId, hiveId, req.body);
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async merge(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const result = await hiveService.mergeHives(apiaryId, hiveId, req.body);
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async addSuper(req: Request, res: Response) {
        try {
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const { hiveId } = req.params;
            const userId = (req as AuthenticatedRequest).user!.id;

            const { hasAccess } = await hasApiaryAccess(userId, apiaryId);
            if (!hasAccess) {
                return ApiResponse.forbidden(res, 'Access denied');
            }

            const result = await hiveService.addSuper(apiaryId, hiveId, req.body);
            ApiResponse.success(res, result);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }
}
