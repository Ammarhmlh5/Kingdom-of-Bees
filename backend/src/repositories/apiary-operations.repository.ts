import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export class ApiaryOperationsRepository {
    async getOperations(apiaryId: string, filters: {
        operationType?: string;
        startDate?: string;
        endDate?: string;
        assessmentType?: string;
    } = {}) {
        const where: any = { apiaryId };

        if (filters.assessmentType) {
            where.operationType = 'OTHER';
        } else if (filters.operationType) {
            where.operationType = filters.operationType;
        }
        if (filters.startDate || filters.endDate) {
            where.operationDate = {};
            if (filters.startDate) where.operationDate.gte = new Date(filters.startDate);
            if (filters.endDate) where.operationDate.lte = new Date(filters.endDate);
        }

        const results = await prisma.apiaryOperation.findMany({
            where,
            include: {
                hive: { select: { hiveNumber: true, name: true } },
                user: { select: { fullName: true } }
            },
            orderBy: { operationDate: 'desc' }
        });

        if (filters.assessmentType) {
            return results.filter(op => {
                const d = op.data as Record<string, any> | null;
                return d?.assessmentType === filters.assessmentType;
            });
        }

        return results;
    }

    async createOperation(apiaryId: string, data: {
        operationType: string;
        hiveId?: string;
        description: string;
        performedBy?: string;
        operationDate: string;
        sourceRecordId?: string;
        sourceType?: string;
        extraData?: Record<string, any>;
    }) {
        return prisma.$transaction(async (tx) => {
            return tx.apiaryOperation.create({
                data: {
                    apiaryId,
                    operationType: data.operationType as any,
                    hiveId: data.hiveId || null,
                    description: data.description,
                    performedBy: data.performedBy || null,
                    operationDate: new Date(data.operationDate),
                    data: data.extraData || {}
                },
                include: {
                    hive: { select: { hiveNumber: true, name: true } },
                    user: { select: { fullName: true } }
                }
            });
        });
    }

    async updateOperation(operationId: string, apiaryId: string, data: {
        description?: string;
        operationDate?: string;
        extraData?: Record<string, any>;
    }) {
        const op = await prisma.apiaryOperation.findFirst({
            where: { id: operationId, apiaryId }
        });
        if (!op) return null;

        const updatedOp = await prisma.apiaryOperation.update({
            where: { id: operationId },
            data: {
                ...(data.description !== undefined && { description: data.description }),
                ...(data.operationDate && { operationDate: new Date(data.operationDate) }),
                ...(data.extraData !== undefined && { data: data.extraData })
            },
            include: {
                hive: { select: { hiveNumber: true, name: true } },
                user: { select: { fullName: true } }
            }
        });

        // Sync Inspection record when editing an INSPECTION operation
        if (op.operationType === 'INSPECTION' && data.extraData && op.hiveId) {
            try {
                const ed = data.extraData;
                let inspection = null;

                if (ed.inspectionId) {
                    inspection = await prisma.inspection.findFirst({
                        where: { id: ed.inspectionId, apiaryId }
                    });
                }

                // Fallback: match by hiveId + operationDate
                if (!inspection) {
                    const inspectionDate = data.operationDate
                        ? new Date(data.operationDate)
                        : op.operationDate;
                    const startOfDay = new Date(inspectionDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(inspectionDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    inspection = await prisma.inspection.findFirst({
                        where: {
                            apiaryId,
                            hiveId: op.hiveId,
                            inspectionDate: { gte: startOfDay, lte: endOfDay }
                        },
                        orderBy: { createdAt: 'desc' }
                    });
                }

                if (inspection) {
                    await prisma.inspection.update({
                        where: { id: inspection.id },
                        data: {
                            ...(ed.overallAssessment !== undefined && { overallAssessment: ed.overallAssessment }),
                            ...(ed.queenSeen !== undefined && { queenSeen: ed.queenSeen }),
                            ...(ed.queenQuality !== undefined && { queenQuality: ed.queenQuality }),
                            ...(ed.broodFrames !== undefined && { broodFramesCount: ed.broodFrames }),
                            ...(ed.honeyFrames !== undefined && { honeyFramesCount: ed.honeyFrames }),
                            ...(ed.pollenFrames !== undefined && { pollenFramesCount: ed.pollenFrames }),
                            ...(ed.notes !== undefined && { notes: ed.notes }),
                        }
                    });

                    // Sync HiveFrame records
                    if (ed.frameDetails && Array.isArray(ed.frameDetails)) {
                        for (const fd of ed.frameDetails) {
                            await prisma.hiveFrame.update({
                                where: { id: fd.frameId },
                                data: {
                                    broodPercentage: fd.broodPercentage ?? 0,
                                    honeyPercentage: fd.honeyPercentage ?? 0,
                                    pollenPercentage: fd.pollenPercentage ?? 0,
                                    condition: fd.condition ?? 'GOOD',
                                    lastUpdated: new Date(),
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                logger.error('[Repository] Failed to sync Inspection record:', error);
            }
        }

        return updatedOp;
    }

    async deleteOperation(operationId: string, apiaryId: string) {
        const op = await prisma.apiaryOperation.findFirst({
            where: { id: operationId, apiaryId }
        });
        if (!op) return null;
        return prisma.apiaryOperation.delete({ where: { id: operationId } });
    }
}

export const apiaryOperationsRepository = new ApiaryOperationsRepository();
