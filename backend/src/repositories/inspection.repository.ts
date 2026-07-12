
import { Inspection, Prisma } from '@prisma/client';

import prisma from '../config/prisma';

export class InspectionRepository {

    async findAllByApiaryId(apiaryId: string) {
        return prisma.inspection.findMany({
            where: { apiaryId },
            orderBy: { inspectionDate: 'desc' },
            include: { hive: { select: { hiveNumber: true, name: true } } }
        });
    }

    async findById(id: string, apiaryId: string) {
        return prisma.inspection.findFirst({
            where: { id, apiaryId },
            include: {
                findings: true,
                actions: true,
                hive: { select: { hiveNumber: true, name: true } }
            }
        });
    }

    async create(data: Prisma.InspectionCreateInput): Promise<Inspection> {
        return prisma.inspection.create({
            data
        });
    }

    async delete(id: string, _apiaryId: string) {
        return prisma.inspection.delete({ where: { id } });
    }
}

export const inspectionRepository = new InspectionRepository();
