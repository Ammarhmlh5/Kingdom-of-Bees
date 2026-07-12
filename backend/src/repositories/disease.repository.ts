
import { DiseaseRecord, Prisma } from '@prisma/client';

import prisma from '../config/prisma';

export class DiseaseRepository {

    async findAllByApiaryId(apiaryId: string) {
        return prisma.diseaseRecord.findMany({
            where: { apiaryId },
            orderBy: { firstDetectedDate: 'desc' },
            include: {
                disease: {
                    include: {
                        treatments: true
                    }
                },
                hives: { select: { hiveNumber: true, name: true } },
                detector: { select: { fullName: true } }
            }
        });
    }

    async getLibrary() {
        return prisma.diseaseLibrary.findMany({
            orderBy: { nameEn: 'asc' },
            include: {
                treatments: true
            }
        });
    }

    /*
     * Create a disease record and link it to multiple hives (e.g. an outbreak)
     */
    async create(data: Prisma.DiseaseRecordCreateInput): Promise<DiseaseRecord> {
        return prisma.diseaseRecord.create({
            data
        });
    }

    async update(id: string, _apiaryId: string, data: Prisma.DiseaseRecordUpdateInput) {
        return prisma.diseaseRecord.update({
            where: { id },
            data
        });
    }

    async delete(id: string, apiaryId: string) {
        return prisma.diseaseRecord.deleteMany({
            where: { id, apiaryId }
        });
    }
}

export const diseaseRepository = new DiseaseRepository();
