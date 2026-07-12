import { logger } from '../utils/logger';

export async function updateDashboardStats(userId: string): Promise<void> {
  // Dashboard stats model not yet available in Prisma schema.
  // Will be implemented once the dashboardStats table is added.
  logger.info(`[updateDashboardStats] Skipped for userId=${userId} (model not available)`);
}
