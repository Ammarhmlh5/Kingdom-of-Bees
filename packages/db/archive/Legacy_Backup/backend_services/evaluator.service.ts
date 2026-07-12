
import { PrismaClient, Hive, Inspection, DiseaseRecord, HarvestRecord, InspectionFrameDetail } from '@prisma/client';

const prisma = new PrismaClient();

interface HiveScoreBreakdown {
    diseaseScore: number;
    strengthScore: number;
    queenScore: number;
    productionScore: number;
    total: number;
}

export class EvaluatorService {

    /**
     * Evaluate a single Hive based on scientific metrics
     * Bottom-Up Approach: Frame -> Hive -> Apiary
     */
    async evaluateHive(hiveId: string): Promise<HiveScoreBreakdown> {
        // 1. Fetch all necessary data
        const hive = await prisma.hive.findUnique({
            where: { id: hiveId },
            include: {
                currentQueen: true,
                diseaseAffected: { where: { status: 'ACTIVE' } },
                inspections: {
                    take: 1, // Latest inspection
                    orderBy: { inspectionDate: 'desc' },
                    include: { frameDetails: true }
                },
                honeyHarvests: {
                    take: 5, // Recent harvests
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!hive) throw new Error(`Hive ${hiveId} not found`);

        // 2. Calculate Sub-Scores
        const diseaseScore = this.calculateDiseaseScore(hive.diseaseAffected);
        const strengthScore = this.calculateStrengthScore(hive.inspections[0]?.frameDetails || []);
        const queenScore = this.calculateQueenScore(hive.currentQueen, hive.inspections[0]);
        const productionScore = this.calculateProductionScore(hive.honeyHarvests);

        // 3. Total Weighted Score
        // Weights: Disease(40%) + Strength(30%) + Queen(20%) + Production(10%)
        // Note: The sub-calculation functions should return 0-100.
        // We apply weights here.

        let total = (
            (diseaseScore * 0.4) +
            (strengthScore * 0.3) +
            (queenScore * 0.2) +
            (productionScore * 0.1)
        );

        // Cap at 100, Floor at 0
        total = Math.max(0, Math.min(100, Math.round(total)));

        // 4. Update Hive Record
        await prisma.hive.update({
            where: { id: hiveId },
            data: {
                strengthScore: total,
                stats: {
                    ...(hive.stats as object),
                    healthScore: total,
                    lastEvaluation: new Date(),
                    scoreBreakdown: { diseaseScore, strengthScore, queenScore, productionScore }
                }
            }
        });

        return { diseaseScore, strengthScore, queenScore, productionScore, total };
    }

    /**
     * A. Disease Status (Max 100)
     * - No Disease: 100
     * - Active: Deduct based on severity
     */
    private calculateDiseaseScore(activeDiseases: any[]): number {
        if (!activeDiseases || activeDiseases.length === 0) return 100;

        // Start with 100 and deduct
        // We assume we don't have severity in DiseaseRecord directly joined yet comfortably, 
        // but let's assume standard deduction for any active disease for MVP if we cannot fetch severity easily.
        // OR better: In a real app we join DiseaseLibrary. 
        // For now, let's treat any active disease as -50 points.
        // Multiple diseases can reduce checks to 0.

        let score = 100;
        for (const record of activeDiseases) {
            // If we had severity, we would use it. Active disease is bad.
            score -= 50;
        }

        return Math.max(0, score);
    }

    /**
     * B. Colony Strength - Frame Level (Max 100)
     * Formula: Sum(FrameScore) / TotalFrames
     */
    private calculateStrengthScore(frames: InspectionFrameDetail[]): number {
        if (frames.length === 0) return 0; // No inspection data = 0 strength known

        let totalFramePoints = 0;

        for (const frame of frames) {
            let framePoints = 0;
            // Brood (High Value): weight 1.0
            if (frame.broodPercentage) {
                framePoints += frame.broodPercentage * 1.0;
            }
            // Resources (Medium Value): weight 0.5
            if (frame.honeyPercentage) {
                framePoints += frame.honeyPercentage * 0.5;
            }
            if (frame.pollenPercentage) {
                framePoints += frame.pollenPercentage * 0.5;
            }

            // Normalize frame points to max 100 per frame roughly
            // Example: 80% brood + 20% honey = 80 + 10 = 90.
            // Max theoretical: 100% brood + 100% honey (impossible physics, but logic holds) -> 150.
            // We cap each frame at 100 contribution? No, let's trust the percentage sum.

            // Actually, if a frame is 100% covered in bees/brood, it's 100.
            // Let's simplify: 
            // Frame Score = (Brood% * 1.2) + (Resources% * 0.8) 
            // Capped at 100 per frame.

            const rawFrameScore = ((frame.broodPercentage || 0) * 1.2) +
                ((frame.honeyPercentage || 0) * 0.5) +
                ((frame.pollenPercentage || 0) * 0.5);

            totalFramePoints += Math.min(100, rawFrameScore);
        }

        // Average across all inspected frames
        return Math.round(totalFramePoints / frames.length);
    }

    /**
     * C. Queen Quality (Max 100)
     */
    private calculateQueenScore(queen: any, latestInspection: any): number {
        if (!queen) return 0; // Queenless

        let score = 80; // Base score for existing queen

        // Bonus for markers
        if (queen.marked) score += 10;

        // Check inspection for brood pattern issues
        if (latestInspection) {
            // If we had specific fields for "Spotty Brood", we would deduct.
            // For now, if eggs present, good.
            if (latestInspection.eggsPresent) score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * D. Production (Max 100)
     */
    private calculateProductionScore(harvests: any[]): number {
        if (!harvests || harvests.length === 0) return 50; // Neutral if no history

        // Simple metric: Average yield per harvest > 5kg?
        const totalKg = harvests.reduce((acc, h) => acc + (Number(h.quantityKg) || 0), 0);
        const avg = totalKg / harvests.length;

        if (avg > 10) return 100;
        if (avg > 5) return 75;
        return 50;
    }

    /**
     * Aggregate Apiary Score
     */
    async evaluateApiary(apiaryId: string) {
        // 1. Get all hives
        const hives = await prisma.hive.findMany({
            where: { apiaryId, status: 'ACTIVE' },
            select: { strengthScore: true }
        });

        if (hives.length === 0) return; // No active hives

        // 2. Average Score
        const totalScore = hives.reduce((acc, h) => acc + (h.strengthScore || 0), 0);
        const average = Math.round(totalScore / hives.length);

        // 3. Map to Rating Enum
        let rating: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' = 'POOR';
        if (average >= 90) rating = 'EXCELLENT';
        else if (average >= 75) rating = 'GOOD';
        else if (average >= 50) rating = 'POOR';
        else rating = 'CRITICAL';

        // 4. Update Apiary
        await prisma.apiary.update({
            where: { id: apiaryId },
            data: {
                healthRating: rating,
                stats: {
                    healthScore: average,
                    lastEvaluation: new Date(),
                    hiveCount: hives.length
                }
            }
        });

        console.log(`Apiary ${apiaryId} evaluated. Score: ${average}, Rating: ${rating}`);
    }
}

export const evaluatorService = new EvaluatorService();
