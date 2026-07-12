import { Hive } from '@prisma/client';

import prisma from '../config/prisma';
import { logger } from '../utils/logger';

interface ApiaryMetricsData {
    overallStrength: number;
    strengthRating: string;
    totalHives: number;
    excellentHives: number;
    goodHives: number;
    weakHives: number;
    excellentPercent: number;
    goodPercent: number;
    weakPercent: number;
    excellentTrend: number;
    goodTrend: number;
    weakTrend: number;
}

export class ApiaryMetricsService {
    
    /**
     * Calculate and store metrics for an apiary
     */
    async calculateMetrics(apiaryId: string): Promise<any> {
        logger.info(`[ApiaryMetricsService] Calculating metrics for apiary: ${apiaryId}`);
        
        // 1. Get all hives for the apiary
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
                }
            }
        });
        
        if (hives.length === 0) {
            logger.info(`[ApiaryMetricsService] No active hives found for apiary: ${apiaryId}`);
            return null;
        }
        
        // 2. Calculate strength for each hive and classify
        const hiveStrengths = hives.map(hive => ({
            hiveId: hive.id,
            strength: this.calculateHiveStrength(hive),
            condition: hive.condition || 'UNKNOWN'
        }));
        
        // 3. Calculate overall strength (average)
        const overallStrength = hiveStrengths.reduce((sum, h) => sum + h.strength, 0) / hives.length;
        
        // 4. Classify hives
        const excellentHives = hives.filter(h => 
            h.condition === 'EXCELLENT' || h.condition === 'VERY_GOOD'
        ).length;
        
        const goodHives = hives.filter(h => 
            h.condition === 'GOOD' || h.condition === 'FAIR'
        ).length;
        
        const weakHives = hives.filter(h => 
            h.condition === 'WEAK'
        ).length;
        
        // 5. Calculate percentages
        const totalHives = hives.length;
        const excellentPercent = (excellentHives / totalHives) * 100;
        const goodPercent = (goodHives / totalHives) * 100;
        const weakPercent = (weakHives / totalHives) * 100;
        
        // 6. Determine strength rating
        const strengthRating = this.getStrengthRating(overallStrength);
        
        // 7. Calculate trends (compare with previous metrics)
        const previousMetrics = await this.getLatestMetrics(apiaryId);
        const trends = this.calculateTrends(
            { excellentHives, goodHives, weakHives },
            previousMetrics
        );
        
        // 8. Create metrics data
        const metricsData: ApiaryMetricsData = {
            overallStrength: Math.round(overallStrength * 100) / 100,
            strengthRating,
            totalHives,
            excellentHives,
            goodHives,
            weakHives,
            excellentPercent: Math.round(excellentPercent * 100) / 100,
            goodPercent: Math.round(goodPercent * 100) / 100,
            weakPercent: Math.round(weakPercent * 100) / 100,
            excellentTrend: trends.excellentTrend,
            goodTrend: trends.goodTrend,
            weakTrend: trends.weakTrend
        };
        
        // 9. Store in database
        const metrics = await prisma.apiaryMetrics.create({
            data: {
                apiaryId,
                ...metricsData
            }
        });
        
        logger.info(`[ApiaryMetricsService] Metrics calculated and stored:`, metrics);
        
        return metrics;
    }
    
    /**
     * Get latest metrics for an apiary
     */
    async getLatestMetrics(apiaryId: string): Promise<any | null> {
        const metrics = await prisma.apiaryMetrics.findFirst({
            where: { apiaryId },
            orderBy: { calculatedAt: 'desc' }
        });
        
        return metrics;
    }
    
    /**
     * Get metrics history for an apiary
     */
    async getMetricsHistory(apiaryId: string, days: number = 30): Promise<any[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);
        
        const metrics = await prisma.apiaryMetrics.findMany({
            where: {
                apiaryId,
                calculatedAt: {
                    gte: since
                }
            },
            orderBy: { calculatedAt: 'desc' }
        });
        
        return metrics;
    }
    
    /**
     * Calculate strength score for a single hive (0-100)
     */
    private calculateHiveStrength(hive: Hive): number {
        let score = 0;
        
        // Base score from condition (0-100)
        switch (hive.condition) {
            case 'EXCELLENT':
                score = 100;
                break;
            case 'VERY_GOOD':
                score = 85;
                break;
            case 'GOOD':
                score = 70;
                break;
            case 'FAIR':
                score = 50;
                break;
            case 'WEAK':
                score = 30;
                break;
            default:
                score = 50;
        }
        
        // Adjust based on strengthRating if available
        if (hive.strengthRating) {
            const strengthBonus: Record<string, number> = {
                'VERY_STRONG': 10,
                'STRONG': 5,
                'MEDIUM': 0,
                'WEAK': -5,
                'VERY_WEAK': -10
            };
            score += strengthBonus[hive.strengthRating] || 0;
        }
        
        // Adjust based on strengthScore if available
        if (hive.strengthScore) {
            score = (score + hive.strengthScore) / 2;
        }
        
        // Ensure score is within 0-100
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * Get strength rating based on overall strength score
     */
    private getStrengthRating(strength: number): string {
        if (strength >= 80) return 'EXCELLENT';
        if (strength >= 60) return 'GOOD';
        if (strength >= 40) return 'FAIR';
        return 'WEAK';
    }
    
    /**
     * Calculate trends by comparing current with previous metrics
     */
    private calculateTrends(
        current: { excellentHives: number; goodHives: number; weakHives: number },
        previous: any | null
    ): { excellentTrend: number; goodTrend: number; weakTrend: number } {
        if (!previous) {
            return {
                excellentTrend: 0,
                goodTrend: 0,
                weakTrend: 0
            };
        }
        
        return {
            excellentTrend: current.excellentHives - previous.excellentHives,
            goodTrend: current.goodHives - previous.goodHives,
            weakTrend: current.weakHives - previous.weakHives
        };
    }
    
    /**
     * Check if metrics need recalculation (older than 1 hour)
     */
    async needsRecalculation(apiaryId: string): Promise<boolean> {
        const latest = await this.getLatestMetrics(apiaryId);
        
        if (!latest) return true;
        
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        return latest.calculatedAt < oneHourAgo;
    }
}

export const apiaryMetricsService = new ApiaryMetricsService();
