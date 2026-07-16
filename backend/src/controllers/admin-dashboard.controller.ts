import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class AdminDashboardController {
    /**
     * GET /api/admin/stats
     * Get dashboard statistics
     */
    async getStats(_req: Request, res: Response) {
        try {
            const [
                totalUsers,
                totalApiaries,
                totalHives,
                totalInspections,
                recentUsers
            ] = await Promise.all([
                prisma.userProfile.count(),
                prisma.apiary.count(),
                prisma.hive.count(),
                prisma.inspection.count(),
                prisma.userProfile.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        createdAt: true,
                        userType: true
                    }
                })
            ]);

            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const newUsersLast30Days = await prisma.userProfile.count({
                where: { createdAt: { gte: last30Days } }
            });

            ApiResponse.success(res, {
                totalUsers,
                totalApiaries,
                totalHives,
                totalInspections,
                newUsersLast30Days,
                recentUsers
            });
        } catch (error) {
            logger.error('Error fetching admin stats:', error);
            ApiResponse.error(res, 'فشل في جلب إحصائيات الإدارة', 500);
        }
    }

    /**
     * GET /api/admin/activities
     * Get recent activities
     */
    async getActivities(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 10;

            const activities = await prisma.userActivityLog.findMany({
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
                take: limit
            });

            const transformed = activities.map((a: any) => ({
                id: a.id,
                action: a.action,
                resourceType: a.resourceType,
                userName: a.user?.fullName || a.user?.email || 'غير معروف',
                createdAt: a.createdAt.toISOString()
            }));

            ApiResponse.success(res, transformed);
        } catch (error) {
            logger.error('Error fetching admin activities:', error);
            ApiResponse.error(res, 'فشل في جلب الأنشطة', 500);
        }
    }

    /**
     * GET /api/admin/users
     * Get all users with pagination
     */
    async getUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                prisma.userProfile.findMany({
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        userType: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true,
                        lastLoginAt: true,
                        totalApiaries: true,
                        totalHives: true,
                        subscriptionStatus: true
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.userProfile.count()
            ]);

            ApiResponse.success(res, {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Error fetching admin users:', error);
            ApiResponse.error(res, 'فشل في جلب المستخدمين', 500);
        }
    }
}

export const adminDashboardController = new AdminDashboardController();
