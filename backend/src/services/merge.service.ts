import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export interface MergeCandidate {
  hiveId: string;
  hiveNumber: string;
  riskLevel: number;
  survivalChance: number;
  recommendation: string;
}

export interface MergeSuggestion {
  weakHive: string;
  targetHive: string;
  queenToKeep: string;
  safetyProtocol: string[];
}

export interface MergeData {
  targetHiveId: string;
  mergeMethod: 'NEWSPAPER' | 'DIRECT' | 'GRADUAL';
  queenKept: 'WEAK' | 'TARGET';
  safetyProtocol: string[];
  notes?: string;
}

export class MergeService {
  /**
   * Get merge candidates based on season
   */
  async getMergeCandidates(
    apiaryId: string,
    season: 'SPRING' | 'AUTUMN'
  ): Promise<{
    weakHives: MergeCandidate[];
    suggestedMerges: MergeSuggestion[];
  }> {
    const hives = await prisma.hive.findMany({
      where: {
        apiaryId,
        status: 'ACTIVE'
      },
      include: {
        frames: true,
        queen: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      }
    });

    const weakHives: MergeCandidate[] = [];
    const strongHives = [];

    for (const hive of hives) {
      const broodFrames = hive.frames.filter(f => f.broodPercentage > 50).length;
      const strengthScore = hive.strengthScore || 0;

      // Identify weak hives
      if (season === 'AUTUMN' && (broodFrames < 4 || strengthScore < 50)) {
        const survivalChance = this.calculateSurvivalChance(hive);
        const riskLevel = 100 - survivalChance;

        weakHives.push({
          hiveId: hive.id,
          hiveNumber: hive.hiveNumber,
          riskLevel,
          survivalChance,
          recommendation: survivalChance < 30
            ? 'خطر عالي - يجب الدمج فوراً'
            : 'خطر متوسط - يفضل الدمج قبل الشتاء'
        });
      } else if (strengthScore >= 70) {
        strongHives.push(hive);
      }
    }

    // Generate merge suggestions
    const suggestedMerges: MergeSuggestion[] = [];
    for (const weak of weakHives) {
      const weakHive = hives.find(h => h.id === weak.hiveId);
      if (!weakHive) continue;

      // Find best target hive
      const target = strongHives.find(h => h.id !== weak.hiveId);
      if (target) {
        suggestedMerges.push({
          weakHive: weak.hiveId,
          targetHive: target.id,
          queenToKeep: this.determineQueenToKeep(weakHive, target),
          safetyProtocol: this.getSafetyProtocol('NEWSPAPER')
        });
      }
    }

    return {
      weakHives: weakHives.sort((a, b) => b.riskLevel - a.riskLevel),
      suggestedMerges
    };
  }

  /**
   * Execute merge operation
   */
  async executeMerge(
    apiaryId: string,
    weakHiveId: string,
    userId: string,
    data: MergeData
  ) {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get both hives
      const weakHive = await tx.hive.findUnique({
        where: { id: weakHiveId },
        include: { frames: true, queen: true }
      });

      const targetHive = await tx.hive.findUnique({
        where: { id: data.targetHiveId },
        include: { frames: true }
      });

      if (!weakHive || !targetHive) {
        throw new Error('Hive not found');
      }

      // 2. Move all frames from weak hive to target
      const targetMaxStory = targetHive.stories || 1;
      await tx.hiveFrame.updateMany({
        where: { hiveId: weakHiveId },
        data: {
          hiveId: data.targetHiveId,
          story: targetMaxStory + 1
        }
      });

      // 3. Update target hive stories
      await tx.hive.update({
        where: { id: data.targetHiveId },
        data: {
          stories: targetMaxStory + (weakHive.stories || 1)
        }
      });

      // 4. Record merge operation
      const mergeOperation = await tx.mergeOperation.create({
        data: {
          apiaryId,
          mergedHiveId: weakHiveId,
          survivorHiveId: data.targetHiveId,
          mergeDate: new Date(),
          method: 'DIRECT',
          queenKept: data.queenKept || 'TARGET',
          outcome: { success: true, notes: data.notes || '' },
          notes: data.notes
        }
      });

      // 5. Deactivate weak hive
      await tx.hive.update({
        where: { id: weakHiveId },
        data: {
          status: 'DEAD',
          condition: 'CRITICAL',
          notes: `تم الدمج مع الخلية ${targetHive.hiveNumber} بتاريخ ${new Date().toLocaleDateString('ar')}`
        }
      });

      // 6. Record in ApiaryOperation
      const opRecord = await tx.apiaryOperation.create({
        data: {
          apiaryId,
          operationType: 'MERGE',
          hiveId: data.targetHiveId,
          description: `دمج الخلية ${weakHive.hiveNumber} مع الخلية ${targetHive.hiveNumber}`,
          performedBy: userId,
          operationDate: new Date(),
          data: {
            weakHiveId,
            targetHiveId: data.targetHiveId,
            method: data.mergeMethod,
            queenKept: data.queenKept,
            safetyProtocol: data.safetyProtocol,
            notes: data.notes
          }
        }
      });

      // 7. Set priority for monitoring
      await tx.hive.update({
        where: { id: data.targetHiveId },
        data: {
          nextInspectionDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      return {
        mergeOperation,
        targetHive,
        weakHive,
        opRecord
      };
    });

    // Fire & Forget background analytics and matching
    analyticsMatchingService.processOperationAsync(
      apiaryId,
      data.targetHiveId,
      result.opRecord.id,
      'MERGE',
      data
    );

    return {
      mergeOperation: result.mergeOperation,
      targetHive: result.targetHive,
      weakHive: result.weakHive,
      opRecord: result.opRecord
    };
  }

  /**
   * Calculate survival chance for winter
   */
  private calculateSurvivalChance(hive: any): number {
    let chance = 50; // Base chance

    const broodFrames = hive.frames.filter((f: any) => f.broodPercentage > 50).length;
    const honeyFrames = hive.frames.filter((f: any) => f.honeyPercentage > 50).length;

    // Brood frames factor
    chance += broodFrames * 5;

    // Honey stores factor
    chance += honeyFrames * 3;

    // Strength score factor
    if (hive.strengthScore) {
      chance += (hive.strengthScore - 50) / 2;
    }

    // Queen age factor
    if (hive.queen && hive.queenAge) {
      if (hive.queenAge < 12) chance += 10;
      else if (hive.queenAge > 24) chance -= 10;
    }

    return Math.max(0, Math.min(100, chance));
  }

  /**
   * Determine which queen to keep
   */
  private determineQueenToKeep(weakHive: any, targetHive: any): string {
    // Prefer younger queen
    if (weakHive.queenAge && targetHive.queenAge) {
      return weakHive.queenAge < targetHive.queenAge ? 'WEAK' : 'TARGET';
    }

    // Prefer marked queen
    if (weakHive.queenMarked && !targetHive.queenMarked) return 'WEAK';
    if (!weakHive.queenMarked && targetHive.queenMarked) return 'TARGET';

    // Default to target (stronger hive)
    return 'TARGET';
  }

  /**
   * Get safety protocol for merge method
   */
  private getSafetyProtocol(method: string): string[] {
    const protocols: Record<string, string[]> = {
      NEWSPAPER: [
        'ضع ورقة جريدة بين الخليتين',
        'اثقب الورقة بثقوب صغيرة',
        'النحل سيقرض الورقة تدريجياً',
        'يساعد على توحيد الرائحة'
      ],
      DIRECT: [
        'رش النحل بماء سكري خفيف',
        'ضع قطرات من الفانيليا',
        'ادمج بسرعة',
        'راقب لمدة ساعة'
      ],
      GRADUAL: [
        'قرب الخليتين تدريجياً',
        'كل يوم متر واحد',
        'استمر لمدة أسبوع',
        'ثم ادمج بطريقة الجريدة'
      ]
    };

    return protocols[method] || protocols.NEWSPAPER;
  }
}

export const mergeService = new MergeService();

