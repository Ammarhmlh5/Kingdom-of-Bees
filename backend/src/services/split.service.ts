import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export interface SplitCandidate {
  hiveId: string;
  hiveNumber: string;
  strengthScore: number;
  readinessLevel: 'READY' | 'SOON' | 'NOT_READY';
  recommendation: string;
  estimatedFrames: number;
}

export interface SplitData {
  newHiveNumber: string;
  framesTransferred: Array<{
    frameId: string;
    rating: number;
    type: 'BROOD' | 'HONEY' | 'POLLEN';
  }>;
  queenLocation: 'SOURCE' | 'RESULT' | 'BOTH_NEW';
  notes?: string;
}

export class SplitService {
  /**
   * Analyze hives and return split candidates
   */
  async getSplitCandidates(apiaryId: string): Promise<SplitCandidate[]> {
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

    const candidates: SplitCandidate[] = [];

    for (const hive of hives) {
      // Calculate strength score
      const broodFrames = hive.frames.filter(f => f.broodPercentage > 50).length;
      const strengthScore = hive.strengthScore || 0;

      // Determine readiness
      let readinessLevel: 'READY' | 'SOON' | 'NOT_READY' = 'NOT_READY';
      let recommendation = '';

      if (broodFrames >= 8 && strengthScore >= 80) {
        readinessLevel = 'READY';
        recommendation = 'الخلية قوية وجاهزة للتقسيم بشكل ممتاز. يوصى بالتقسيم فوراً لزيادة عدد الخلايا.';
      } else if (broodFrames >= 6 && strengthScore >= 70) {
        readinessLevel = 'SOON';
        recommendation = 'الخلية في طور النمو الجيد. يتوقع جهوزيتها للتقسيم خلال 2-3 أسابيع.';
      } else {
        recommendation = 'الخلية لا تزال قيد التأسيس وغير جاهزة للتقسيم حالياً. يحتاج المنحل لمزيد من التغذية والرعاية.';
      }

      if (readinessLevel !== 'NOT_READY') {
        candidates.push({
          hiveId: hive.id,
          hiveNumber: hive.hiveNumber,
          strengthScore,
          readinessLevel,
          recommendation,
          estimatedFrames: Math.floor(broodFrames / 2)
        });
      }
    }

    return candidates.sort((a, b) => b.strengthScore - a.strengthScore);
  }

  /**
   * Execute split operation
   */
  async executeSplit(
    apiaryId: string,
    sourceHiveId: string,
    userId: string,
    data: SplitData
  ) {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get source hive
      const sourceHive = await tx.hive.findUnique({
        where: { id: sourceHiveId },
        include: { hiveType: true, beeBreed: true }
      });

      if (!sourceHive) {
        throw new Error('Source hive not found');
      }

      // 2. Create new hive
      const newHive = await tx.hive.create({
        data: {
          apiaryId,
          hiveNumber: data.newHiveNumber,
          name: `تقسيم من ${sourceHive.hiveNumber}`,
          hiveTypeId: sourceHive.hiveTypeId,
          beeBreedId: sourceHive.beeBreedId,
          status: 'ACTIVE',
          stories: 1,
          framesPerBox: sourceHive.framesPerBox,
          nextInspectionDue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        }
      });

      // 3. Transfer frames
      const frameIds = data.framesTransferred.map(f => f.frameId);
      await tx.hiveFrame.updateMany({
        where: { id: { in: frameIds } },
        data: { hiveId: newHive.id }
      });

      // 4. Record split operation
      const splitOperation = await tx.splitOperation.create({
        data: {
          apiaryId,
          motherHiveId: sourceHiveId,
          newHiveIds: [newHive.id],
          newHivesCount: 1,
          splitDate: new Date(),
          splitType: 'WALK_AWAY',
          method: 'STANDARD',
          resourceDistribution: { frames: 2, honey: 0, pollen: 0 },
          notes: data.notes
        }
      });

      // 5. Record in ApiaryOperation
      const opRecord = await tx.apiaryOperation.create({
        data: {
          apiaryId,
          operationType: 'SPLIT',
          hiveId: sourceHiveId,
          description: `تقسيم الخلية ${sourceHive.hiveNumber} وإنشاء خلية جديدة رقم ${data.newHiveNumber}`,
          performedBy: userId,
          operationDate: new Date(),
          data: {
            newHiveId: newHive.id,
            newHiveNumber: data.newHiveNumber,
            queenLocation: data.queenLocation,
            notes: data.notes
          }
        }
      });

      // 6. Update source hive priority
      await tx.hive.update({
        where: { id: sourceHiveId },
        data: {
          nextInspectionDue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        }
      });

      return {
        splitOperation,
        newHive,
        sourceHive,
        opRecord
      };
    });

    // Fire & Forget background analytics and prediction matching
    analyticsMatchingService.processOperationAsync(
      apiaryId,
      sourceHiveId,
      result.opRecord.id,
      'SPLIT',
      data
    );

    return {
      splitOperation: result.splitOperation,
      newHive: result.newHive,
      sourceHive: result.sourceHive
    };
  }
}

export const splitService = new SplitService();

