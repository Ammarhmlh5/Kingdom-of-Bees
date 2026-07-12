import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export interface SuperCandidate {
  hiveId: string;
  hiveNumber: string;
  readiness: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER' | 'MONITOR';
  targetStory: 2 | 3;
  currentStories: number;
  recommendation: string;
  frameSuggestions: {
    framesToMoveUp: string[];
    framesToAdd: string[];
  };
}

export interface SuperData {
  operationType: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER';
  targetStory: 2 | 3;
  framesInSuper: number;
  hasExcluder: boolean;
  framesMovedUp: string[];
  expectedYield?: number;
  notes?: string;
}

export class SuperService {
  /**
   * Get hives ready for supers
   */
  async getSuperCandidates(apiaryId: string): Promise<{
    candidates: SuperCandidate[];
    seasonalContext: {
      season: string;
      flows: string[];
      daysUntilPeak: number;
    };
  }> {
    const hives = await prisma.hive.findMany({
      where: {
        apiaryId,
        status: 'ACTIVE'
      },
      include: {
        frames: true,
        supers: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      }
    });

    const strengthRatingScore = (rating: any): number => {
      const map: Record<string, number> = {
        VERY_STRONG: 90, STRONG: 75, MEDIUM: 50, WEAK: 30, VERY_WEAK: 15, CRITICAL: 0
      };
      return map[rating] ?? 0;
    };

    const candidates: SuperCandidate[] = [];
    const currentMonth = new Date().getMonth() + 1;

    for (const hive of hives) {
      const currentStories = hive.stories || 1;
      const strengthScore = hive.strengthScore ?? strengthRatingScore(hive.strengthRating);
      let readiness: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER' | 'MONITOR' = 'MONITOR';
      let targetStory: 2 | 3 = 2;
      let recommendation = '';
      const frameSuggestions = {
        framesToMoveUp: [] as string[],
        framesToAdd: [] as string[]
      };

      if (currentStories === 1) {
        const broodFrames = hive.frames.filter(f =>
          f.story === 1 && f.broodPercentage > 50
        ).length;

        if (broodFrames >= 5 && strengthScore >= 60) {
          readiness = 'ADD_SECOND_STORY';
          targetStory = 2;
          recommendation = broodFrames >= 7
            ? 'الخلية قوية وجاهزة لرفع دور ثاني'
            : 'الخلية في تقدم مستمر - مناسبة لرفع دور ثاني';

          const broodFramesToMove = hive.frames
            .filter(f => f.story === 1 && f.broodPercentage > 60)
            .slice(0, 2)
            .map(f => f.id);
          frameSuggestions.framesToMoveUp = broodFramesToMove;

        } else if (strengthScore >= 50) {
          recommendation = broodFrames >= 3
            ? 'را接近 التجهيز لرفع دور ثاني، راقب تطور الحاضنة'
            : 'الخلية في طور النمو، تحتاج مزيداً من الوقت قبل رفع دور ثاني';
        } else {
          recommendation = 'الخلية تحتاج لمزيد من التقوية قبل رفع دور ثاني';
        }

      } else if (currentStories === 2) {
        const topHoneyFrames = hive.frames.filter(f =>
          f.story === 2 && f.honeyPercentage > 50
        ).length;
        const bottomBroodFrames = hive.frames.filter(f =>
          f.story === 1 && f.broodPercentage > 50
        ).length;

        if (topHoneyFrames >= 4 && strengthScore >= 70 && bottomBroodFrames >= 5) {
          readiness = 'ADD_THIRD_STORY';
          targetStory = 3;
          recommendation = 'الطابق الثاني يحتوي عسلاً - الخلية جاهزة لرفع دور ثالث';

          const honeyFramesToMove = hive.frames
            .filter(f => f.story === 2 && f.honeyPercentage > 60)
            .slice(0, 2)
            .map(f => f.id);
          frameSuggestions.framesToMoveUp = honeyFramesToMove;

        } else if (topHoneyFrames >= 2 && strengthScore >= 65) {
          readiness = 'ADD_EXCLUDER';
          targetStory = 2;
          recommendation = 'يوجد عسل بالطابق الثاني - يفضل إضافة حاجز ملكات';

        } else if (strengthScore >= 50) {
          recommendation = 'الخلية في حالة جيدة، راقب تطور الطابق الثاني';
        } else {
          recommendation = 'الخلية تحتاج لمزيد من التقوية';
        }

      } else {
        if (strengthScore >= 50) {
          recommendation = 'الخلية في حالة جيدة - الطوابق كافية';
        } else {
          recommendation = 'الخلية تحتاج للتقوية';
        }
      }

      if (readiness !== 'MONITOR') {
        candidates.push({
          hiveId: hive.id,
          hiveNumber: hive.hiveNumber,
          readiness,
          targetStory,
          currentStories,
          recommendation,
          frameSuggestions
        });
      }
    }

    // Determine seasonal context
    const seasonalContext = this.getSeasonalContext(currentMonth);

    return {
      candidates: candidates.sort((a, b) => {
        const order = { ADD_SECOND_STORY: 4, ADD_THIRD_STORY: 3, ADD_EXCLUDER: 2, MONITOR: 1 };
        return order[b.readiness] - order[a.readiness];
      }),
      seasonalContext
    };
  }

  /**
   * Add super to hive
   */
  async addSuper(
    apiaryId: string,
    hiveId: string,
    userId: string,
    data: SuperData
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const hive = await tx.hive.findUnique({
        where: { id: hiveId }
      });

      if (!hive) {
        throw new Error('Hive not found');
      }

      const isAddingStory = data.operationType === 'ADD_SECOND_STORY' || data.operationType === 'ADD_THIRD_STORY';
      const nextStory = isAddingStory ? (hive.stories || 1) + 1 : hive.stories || 1;
      const operationLabel = data.operationType === 'ADD_SECOND_STORY' ? 'دور ثاني'
        : data.operationType === 'ADD_THIRD_STORY' ? 'دور ثالث'
        : 'حاجز ملكات';

      // 1. Create super record (for story additions)
      if (isAddingStory) {
        await tx.hiveSuper.create({
          data: {
            hiveId,
            superNumber: nextStory - 1,
            frameCount: data.framesInSuper,
            queenExcluder: data.hasExcluder,
            addedDate: new Date(),
            status: 'ACTIVE',
            estimatedYieldKg: data.expectedYield
          }
        });
      }

      // 2. Move frames up if specified (from source story to new story)
      if (data.framesMovedUp && data.framesMovedUp.length > 0) {
        await tx.hiveFrame.updateMany({
          where: { id: { in: data.framesMovedUp } },
          data: { story: nextStory }
        });
      }

      // 3. Create new frames in the new story
      if (isAddingStory) {
        const newFrames = [];
        for (let i = 1; i <= data.framesInSuper; i++) {
          newFrames.push({
            hiveId,
            story: nextStory,
            position: i,
            frameType: 'STANDARD' as any,
            condition: 'GOOD' as any
          });
        }
        await tx.hiveFrame.createMany({ data: newFrames });
      }

      // 4. Update hive stories count if adding story
      if (isAddingStory) {
        await tx.hive.update({
          where: { id: hiveId },
          data: { stories: nextStory }
        });
      }

      // 5. Update queen excluder setting
      if (data.hasExcluder) {
        await tx.hiveSuper.updateMany({
          where: { hiveId, status: 'ACTIVE' },
          data: { queenExcluder: true }
        });
      }

      // 6. Record super operation
      const superOperation = await (tx as any).superOperation.create({
        data: {
          apiaryId,
          hiveId,
          operationType: data.operationType,
          operationDate: new Date(),
          superNumber: isAddingStory ? nextStory - 1 : 0,
          framesInSuper: data.framesInSuper,
          hasExcluder: data.hasExcluder,
          framesMovedUp: data.framesMovedUp,
          expectedYield: data.expectedYield,
          performedBy: userId,
          notes: data.notes
        }
      });

      // 7. Record in ApiaryOperation
      const opRecord = await tx.apiaryOperation.create({
        data: {
          apiaryId,
          operationType: 'ADD_SUPER' as any,
          hiveId,
          description: `رفع ${operationLabel} ${isAddingStory ? `${data.framesInSuper} إطار` : ''} للخلية ${hive.hiveNumber}`,
          performedBy: userId,
          operationDate: new Date(),
          data: {
            targetStory: nextStory,
            framesInSuper: data.framesInSuper,
            hasExcluder: data.hasExcluder,
            framesMovedUp: data.framesMovedUp,
            expectedYield: data.expectedYield,
            notes: data.notes,
            sourceRecordId: superOperation.id
          }
        }
      });

      // 8. Update hive priority
      await tx.hive.update({
        where: { id: hiveId },
        data: {
          nextInspectionDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      });

      return {
        superRecord: superOperation,
        hive,
        newStoryNumber: nextStory,
        opRecord
      };
    });

    analyticsMatchingService.processOperationAsync(
      apiaryId,
      hiveId,
      result.opRecord.id,
      'ADD_SUPER',
      data
    );

    return {
      superRecord: result.superRecord,
      hive: result.hive,
      newStoryNumber: result.newStoryNumber,
      opRecord: result.opRecord
    };
  }

  /**
   * Get seasonal context
   */
  private getSeasonalContext(month: number): {
    season: string;
    flows: string[];
    daysUntilPeak: number;
  } {
    // Saudi Arabia seasons (approximate)
    const seasons: Record<number, any> = {
      1: { season: 'شتاء', flows: ['السمر'], daysUntilPeak: 60 },
      2: { season: 'شتاء', flows: ['السمر', 'الطلح'], daysUntilPeak: 30 },
      3: { season: 'ربيع', flows: ['الطلح', 'السدر الربيعي'], daysUntilPeak: 15 },
      4: { season: 'ربيع', flows: ['السدر الربيعي'], daysUntilPeak: 45 },
      5: { season: 'ربيع', flows: ['الصيفي'], daysUntilPeak: 30 },
      6: { season: 'صيف', flows: ['الصيفي'], daysUntilPeak: 60 },
      7: { season: 'صيف', flows: [], daysUntilPeak: 90 },
      8: { season: 'صيف', flows: [], daysUntilPeak: 120 },
      9: { season: 'خريف', flows: ['السدر'], daysUntilPeak: 60 },
      10: { season: 'خريف', flows: ['السدر'], daysUntilPeak: 30 },
      11: { season: 'خريف', flows: ['السدر'], daysUntilPeak: 15 },
      12: { season: 'شتاء', flows: ['السمر'], daysUntilPeak: 45 }
    };

    return seasons[month] || { season: 'غير محدد', flows: [], daysUntilPeak: 0 };
  }
}

export const superService = new SuperService();

