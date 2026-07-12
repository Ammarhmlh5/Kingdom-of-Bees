import prisma from '../config/prisma';

export class QueensRepository {
    async getQueensByApiary(apiaryId: string) {
        // Get queens linked to hives in this apiary
        return prisma.queen.findMany({
            where: {
                currentHive: {
                    apiaryId
                }
            },
            include: {
                beeBreed: { select: { nameAr: true, nameEn: true } },
                currentHive: { select: { id: true, hiveNumber: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createQueen(data: {
        queenNumber?: string;
        source: string;
        beeBreedId?: string;
        birthDate?: string;
        introductionDate?: string;
        marked?: boolean;
        markColor?: string;
        hiveId?: string;
    }) {
        return prisma.queen.create({
            data: {
                queenNumber: data.queenNumber,
                source: data.source as any,
                beeBreedId: data.beeBreedId || null,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                introductionDate: data.introductionDate ? new Date(data.introductionDate) : null,
                marked: data.marked ?? false,
                markColor: data.markColor || null,
                currentHiveId: data.hiveId || null,
            },
            include: {
                beeBreed: { select: { nameAr: true, nameEn: true } },
                currentHive: { select: { id: true, hiveNumber: true, name: true } }
            }
        });
    }

    async deleteQueen(queenId: string, apiaryId: string) {
        // Verify queen belongs to a hive in this apiary
        const queen = await prisma.queen.findFirst({
            where: {
                id: queenId,
                currentHive: { apiaryId }
            }
        });
        if (!queen) return null;
        return prisma.queen.delete({ where: { id: queenId } });
    }
}

export const queensRepository = new QueensRepository();
