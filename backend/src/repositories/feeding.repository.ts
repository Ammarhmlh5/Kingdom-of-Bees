import { FeedingRecord, Prisma } from '@prisma/client';

import prisma from '../config/prisma';

export class FeedingRepository {

    async findAllByApiaryId(apiaryId: string) {
        return prisma.feedingRecord.findMany({
            where: { apiaryId },
            orderBy: { feedingDate: 'desc' },
            include: {
                hive: { select: { hiveNumber: true, name: true } },
                feeder: { select: { fullName: true } }
            }
        });
    }

    async findTypes() {
        // Return static types compatible with the enum to avoid crashing
        return [
            { id: 'SUGAR_SYRUP', name: 'شراب سكر' },
            { id: 'PROTEIN', name: 'بروتين' },
            { id: 'POLLEN_SUBSTITUTE', name: 'بديل حبوب لقاح' },
            { id: 'FONDANT', name: 'فوندان' },
            { id: 'MEDICINAL', name: 'دوائي' },
            { id: 'SUPPLEMENT', name: 'مكمل غذائي' },
            { id: 'OTHER', name: 'أخرى' }
        ];
    }

    async create(data: Prisma.FeedingRecordCreateInput): Promise<FeedingRecord> {
        return prisma.feedingRecord.create({
            data
        });
    }

    async createBulk(data: Prisma.FeedingRecordCreateManyInput[]) {
        return prisma.feedingRecord.createMany({
            data
        });
    }

    async delete(id: string, apiaryId: string) {
        return prisma.feedingRecord.deleteMany({
            where: { id, apiaryId }
        });
    }
}

export const feedingRepository = new FeedingRepository();
