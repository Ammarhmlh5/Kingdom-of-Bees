import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

export class AdminLogsController {
    /**
     * GET /api/admin/logs
     * Get system activity logs with optional filters
     */
    async getLogs(req: Request, res: Response) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            // Check if user is admin
            const user = await prisma.userProfile.findUnique({
                where: { id: userId },
                select: { userType: true }
            });

            if (user?.userType !== 'ADMIN') {
                return ApiResponse.forbidden(res, 'ليس لديك صلاحية للوصول إلى هذه البيانات');
            }

            const { page = '1', limit = '50', action, resourceType, userId: filterUserId } = req.query;

            const pageNum = parseInt(page as string) || 1;
            const limitNum = Math.min(parseInt(limit as string) || 50, 100);
            const skip = (pageNum - 1) * limitNum;

            // Build filter
            const where: any = {};
            if (action) where.action = action;
            if (resourceType) where.resourceType = resourceType;
            if (filterUserId) where.userId = filterUserId;

            // Get logs with user info
            const [logs, total] = await Promise.all([
                prisma.userActivityLog.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limitNum
                }),
                prisma.userActivityLog.count({ where })
            ]);

            // Transform logs to match frontend interface
            const transformedLogs = logs.map((log: any) => ({
                id: log.id,
                action: log.action,
                resourceType: log.resourceType,
                resourceId: log.resourceId,
                userId: log.userId,
                userName: log.user?.fullName || log.user?.email || 'غير معروف',
                details: log.details,
                ipAddress: log.ipAddress,
                createdAt: log.createdAt.toISOString()
            }));

            ApiResponse.success(res, {
                logs: transformedLogs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
        } catch (error) {
            logger.error('Error fetching admin logs:', error);
            ApiResponse.error(res, 'فشل في جلب سجلات النشاط', 500);
        }
    }

    /**
     * GET /api/admin/logs/stats
     * Get log statistics
     */
    async getLogStats(req: Request, res: Response) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const user = await prisma.userProfile.findUnique({
                where: { id: userId },
                select: { userType: true }
            });

            if (user?.userType !== 'ADMIN') {
                return ApiResponse.forbidden(res, 'ليس لديك صلاحية للوصول إلى هذه البيانات');
            }

            const now = new Date();
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const [totalLogs, logs24h, logs7d, topActions] = await Promise.all([
                prisma.userActivityLog.count(),
                prisma.userActivityLog.count({ where: { createdAt: { gte: last24h } } }),
                prisma.userActivityLog.count({ where: { createdAt: { gte: last7d } } }),
                prisma.userActivityLog.groupBy({
                    by: ['action'],
                    _count: { action: true },
                    orderBy: { _count: { action: 'desc' } },
                    take: 10
                })
            ]);

            ApiResponse.success(res, {
                total: totalLogs,
                last24h: logs24h,
                last7d: logs7d,
                topActions: topActions.map((a: any) => ({
                    action: a.action,
                    count: a._count.action
                }))
            });
        } catch (error) {
            logger.error('Error fetching log stats:', error);
            ApiResponse.error(res, 'فشل في جلب إحصائيات السجلات', 500);
        }
    }
}

export const adminLogsController = new AdminLogsController();
