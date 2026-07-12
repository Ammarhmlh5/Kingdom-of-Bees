import prisma from '../config/prisma';
import { HiveCondition } from '@prisma/client';

export class HiveAnalysisService {

    /**
     * Perform initial setup and auto-classification for a hive
     */
    async performSetup(hiveId: string, data: any) {
        const { frames, queen } = data; // Expected structure from frontend wizard

        // Check if apiaryId is present, if not fetch from hive
        let apiaryId = data.apiaryId;
        if (!apiaryId) {
            const hive = await prisma.hive.findUnique({ where: { id: hiveId }, select: { apiaryId: true } });
            if (!hive) throw new Error("Hive not found");
            apiaryId = hive.apiaryId;
        }

        // 1. Calculate Scores
        const analysisResult = this.calculateHiveStrength(frames, queen);

        // 2. Create Analysis Record
        const analysis = await prisma.hiveAnalysis.create({
            data: {
                hiveId: hiveId,
                apiaryId: apiaryId,
                generalStrengthScore: analysisResult.score,
                splitReadinessScore: analysisResult.splitScore,
                superReadinessScore: analysisResult.superScore,
                winterSurvivalScore: analysisResult.winterScore,
                condition: analysisResult.condition,
                // Detailed Metrics
                frameCount: frames.total,
                broodFrameCount: frames.brood,
                honeyFrameCount: frames.honey,
                pollenFrameCount: frames.pollen,
                queenStatus: queen.year === '2026' ? 'NEW' : 'EXISTING',
                // Mock Environmental factors for now (to be integrated with Weather API later)
                weatherFactor: 1.0,
                forageFactor: 1.0
            }
        });

        // 3. Update Hive Condition in Main Table
        await prisma.hive.update({
            where: { id: hiveId },
            data: {
                condition: analysisResult.condition,
                // Optionally update other stats if needed
            }
        });

        return analysis;
    }

    /**
     * Core Algorithm: Hive Strength Calculation
     */
    private calculateHiveStrength(frames: any, queen: any) {
        let score = 0;

        // Base Score from Population (Frames of Bees)
        // Assuming 'total' frames implies frames covered with bees
        score += (frames.total * 6); // Max 60 points for 10 frames

        // Brood Bonus (Future Generation)
        score += (frames.brood * 4); // Max 40 points (approx)

        // Honey Reserves (Stability)
        score += (frames.honey * 2);

        // Queen Penalty/Bonus
        if (queen.year === 'OLD') score -= 15;
        if (queen.year === new Date().getFullYear().toString()) score += 10;

        // Normalization (0-100)
        score = Math.min(100, Math.max(0, score));

        // Determine Condition
        let condition: HiveCondition = 'WEAK';
        if (score >= 85) condition = 'EXCELLENT';
        else if (score >= 70) condition = 'VERY_GOOD';
        else if (score >= 50) condition = 'GOOD';
        else if (score >= 30) condition = 'WEAK';
        else condition = 'CRITICAL';

        // Specialized Scores (Simple logic for now)
        const splitScore = (frames.brood >= 5 && frames.total >= 8) ? score : Math.max(0, score - 30);
        const superScore = (frames.total >= 9 && frames.honey >= 3) ? score + 10 : score - 20;
        const winterScore = (frames.honey >= 5 && frames.total >= 5) ? score + 20 : score - 40;

        return {
            score,
            condition,
            splitScore,
            superScore,
            winterScore
        };
    }
}

export const hiveAnalysisService = new HiveAnalysisService();
