
import { Request, Response } from 'express';
import { ApiaryService } from '../services/apiary.service';
import { AuthUser, AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';
import { hasApiaryAccess } from '../lib/access';
import { updateDashboardStats } from '../lib/stats';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const apiaryService = new ApiaryService();

export class ApiaryController {

    async getMyApiaries(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const userId = user.id;

            // Fetch owned apiaries
            const ownedApiaries = await prisma.apiary.findMany({
                where: { ownerId: userId, isActive: true },
                include: { _count: { select: { hives: true, members: true } } },
                orderBy: { createdAt: 'desc' },
            });

            // Fetch apiaries where user is an active member
            const memberships = await prisma.apiaryMembership.findMany({
                where: { userId, status: 'ACTIVE' },
                include: {
                    apiary: {
                        include: { _count: { select: { hives: true, members: true } } }
                    }
                }
            });

            const ownedIds = new Set(ownedApiaries.map((a: any) => a.id));

            const ownedWithRole = ownedApiaries.map((a: any) => ({ ...a, userRole: 'owner' }));
            const memberWithRole = memberships
                .filter((m: any) => !ownedIds.has(m.apiary.id) && m.apiary.isActive)
                .map((m: any) => ({ ...m.apiary, userRole: 'assistant' }));

            const apiaries = [...ownedWithRole, ...memberWithRole];
            res.json(apiaries);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch apiaries' });
        }
    }

    async getDetails(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const apiaryId = req.params.apiaryId as string;

            const { hasAccess } = await hasApiaryAccess(user.id, apiaryId);
            if (!hasAccess) {
                return res.status(403).json({ error: 'Apiary not found or access denied' });
            }

            const apiary = await apiaryService.getApiaryDetails(apiaryId, user.id);
            res.json(apiary);
        } catch (error) {
            logger.error(`[ApiaryController] getDetails error for apiaryId=${req.params.apiaryId}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            if (user.role !== 'OWNER' && user.role !== 'ADMIN') { // Only Owners and Admins create apiaries
                return res.status(403).json({ error: 'Only owners can create apiaries' });
            }

            const apiary = await apiaryService.createApiary(user.id, req.body);
            res.status(201).json(apiary);

            updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
        } catch (error) {
            logger.error('Create apiary error:', error);
            res.status(500).json({ error: 'Failed to create apiary', details: (error as Error).message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const apiaryId = req.params.apiaryId as string;

            const { hasAccess, role } = await hasApiaryAccess(user.id, apiaryId);
            if (!hasAccess) {
                return res.status(403).json({ error: 'Apiary not found or access denied' });
            }
            if (role === 'assistant') {
                return res.status(403).json({ error: 'Assistants cannot modify apiary settings' });
            }

            const apiary = await apiaryService.updateApiary(apiaryId, user.id, req.body);
            res.json(apiary);
        } catch (error) {
            res.status(403).json({ error: (error as Error).message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const apiaryId = req.params.apiaryId as string;

            const { hasAccess, role } = await hasApiaryAccess(user.id, apiaryId);
            if (!hasAccess) {
                return res.status(403).json({ error: 'Apiary not found or access denied' });
            }
            if (role === 'assistant') {
                return res.status(403).json({ error: 'Assistants cannot modify apiary settings' });
            }

            await apiaryService.deleteApiary(apiaryId, user.id);
            res.json({ success: true });

            updateDashboardStats(user.id).catch((err) => logger.error('Dashboard stats update failed:', err));
        } catch (error) {
            res.status(403).json({ error: (error as Error).message });
        }
    }

    async getDashboardStats(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const stats = await apiaryService.getDashboardStats(user.id);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }

    async getApiaryStats(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const apiaryId = req.params.apiaryId as string;
            const stats = await apiaryService.getApiaryStats(user.id, apiaryId);
            res.json(stats);
        } catch (error) {
            logger.error(`[ApiaryController] getApiaryStats error for apiaryId=${req.params.apiaryId}:`, error);
            if ((error as Error).message === 'Apiary not found') {
                return res.status(404).json({ error: 'Apiary not found' });
            }
            res.status(500).json({ error: 'Failed to fetch apiary stats' });
        }
    }

    async getWeather(req: Request, res: Response) {
        try {
            const user = (req as AuthenticatedRequest).user as AuthUser;
            const apiaryId = req.params.apiaryId as string;
            const weather = await apiaryService.getWeather(user.id, apiaryId);
            ApiResponse.success(res, weather, 'تم جلب بيانات الطقس بنجاح');
        } catch (error) {
            logger.error('Weather fetch error:', error);
            ApiResponse.error(res, 'فشل في جلب بيانات الطقس');
        }
    }
}
