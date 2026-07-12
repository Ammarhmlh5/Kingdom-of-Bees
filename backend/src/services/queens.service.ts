import { queensRepository } from '../repositories/queens.repository';
import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export class QueensService {
    async getQueensByApiary(apiaryId: string) {
        return queensRepository.getQueensByApiary(apiaryId);
    }

    async createQueen(apiaryId: string, userId: string, data: {
        queenNumber?: string;
        source: string;
        beeBreedId?: string;
        birthDate?: string;
        introductionDate?: string;
        marked?: boolean;
        markColor?: string;
        hiveId?: string;
    }) {
        if (!data.source) {
            throw new Error('مصدر الملكة مطلوب');
        }

        // Verify hive belongs to this apiary
        if (data.hiveId) {
            const hive = await prisma.hive.findFirst({
                where: { id: data.hiveId, apiaryId }
            });
            if (!hive) throw new Error('الخلية غير موجودة في هذا المنحل');
        }

        const queen = await queensRepository.createQueen(data);

        // Log in ApiaryOperation for unified operations log visibility
        const opRecord = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'TREATMENT',
                hiveId: data.hiveId || null,
                description: `إدخال ملكة جديدة${data.queenNumber ? ` رقم ${data.queenNumber}` : ''}${data.hiveId ? ' في الخلية' : ''}`,
                performedBy: userId,
                operationDate: new Date(),
                data: {
                    queenId: queen.id,
                    queenNumber: data.queenNumber,
                    source: data.source,
                    marked: data.marked,
                    markColor: data.markColor,
                    hiveId: data.hiveId
                }
            }
        });

        // Fire & Forget: resolve QUEEN_FAILURE_RISK if a new queen was introduced to this hive
        if (data.hiveId) {
            analyticsMatchingService.processOperationAsync(
                apiaryId,
                data.hiveId,
                opRecord.id,
                'QUEEN_INTRODUCTION',
                { queenId: queen.id, source: data.source }
            );
        }

        return queen;
    }

    async deleteQueen(queenId: string, apiaryId: string) {
        const result = await queensRepository.deleteQueen(queenId, apiaryId);
        if (!result) throw new Error('الملكة غير موجودة أو لا تنتمي لهذا المنحل');
        return result;
    }
}

export const queensService = new QueensService();
