import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export class AnalyticsMatchingService {
  /**
   * Main entry point to process an operation asynchronously for predictions and matching.
   * Runs in background (non-blocking / Fire-and-Forget).
   */
  async processOperationAsync(
    apiaryId: string,
    hiveId: string | null,
    operationId: string,
    operationType: string,
    payload: any
  ) {
    try {
      if (!hiveId) return; // Analysis currently targets specific hives

      // 1. Resolve any previous pending predictions using the new operation outcome
      await this.resolvePredictions(apiaryId, hiveId, operationId, operationType, payload);

      // 2. Generate new predictive analysis for this hive based on the current operation
      await this.generatePrediction(apiaryId, hiveId, operationId, operationType, payload);
    } catch (error) {
      logger.error('[AnalyticsMatchingService] Error in async operation processing:', error);
    }
  }

  /**
   * Resolves past predictions by matching them against the new operation's actual outcome.
   */
  private async resolvePredictions(
    apiaryId: string,
    hiveId: string,
    resolvingOperationId: string,
    operationType: string,
    payload: any
  ) {
    // Fetch all unresolved predictions for this specific hive
    const pendingAnalyses = await prisma.operationAnalysis.findMany({
      where: { apiaryId, hiveId, isResolved: false }
    });

    for (const analysis of pendingAnalyses) {
      let isMatch = false;
      let accuracyScore = 0;
      const predPayload = analysis.predictionPayload as any;
      let shouldRecord = false;

      // --- Rule 1: Swarm Risk Resolution ---
      if (analysis.analysisType === 'SWARM_RISK_PREDICTION') {
        if (operationType === 'SPLIT' || operationType === 'SWARM_EVENT') {
          // Prediction confirmed: the hive actually swarmed or was split
          isMatch = true;
          accuracyScore = 100;
          shouldRecord = true;
        } else if (operationType === 'INSPECTION' && payload.queenCellsFound === false) {
          // Subsequent inspection showed no queen cells — risk was managed/resolved
          isMatch = false;
          accuracyScore = 75;
          shouldRecord = true;
        }
      }

      // --- Rule 2: Honey Yield Estimate Resolution ---
      else if (analysis.analysisType === 'HONEY_YIELD_ESTIMATE') {
        if (operationType === 'HARVEST') {
          isMatch = true;
          const expectedAmount = predPayload?.expectedQuantityKg || 10;
          const actualAmount = payload?.quantityKg || payload?.totalQuantity || 0;
          const diff = Math.abs(expectedAmount - actualAmount);
          accuracyScore = Math.max(0, Math.min(100, 100 - (diff / expectedAmount) * 100));
          shouldRecord = true;
        }
      }

      // --- Rule 3: Queen Failure Risk Resolution ---
      else if (analysis.analysisType === 'QUEEN_FAILURE_RISK') {
        if (operationType === 'QUEEN_REPLACE' || operationType === 'QUEEN_INTRODUCTION') {
          isMatch = true;
          accuracyScore = 100;
          shouldRecord = true;
        } else if (operationType === 'INSPECTION' && payload.queenSeen === true) {
          // Queen is healthy — prediction was wrong
          isMatch = false;
          accuracyScore = 85;
          shouldRecord = true;
        }
      }

      // --- Rule 4: Disease Risk Resolution ---
      else if (analysis.analysisType === 'DISEASE_RISK_PREDICTION') {
        if (operationType === 'DISEASE_REPORT') {
          isMatch = true;
          accuracyScore = 100;
          shouldRecord = true;
        } else if (operationType === 'INSPECTION' && payload.diseaseObserved === false) {
          isMatch = false;
          accuracyScore = 80;
          shouldRecord = true;
        }
      }

      // --- Rule 5: Post-Merge Monitoring Resolution ---
      else if (analysis.analysisType === 'POST_MERGE_CHECK') {
        if (operationType === 'INSPECTION') {
          isMatch = true;
          accuracyScore = payload.queenSeen ? 100 : 60;
          shouldRecord = true;
        }
      }

      // --- Rule 6: Post-Split Queen Raising Resolution ---
      else if (analysis.analysisType === 'POST_SPLIT_QUEEN_CHECK') {
        if (operationType === 'INSPECTION') {
          const queenFound = payload.queenSeen || payload.queenCellsFound;
          isMatch = !!queenFound;
          accuracyScore = queenFound ? 90 : 40;
          shouldRecord = true;
        }
      }

      // Record the match outcome if this operation resolves the prediction
      if (shouldRecord) {
        await prisma.$transaction([
          prisma.predictionMatch.create({
            data: {
              apiaryId,
              analysisId: analysis.id,
              resolvingOperationId,
              isAccurate: isMatch,
              accuracyScore,
              predictedData: analysis.predictionPayload as any,
              actualOutcomeData: payload || {}
            }
          }),
          prisma.operationAnalysis.update({
            where: { id: analysis.id },
            data: { isResolved: true }
          })
        ]);

        logger.info(`[Analytics] Resolved prediction '${analysis.analysisType}' with accuracy: ${accuracyScore.toFixed(1)}%`);
      }
    }
  }

  /**
   * Generates new predictive analysis records based on rules applied to the current operation.
   */
  private async generatePrediction(
    apiaryId: string,
    hiveId: string,
    sourceOperationId: string,
    operationType: string,
    payload: any
  ) {
    const predictionsToCreate: any[] = [];

    // ========== INSPECTION-BASED PREDICTIONS ==========
    if (operationType === 'INSPECTION') {

      // Swarm Risk: High brood density
      if (payload.broodFrames && payload.broodFrames >= 7) {
        predictionsToCreate.push({
          apiaryId, hiveId, sourceOperationId,
          analysisType: 'SWARM_RISK_PREDICTION',
          predictionPayload: {
            riskLevel: payload.broodFrames >= 9 ? 'CRITICAL' : 'HIGH',
            broodFramesDetected: payload.broodFrames,
            reason: `كثافة عالية في إطارات الحضنة: ${payload.broodFrames} إطارات`,
            recommendation: 'يُنصح بتقسيم الخلية أو إضافة عاسلة لتجنب التطريد الطبيعي'
          },
          confidenceScore: payload.broodFrames >= 9 ? 92.0 : 80.0
        });
      }

      // Honey Harvest Readiness
      if (payload.honeyFrames && payload.honeyFrames >= 5) {
        predictionsToCreate.push({
          apiaryId, hiveId, sourceOperationId,
          analysisType: 'HONEY_YIELD_ESTIMATE',
          predictionPayload: {
            expectedQuantityKg: parseFloat((payload.honeyFrames * 2.5).toFixed(2)),
            honeyFramesDetected: payload.honeyFrames,
            reason: `جاهزية ${payload.honeyFrames} إطارات عسل للقطف`,
            recommendation: 'تحديد موعد لقطف العسل خلال الأسبوع القادم'
          },
          confidenceScore: 88.0
        });
      }

      // Queen Failure Risk: Queen not seen and brood is low
      if (payload.queenSeen === false && payload.broodFrames !== undefined && payload.broodFrames < 3) {
        predictionsToCreate.push({
          apiaryId, hiveId, sourceOperationId,
          analysisType: 'QUEEN_FAILURE_RISK',
          predictionPayload: {
            riskLevel: 'HIGH',
            queenSeen: false,
            broodFrames: payload.broodFrames,
            reason: 'الملكة غير مرئية مع انخفاض إطارات الحضنة',
            recommendation: 'فحص عاجل خلال 3-5 أيام للتحقق من وجود الملكة وإدخال ملكة بديلة إذا لزم'
          },
          confidenceScore: 78.0
        });
      }
    }

    // ========== MERGE-BASED PREDICTIONS ==========
    if (operationType === 'MERGE') {
      predictionsToCreate.push({
        apiaryId, hiveId, sourceOperationId,
        analysisType: 'POST_MERGE_CHECK',
        predictionPayload: {
          expectedOutcome: 'UNIFIED_COLONY',
          reason: 'متابعة ما بعد الدمج للتحقق من قبول الملكة وتوحيد المستعمرة',
          recommendation: 'فحص بعد 7-10 أيام للتحقق من استقرار المستعمرة الموحدة'
        },
        confidenceScore: 95.0
      });
    }

    // ========== SPLIT-BASED PREDICTIONS ==========
    if (operationType === 'SPLIT') {
      predictionsToCreate.push({
        apiaryId, hiveId, sourceOperationId,
        analysisType: 'POST_SPLIT_QUEEN_CHECK',
        predictionPayload: {
          expectedOutcome: 'QUEEN_RAISED_OR_INTRODUCED',
          reason: 'متابعة ما بعد التقسيم للتحقق من تربية ملكة جديدة',
          recommendation: 'فحص بعد 14 يوماً للتحقق من وجود ملكة أو بيض جديد'
        },
        confidenceScore: 90.0
      });
    }

    // ========== FEEDING-BASED PREDICTIONS ==========
    if (operationType === 'FEEDING') {
      if (payload.quantity && payload.quantity >= 2) {
        predictionsToCreate.push({
          apiaryId, hiveId, sourceOperationId,
          analysisType: 'COLONY_GROWTH_ESTIMATE',
          predictionPayload: {
            expectedGrowthTimelineDays: 21,
            feedingQuantityKg: payload.quantity,
            reason: 'التغذية تحفز نمو المستعمرة وإنتاج الحضنة',
            recommendation: 'مراقبة زيادة إطارات الحضنة خلال 3 أسابيع'
          },
          confidenceScore: 72.0
        });
      }
    }

    // ========== SUPER ADDITION PREDICTIONS ==========
    if (operationType === 'ADD_SUPER') {
      predictionsToCreate.push({
        apiaryId, hiveId, sourceOperationId,
        analysisType: 'HONEY_YIELD_ESTIMATE',
        predictionPayload: {
          expectedQuantityKg: (payload.framesInSuper || 5) * 2.5,
          reason: 'إضافة عاسلة جديدة للخلية لاستقبال العسل',
          recommendation: 'القطف المتوقع خلال 4-6 أسابيع من تملأ العاسلة'
        },
        confidenceScore: 75.0
      });
    }

    // Bulk create all new predictions
    if (predictionsToCreate.length > 0) {
      await prisma.operationAnalysis.createMany({ data: predictionsToCreate });
      logger.info(`[Analytics] Generated ${predictionsToCreate.length} new prediction(s) for hive ${hiveId}`);
    }
  }

  /**
   * Returns a summary of all analyses and their match accuracy for a given apiary.
   * Used by the analytics dashboard endpoint.
   */
  async getAnalyticsSummary(apiaryId: string, hiveId?: string) {
    const whereClause: any = { apiaryId };
    if (hiveId) whereClause.hiveId = hiveId;

    const [pendingAnalyses, matchHistory] = await Promise.all([
      prisma.operationAnalysis.findMany({
        where: { ...whereClause, isResolved: false },
        include: {
          hive: { select: { hiveNumber: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.predictionMatch.findMany({
        where: whereClause,
        include: {
          analysis: { select: { analysisType: true } }
        },
        orderBy: { matchedAt: 'desc' },
        take: 50
      })
    ]);

    // Compute average accuracy by analysis type
    const accuracyByType: Record<string, { total: number; count: number }> = {};
    for (const match of matchHistory) {
      const type = match.analysis.analysisType;
      if (!accuracyByType[type]) accuracyByType[type] = { total: 0, count: 0 };
      accuracyByType[type].total += Number(match.accuracyScore);
      accuracyByType[type].count += 1;
    }

    const accuracySummary = Object.entries(accuracyByType).map(([type, { total, count }]) => ({
      analysisType: type,
      averageAccuracy: parseFloat((total / count).toFixed(2)),
      totalMatches: count
    }));

    return {
      pendingPredictions: pendingAnalyses,
      recentMatches: matchHistory,
      accuracySummary,
      stats: {
        totalPending: pendingAnalyses.length,
        totalMatched: matchHistory.length,
        overallAccuracy: matchHistory.length > 0
          ? parseFloat((matchHistory.reduce((sum, m) => sum + Number(m.accuracyScore), 0) / matchHistory.length).toFixed(2))
          : null
      }
    };
  }
}

export const analyticsMatchingService = new AnalyticsMatchingService();
