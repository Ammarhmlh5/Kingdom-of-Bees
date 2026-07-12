import prisma from '../config/prisma';

export interface InspectionQueueItem {
  id: string;
  hiveNumber: string;
  priority: number;
  reason: string;
  daysOverdue: number;
  lastInspection: Date | null;
  aiRecommendation: string | null;
}

export interface FrameDetailData {
  frameId: string;
  position: number;
  broodPercentage?: number;
  broodType?: string;
  broodAge?: string;
  honeyPercentage?: number;
  honeyCappedPercentage?: number;
  pollenPercentage?: number;
  condition?: string;
  notes?: string;
}

export interface InspectionData {
  inspectionDate: Date;
  overallAssessment?: string;
  queenSeen: boolean;
  queenQuality?: string;
  broodFrames: number;
  honeyFrames: number;
  pollenFrames: number;
  foundationAdded?: number;
  framesTransferred?: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  diseases?: string[];
  foodStock?: {
    honey: number;
    pollen: number;
  };
  notes?: string;
  frameDetails?: FrameDetailData[];
  aiConsultation?: {
    question: string;
    answer: string;
  };
}

export class InspectionService {
  /**
   * Get all inspections for an apiary
   */
  async getInspectionsByApiary(apiaryId: string): Promise<any[]> {
    const inspections = await prisma.inspection.findMany({
      where: { apiaryId },
      orderBy: { inspectionDate: 'desc' },
      include: {
        hive: {
          select: {
            id: true,
            hiveNumber: true,
            name: true
          }
        }
      }
    });

    return inspections;
  }

  /**
   * Get inspection queue with priority sorting
   */
  async getInspectionQueue(apiaryId: string): Promise<InspectionQueueItem[]> {
    const hives = await prisma.hive.findMany({
      where: {
        apiaryId,
        status: 'ACTIVE'
      },
      include: {
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { lastInspectionDate: 'asc' }
      ]
    });

    return hives.map(hive => {
      const lastInspection = hive.inspections[0];
      const lastInspectionDate = lastInspection?.inspectionDate || hive.lastInspectionDate;

      let daysOverdue = 0;
      if (lastInspectionDate) {
        const daysSince = Math.floor(
          (Date.now() - new Date(lastInspectionDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        daysOverdue = Math.max(0, daysSince - 7); // Assuming 7 days is the standard interval
      }

      const aiRecs = (hive as any).aiRecommendations;
      return {
        id: hive.id,
        hiveNumber: hive.hiveNumber,
        priority: this.calculatePriority(hive, daysOverdue),
        reason: hive.nextInspectionDue ? 'routine_check' : 'routine_check',
        daysOverdue,
        lastInspection: lastInspectionDate,
        aiRecommendation: aiRecs ? JSON.stringify(aiRecs) : null
      };
    });
  }

  /**
   * Calculate priority based on hive data
   */
  private calculatePriority(hive: any, daysOverdue: number): number {
    let priority = 0;

    if (daysOverdue > 7) priority = 10;
    else if (daysOverdue > 0) priority = 5;
    else if (hive.nextInspectionReason === 'queen_mating_check') priority = 9;
    else if (hive.nextInspectionReason === 'post_split_check') priority = 8;

    return priority;
  }

  /**
   * Record a new inspection
   */
  async recordInspection(
    apiaryId: string,
    hiveId: string,
    userId: string,
    data: InspectionData & { inspectionType?: string }
  ) {
    const inspectionType = data.inspectionType || 'ROUTINE';
    
    return await prisma.$transaction(async (tx) => {
      // 1. Create inspection record
      const validAssessments = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
      const overallAssessment = data.overallAssessment && validAssessments.includes(data.overallAssessment)
        ? data.overallAssessment
        : 'GOOD';

      const inspection = await tx.inspection.create({
        data: {
          hiveId,
          apiaryId,
          inspectionDate: data.inspectionDate,
          inspectionType: inspectionType as any,
          queenSeen: data.queenSeen,
          queenQuality: data.queenQuality as any,
          broodFramesCount: data.broodFrames,
          honeyFramesCount: data.honeyFrames,
          pollenFramesCount: data.pollenFrames,
          notes: data.notes,
          inspectedBy: userId,
          overallAssessment: overallAssessment as any
        }
      });

      // 2. Handle foundation added
      if (data.foundationAdded && data.foundationAdded > 0) {
        await tx.inspectionAction.create({
          data: {
            inspectionId: inspection.id,
            actionType: 'ADDED_FOUNDATION',
            description: `أُضيف ${data.foundationAdded} إطار أساس`,
            details: { count: data.foundationAdded }
          }
        });
      }

      // 3. Handle frame transfers
      if (data.framesTransferred && data.framesTransferred.length > 0) {
        for (const transfer of data.framesTransferred) {
          await tx.inspectionAction.create({
            data: {
              inspectionId: inspection.id,
              actionType: 'MOVED_FRAMES',
              description: `نُقل ${transfer.count} إطار من خلية ${transfer.from} إلى خلية ${transfer.to}`,
              details: {
                count: transfer.count,
                fromHiveId: transfer.from,
                toHiveId: transfer.to
              }
            }
          });
        }
      }

      // 4. Create frame detail records and update HiveFrame current state
      if (data.frameDetails && data.frameDetails.length > 0) {
        for (const frame of data.frameDetails) {
          await tx.inspectionFrameDetail.create({
            data: {
              inspectionId: inspection.id,
              frameId: frame.frameId,
              position: frame.position,
              broodPercentage: frame.broodPercentage,
              broodType: frame.broodType as any,
              broodAge: frame.broodAge as any,
              honeyPercentage: frame.honeyPercentage,
              honeyCappedPercentage: frame.honeyCappedPercentage,
              pollenPercentage: frame.pollenPercentage,
              condition: frame.condition,
              notes: frame.notes
            }
          });

          await tx.hiveFrame.update({
            where: { id: frame.frameId },
            data: {
              broodPercentage: frame.broodPercentage ?? 0,
              honeyPercentage: frame.honeyPercentage ?? 0,
              pollenPercentage: frame.pollenPercentage ?? 0,
              condition: (frame.condition as any) ?? 'GOOD',
              lastUpdated: new Date(),
              updatedBy: userId,
            }
          });
        }
      }

      // 6. Update hive last inspection date and strength rating
      const assessmentToStrength: Record<string, string> = {
        'EXCELLENT': 'VERY_STRONG',
        'GOOD': 'STRONG',
        'FAIR': 'MEDIUM',
        'POOR': 'WEAK',
        'CRITICAL': 'CRITICAL',
      };

      await tx.hive.update({
        where: { id: hiveId },
        data: {
          lastInspectionDate: data.inspectionDate,
          nextInspectionDue: null,
          strengthRating: (assessmentToStrength[overallAssessment] || 'MEDIUM') as any,
        }
      });

      // 7. Store AI consultation if provided
      if (data.aiConsultation) {
        await tx.hive.update({
          where: { id: hiveId },
          data: {
            aiRecommendations: data.aiConsultation as any
          }
        });
      }

      // 8. Log in ApiaryOperation
      const hive = await tx.hive.findUnique({ where: { id: hiveId } });

      const opRecord = await tx.apiaryOperation.create({
        data: {
          apiaryId,
          operationType: 'INSPECTION',
          hiveId,
          description: `فحص الخلية ${hive?.hiveNumber || ''}`,
          performedBy: userId,
          operationDate: new Date(data.inspectionDate),
          data: {
            inspectionId: inspection.id,
            broodFrames: data.broodFrames,
            honeyFrames: data.honeyFrames,
            queenSeen: data.queenSeen,
            notes: data.notes
          }
        }
      });

      // 8. Schedule next inspection
      if (inspectionType !== 'QUICK_CHECK') {
        const setting = await tx.inspectionSetting.findUnique({
          where: { type: inspectionType }
        });

        if (setting && setting.isActive) {
          const nextDate = new Date(data.inspectionDate);
          nextDate.setDate(nextDate.getDate() + setting.maxInterval);

          const pendingSchedule = await tx.inspectionSchedule.findFirst({
            where: {
              hiveId,
              status: 'PENDING'
            },
            orderBy: { scheduledDate: 'asc' }
          });

          if (pendingSchedule) {
            await tx.inspectionSchedule.update({
              where: { id: pendingSchedule.id },
              data: {
                status: 'COMPLETED',
                completedAt: new Date()
              }
            });
          }

          await tx.inspectionSchedule.create({
            data: {
              hiveId,
              settingId: setting.id,
              apiaryId,
              scheduledDate: nextDate,
              status: 'PENDING'
            }
          });
        }
      }

      return { inspection, opRecord };
    });
  }

  /**
   * Calculate and update hive priorities
   */
  async updatePriorities(apiaryId: string) {
    const hives = await prisma.hive.findMany({
      where: { apiaryId, status: 'ACTIVE' },
      include: {
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        },
        splitAsMother: {
          orderBy: { splitDate: 'desc' },
          take: 1
        }
      }
    });

    for (const hive of hives) {
      let priority = 0;
      let reason = 'routine_check';

      const lastInspection = hive.inspections[0];
      const daysSinceInspection = lastInspection
        ? Math.floor((Date.now() - new Date(lastInspection.inspectionDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // High priority: Overdue inspection
      if (daysSinceInspection > 14) {
        priority = 10;
        reason = 'overdue_inspection';
      }

      // High priority: Recent split - check for queen mating
      const lastSplit = hive.splitAsMother[0];
      if (lastSplit) {
        const daysSinceSplit = Math.floor(
          (Date.now() - new Date(lastSplit.splitDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceSplit >= 14 && daysSinceSplit <= 21) {
          priority = Math.max(priority, 9);
          reason = 'queen_mating_check';
        }
      }

      // Medium priority: Regular inspection due
      if (daysSinceInspection >= 7 && priority < 5) {
        priority = 5;
        reason = 'routine_check_due';
      }

      await prisma.hive.update({
        where: { id: hive.id },
        data: { nextInspectionDue: reason as any }
      });
    }
  }
}

export const inspectionService = new InspectionService();
