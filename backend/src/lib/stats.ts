import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export async function updateDashboardStats(userId: string): Promise<void> {
  try {
    const whereOwner = { ownerId: userId };
    const whereHiveOwner = { hive: { apiary: whereOwner } };

    const [totalApiaries, totalHives, honeyAgg, honeyCount, pollenCount, royalCount, activeAlerts, lastInspection] =
      await Promise.all([
        prisma.apiary.count({ where: whereOwner }),
        prisma.hive.count({ where: { apiary: whereOwner } }),
        prisma.honeyHarvest.aggregate({
          where: whereHiveOwner,
          _sum: { quantityKg: true },
        }),
        prisma.honeyHarvest.count({ where: whereHiveOwner }),
        prisma.pollenHarvest.count({ where: whereHiveOwner }),
        prisma.royalJellyProduction.count({ where: whereHiveOwner }),
        prisma.alert.count({ where: { userId, status: 'ACTIVE' } }),
        prisma.inspection.findFirst({
          where: { apiary: whereOwner },
          orderBy: { inspectionDate: 'desc' },
          select: { inspectionDate: true },
        }),
      ]);

    await prisma.dashboardStats.upsert({
      where: { userId },
      update: {
        totalApiaries,
        totalHives,
        totalHoneyKg: honeyAgg._sum?.quantityKg ?? 0,
        totalProductionEntries: honeyCount + pollenCount + royalCount,
        activeAlerts,
        lastInspectionDate: lastInspection?.inspectionDate ?? null,
        calculatedAt: new Date(),
      },
      create: {
        userId,
        totalApiaries,
        totalHives,
        totalHoneyKg: honeyAgg._sum?.quantityKg ?? 0,
        totalProductionEntries: honeyCount + pollenCount + royalCount,
        activeAlerts,
        lastInspectionDate: lastInspection?.inspectionDate ?? null,
      },
    });
  } catch (error) {
    logger.error(`[updateDashboardStats] Error for userId=${userId}:`, error);
  }
}
