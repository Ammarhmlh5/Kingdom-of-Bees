import prisma from '../config/prisma';

export class DashboardService {
    /**
     * Get comprehensive dashboard statistics for an apiary
     */
    async getDashboardStats(apiaryId: string) {
        // Fetch all hives with related data
        const hives = await prisma.hive.findMany({
            where: { 
                apiaryId,
                status: 'ACTIVE'
            },
            include: {
                frames: true,
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        inspections: true,
                        frames: true
                    }
                }
            }
        });

        // Calculate hive strength statistics
        const strengthStats = this.calculateStrengthStats(hives);
        
        // Calculate hive type statistics
        const typeStats = this.calculateTypeStats(hives);
        
        // Calculate inspection statistics
        const inspectionStats = await this.calculateInspectionStats(apiaryId, hives);
        
        // Calculate operations statistics
        const operationsStats = await this.calculateOperationsStats(apiaryId);

        return {
            hives: {
                total: hives.length,
                strength: strengthStats,
                byType: typeStats
            },
            inspections: inspectionStats,
            operations: operationsStats,
            overall: {
                healthScore: this.calculateOverallHealthScore(hives),
                performanceScore: this.calculatePerformanceScore(inspectionStats, operationsStats)
            }
        };
    }

    /**
     * Calculate strength distribution
     */
    private calculateStrengthStats(hives: any[]) {
        const strong = hives.filter(h => 
            h.strengthRating === 'VERY_STRONG' || h.strengthRating === 'STRONG'
        ).length;
        
        const medium = hives.filter(h => 
            h.strengthRating === 'MEDIUM'
        ).length;
        
        const weak = hives.filter(h => 
            h.strengthRating === 'WEAK' || h.strengthRating === 'VERY_WEAK'
        ).length;

        const total = hives.length;
        
        return {
            strong: {
                count: strong,
                percentage: total > 0 ? Math.round((strong / total) * 100) : 0
            },
            medium: {
                count: medium,
                percentage: total > 0 ? Math.round((medium / total) * 100) : 0
            },
            weak: {
                count: weak,
                percentage: total > 0 ? Math.round((weak / total) * 100) : 0
            }
        };
    }

    /**
     * Calculate statistics by hive type
     */
    private calculateTypeStats(hives: any[]) {
        const langstroth = hives.filter(h => h.hiveType === 'LANGSTROTH');
        const baladi = hives.filter(h => h.hiveType === 'BALADI');
        const kenyan = hives.filter(h => h.hiveType === 'KENYAN');
        const other = hives.filter(h => h.hiveType === 'OTHER');

        const calculateTypeBreakdown = (typeHives: any[]) => ({
            total: typeHives.length,
            strong: typeHives.filter(h => 
                h.strengthRating === 'VERY_STRONG' || h.strengthRating === 'STRONG'
            ).length,
            medium: typeHives.filter(h => h.strengthRating === 'MEDIUM').length,
            weak: typeHives.filter(h => 
                h.strengthRating === 'WEAK' || h.strengthRating === 'VERY_WEAK'
            ).length
        });

        return {
            langstroth: calculateTypeBreakdown(langstroth),
            baladi: calculateTypeBreakdown(baladi),
            kenyan: calculateTypeBreakdown(kenyan),
            other: calculateTypeBreakdown(other)
        };
    }

    /**
     * Calculate inspection statistics
     */
    private async calculateInspectionStats(apiaryId: string, hives: any[]) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Count inspections in last 30 days
        const recentInspections = await prisma.inspection.count({
            where: {
                apiaryId,
                inspectionDate: {
                    gte: thirtyDaysAgo
                }
            }
        });

        // Hives needing inspection (not inspected in 14+ days)
        const hivesNeedingInspection = hives.filter(h => {
            if (!h.lastInspectionDate) return true;
            return new Date(h.lastInspectionDate) < fourteenDaysAgo;
        }).length;

        // Hives due soon (7-14 days)
        const hivesDueSoon = hives.filter(h => {
            if (!h.lastInspectionDate) return false;
            const lastInspection = new Date(h.lastInspectionDate);
            return lastInspection < fourteenDaysAgo && lastInspection >= sevenDaysAgo;
        }).length;

        // Calculate completion rate
        const totalHives = hives.length;
        const inspectedRecently = totalHives - hivesNeedingInspection;
        const completionRate = totalHives > 0 
            ? Math.round((inspectedRecently / totalHives) * 100) 
            : 0;

        return {
            completed: recentInspections,
            overdue: hivesNeedingInspection,
            dueSoon: hivesDueSoon,
            completionRate,
            averageInterval: await this.calculateAverageInspectionInterval(apiaryId)
        };
    }

    /**
     * Calculate average inspection interval
     */
    private async calculateAverageInspectionInterval(apiaryId: string) {
        const inspections = await prisma.inspection.findMany({
            where: { apiaryId },
            orderBy: { inspectionDate: 'desc' },
            take: 20,
            select: { inspectionDate: true }
        });

        if (inspections.length < 2) return 0;

        let totalDays = 0;
        for (let i = 0; i < inspections.length - 1; i++) {
            const diff = new Date(inspections[i].inspectionDate).getTime() - 
                        new Date(inspections[i + 1].inspectionDate).getTime();
            totalDays += diff / (1000 * 60 * 60 * 24);
        }

        return Math.round(totalDays / (inspections.length - 1));
    }

    /**
     * Calculate operations statistics
     */
    private async calculateOperationsStats(apiaryId: string) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [splits, merges, feedings, supers] = await Promise.all([
            prisma.splitOperation.count({
                where: {
                    apiaryId,
                    splitDate: { gte: thirtyDaysAgo }
                }
            }),
            prisma.mergeOperation.count({
                where: {
                    apiaryId,
                    mergeDate: { gte: thirtyDaysAgo }
                }
            }),
            prisma.feedingRecord.count({
                where: {
                    apiary: { id: apiaryId },
                    feedingDate: { gte: thirtyDaysAgo }
                }
            }),
            prisma.hiveSuper.count({
                where: {
                    hive: { apiaryId },
                    addedDate: { gte: thirtyDaysAgo }
                }
            })
        ]);

        const total = splits + merges + feedings + supers;

        return {
            total,
            splits,
            merges,
            feedings,
            supers,
            period: 'last30Days'
        };
    }

    /**
     * Calculate overall health score (0-100)
     */
    private calculateOverallHealthScore(hives: any[]): number {
        if (hives.length === 0) return 0;

        let totalScore = 0;
        
        hives.forEach(hive => {
            let score = 50; // Base score

            // Strength rating impact
            if (hive.strengthRating === 'VERY_STRONG') score += 30;
            else if (hive.strengthRating === 'STRONG') score += 20;
            else if (hive.strengthRating === 'MEDIUM') score += 10;
            else if (hive.strengthRating === 'WEAK') score -= 10;
            else if (hive.strengthRating === 'VERY_WEAK') score -= 20;

            // Condition impact
            if (hive.condition === 'EXCELLENT') score += 20;
            else if (hive.condition === 'VERY_GOOD') score += 15;
            else if (hive.condition === 'GOOD') score += 10;
            else if (hive.condition === 'FAIR') score += 5;
            else if (hive.condition === 'WEAK') score -= 15;

            totalScore += Math.max(0, Math.min(100, score));
        });

        return Math.round(totalScore / hives.length);
    }

    /**
     * Calculate performance score based on inspections and operations
     */
    private calculatePerformanceScore(inspectionStats: any, operationsStats: any): number {
        let score = 0;

        // Inspection completion rate (50% weight)
        score += (inspectionStats.completionRate * 0.5);

        // Operations activity (50% weight)
        // More operations = better management (up to a point)
        const operationsScore = Math.min(100, operationsStats.total * 5);
        score += (operationsScore * 0.5);

        return Math.round(score);
    }
}

export const dashboardService = new DashboardService();
