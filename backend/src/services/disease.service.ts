import { diseaseRepository } from '../repositories/disease.repository';
import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export class DiseaseService {

    async getActiveDiseases(apiaryId: string) {
        return diseaseRepository.findAllByApiaryId(apiaryId);
    }

    async getLibrary() {
        return diseaseRepository.getLibrary();
    }

    async reportOutbreak(apiaryId: string, userId: string, data: {
        diseaseId: string;
        hiveIds: string[];
        date?: Date;
        notes?: string;
        treatmentId?: string;
    }) {
        // 1. Create disease record
        const diseaseRecord = await diseaseRepository.create({
            apiary: { connect: { id: apiaryId } },
            disease: { connect: { id: data.diseaseId } },
            detector: { connect: { id: userId } },
            firstDetectedDate: data.date || new Date(),
            hives: {
                connect: data.hiveIds.map(id => ({ id }))
            },
            totalAffectedHives: data.hiveIds.length,
            status: 'ACTIVE',
            notes: data.notes
        });

        // 2. Create TreatmentPlan if treatmentId is provided
        if (data.treatmentId) {
            const treatment = await prisma.diseaseTreatment.findUnique({
                where: { id: data.treatmentId }
            });
            if (treatment) {
                logger.info(`[DiseaseService] Treatment planned: ${treatment.nameAr}, duration: ${treatment.durationDays} days`);
            }
        }

        // 3. Log ApiaryOperation for each affected hive
        for (const hiveId of data.hiveIds) {
            const hive = await prisma.hive.findUnique({ where: { id: hiveId } });

            const opRecord = await prisma.apiaryOperation.create({
                data: {
                    apiaryId,
                    operationType: 'TREATMENT',
                    hiveId,
                    description: `تسجيل تفشي مرض في الخلية ${hive?.hiveNumber || ''}`,
                    performedBy: userId,
                    operationDate: data.date || new Date(),
                    data: {
                        diseaseId: data.diseaseId,
                        treatmentId: data.treatmentId,
                        totalAffectedHives: data.hiveIds.length,
                        notes: data.notes,
                        sourceRecordId: diseaseRecord.id
                    }
                }
            });

            // Fire & Forget: resolve DISEASE_RISK_PREDICTION if any
            analyticsMatchingService.processOperationAsync(
                apiaryId,
                hiveId,
                opRecord.id,
                'DISEASE_REPORT',
                { diseaseId: data.diseaseId, treatmentId: data.treatmentId, notes: data.notes }
            );
        }

        return diseaseRecord;
    }

    async getAllUserDiseases(userId: string) {
        return prisma.diseaseRecord.findMany({
            where: {
                apiary: {
                    ownerId: userId
                }
            },
            orderBy: { firstDetectedDate: 'desc' },
            include: {
                disease: true,
                hives: { select: { hiveNumber: true, name: true } },
                apiary: { select: { name: true } },
                detector: { select: { fullName: true } }
            }
        });
    }

    async resolveDisease(apiaryId: string, recordId: string, outcome: string) {
        return diseaseRepository.update(recordId, apiaryId, {
            status: 'RESOLVED',
            resolutionDate: new Date(),
            outcome
        });
    }

    async deleteDiseaseRecord(apiaryId: string, recordId: string) {
        return diseaseRepository.delete(recordId, apiaryId);
    }
}

export const diseaseService = new DiseaseService();
