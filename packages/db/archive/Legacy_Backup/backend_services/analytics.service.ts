import { prisma } from '../config/database';

export class AnalyticsService {

    static async getOwnerDashboardKPIs(userId: string) {
        // 1. Total Apiaries
        const totalApiaries = await prisma.apiary.count({
            where: { ownerId: userId, isActive: true }
        });

        // 2. Total Hives
        const totalHives = await prisma.hive.count({
            where: { apiary: { ownerId: userId }, status: 'ACTIVE' }
        });

        // 3. Health Status
        const sickHives = await prisma.diseaseRecord.count({
            where: {
                apiary: { ownerId: userId },
                status: { in: ['ACTIVE', 'TREATING'] }
            }
        });

        const healthScore = totalHives > 0 ? Math.round(((totalHives - sickHives) / totalHives) * 100) : 100;

        // 4. Tasks Due
        // Simplified: Find inspections due today or earlier
        const overdueInspections = await prisma.hive.count({
            where: {
                apiary: { ownerId: userId },
                nextInspectionDue: { lte: new Date() }
            }
        });

        return {
            totalApiaries,
            totalHives,
            healthScore,
            sickHives,
            tasksDue: overdueInspections
        };
    }

    static async getWorkerDashboardKPIs(userId: string) {
        // Worker sees apiaries they are member of
        const memberships = await prisma.apiaryMembership.findMany({
            where: { userId },
            select: { apiaryId: true }
        });
        const apiaryIds = memberships.map(m => m.apiaryId);

        const totalApiaries = apiaryIds.length;

        // Hives in those apiaries
        const totalHives = await prisma.hive.count({
            where: { apiaryId: { in: apiaryIds }, status: 'ACTIVE' }
        });

        // Tasks specifically assigned to them or general tasks in their apiaries
        // For now, simpler metric: Inspections in their apiaries due
        const tasksDue = await prisma.hive.count({
            where: {
                apiaryId: { in: apiaryIds },
                nextInspectionDue: { lte: new Date() }
            }
        });

        return {
            assignedApiaries: totalApiaries,
            totalHives,
            tasksDue
        };
    }
}
