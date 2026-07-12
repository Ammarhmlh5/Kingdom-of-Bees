import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
    /**
     * Get system-wide statistics for admin dashboard
     */
    async getSystemStats() {
        const [totalUsers, totalApiaries, activeAlerts, totalInspections] = await Promise.all([
            prisma.userProfile.count(),
            prisma.apiary.count(),
            prisma.alert.count({ where: { status: 'ACTIVE' } }),
            prisma.inspection.count(),
        ]);

        // Count today's operations (inspections created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOperations = await prisma.inspection.count({
            where: { createdAt: { gte: today } }
        });

        return {
            totalUsers,
            totalApiaries,
            activeAlerts,
            todayOperations,
            totalInspections,
        };
    }

    /**
     * Get recent system activities
     */
    async getRecentActivities(limit: number = 10) {
        const activities = await prisma.userActivityLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                action: true,
                resourceType: true,
                createdAt: true,
                user: {
                    select: {
                        fullName: true,
                    }
                }
            }
        });

        return activities.map(log => ({
            id: log.id,
            type: log.resourceType || 'system',
            description: `${log.user.fullName} - ${log.action}`,
            timestamp: log.createdAt.toISOString(),
        }));
    }

    /**
     * Get all users with their statistics
     */
    async getAllUsers() {
        return prisma.userProfile.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                userType: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                totalApiaries: true,
                totalHives: true,
                phone: true,
                country: true,
                region: true,
                city: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get user by ID with full details
     */
    async getUserById(id: string) {
        return prisma.userProfile.findUnique({
            where: { id },
            select: {
                id: true,
                authId: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                userType: true,
                country: true,
                region: true,
                city: true,
                language: true,
                timezone: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                subscriptionStart: true,
                subscriptionEnd: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                isActive: true,
                isVerified: true,
                totalApiaries: true,
                totalHives: true,
            }
        });
    }

    /**
     * Update user status (activate/deactivate)
     */
    async updateUserStatus(id: string, isActive: boolean) {
        return prisma.userProfile.update({
            where: { id },
            data: { isActive },
        });
    }
}

export const adminService = new AdminService();
