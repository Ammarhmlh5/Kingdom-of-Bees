import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class FeedingService {
    // 1. Get Feeding Types Library
    async getTypes() {
        return prisma.feedingType.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    // 2. Create Feeding Record (Unified for Internal & External)
    async create(userId: string, data: {
        apiaryId: string;
        hiveId?: string | null;
        typeId: string;
        quantity: number;
        notes?: string;
        feedingDate?: Date;
    }) {
        // 1. Verify Apiary Ownership
        const apiary = await prisma.apiary.findFirst({
            where: { id: data.apiaryId, ownerId: userId },
        });

        if (!apiary) {
            throw new AppError('Apiary not found or access denied', 403);
        }

        // 2. If Internal, verify Hive belongs to Apiary
        if (data.hiveId) {
            const hive = await prisma.hive.findFirst({
                where: { id: data.hiveId, apiaryId: data.apiaryId },
            });
            if (!hive) {
                throw new AppError('Hive not found in this apiary', 404);
            }
        }

        // 3. Create Record
        const record = await prisma.feedingRecord.create({
            data: {
                apiaryId: data.apiaryId,
                hiveId: data.hiveId || null,
                typeId: data.typeId,
                quantity: data.quantity,
                feedingDate: data.feedingDate || new Date(),
                notes: data.notes,
                createdById: userId,
            },
            include: {
                type: true,
                hive: {
                    select: { id: true, name: true, hiveNumber: true }
                }
            }
        });

        // 4. If there was a pending recommendation for this hive & type, mark it as COMPLETED
        if (data.hiveId) {
            await prisma.feedingRecommendation.updateMany({
                where: {
                    hiveId: data.hiveId,
                    typeId: data.typeId,
                    status: 'PENDING'
                },
                data: {
                    status: 'COMPLETED',
                    // implementedDate: new Date() // If I had this field, I'd set it.
                }
            });
        }

        return record;
    }

    // 3. Get Feeding Records (History)
    async getAll(userId: string, filters: {
        apiaryId?: string;
        hiveId?: string;
        startDate?: Date;
        endDate?: Date;
        typeId?: string;
    }) {
        const where: Prisma.FeedingRecordWhereInput = {
            apiary: { ownerId: userId },
        };

        if (filters.apiaryId) where.apiaryId = filters.apiaryId;
        if (filters.hiveId) where.hiveId = filters.hiveId;
        if (filters.typeId) where.typeId = filters.typeId;

        if (filters.startDate || filters.endDate) {
            where.feedingDate = {};
            if (filters.startDate) where.feedingDate.gte = filters.startDate;
            if (filters.endDate) where.feedingDate.lte = filters.endDate;
        }

        return prisma.feedingRecord.findMany({
            where,
            include: {
                type: true,
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
                apiary: {
                    select: { id: true, name: true }
                },
                createdBy: {
                    select: { id: true, fullName: true }
                }
            },
            orderBy: {
                feedingDate: 'desc',
            },
        });
    }

    // 4. Get Recommendations (Simple DB Fetch + Logic)
    async getRecommendations(hiveId: string, userId: string) {
        // Verify ownership
        const hive = await prisma.hive.findFirst({
            where: { id: hiveId, apiary: { ownerId: userId } },
            include: {
                apiary: true,
                analyses: { orderBy: { createdAt: 'desc' }, take: 1 } // Get last analysis
            }
        });

        if (!hive) throw new AppError('Hive not found', 404);

        // Fetch PENDING recommendations from DB
        const dbRecommendations = await prisma.feedingRecommendation.findMany({
            where: {
                hiveId,
                status: 'PENDING',
            },
            include: { type: true },
            orderBy: { createdAt: 'desc' }
        });

        // Current Hive Condition (from Analysis)
        const currentCondition = hive.analyses[0]?.condition || 'UNKNOWN';
        const weight = hive.analyses[0]?.honeyFrameCount || 0; // Proxy for weight/stores

        return {
            hive: {
                id: hive.id,
                name: hive.name,
                number: hive.hiveNumber,
                condition: currentCondition,
            },
            recommendations: dbRecommendations,
            // We can add "generated" suggestions here if DB is empty
            suggestions: []
        };
    }

    // 5. Get Recommendations for Apiary (Unified)
    async getApiaryRecommendations(apiaryId: string, userId: string) {
        // Verify apiary
        const apiary = await prisma.apiary.findFirst({
            where: { id: apiaryId, ownerId: userId }
        });

        if (!apiary) throw new AppError('Apiary not found', 404);

        // Get recommendations for all hives in this apiary
        const recommendations = await prisma.feedingRecommendation.findMany({
            where: {
                apiaryId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true,
                        strengthRating: true,
                        condition: true
                    }
                },
                type: true
            },
            orderBy: { hive: { hiveNumber: 'asc' } }
        });

        return recommendations;
    }

    // 6. Get Apiary Feeding Summary
    async getApiarySummary(apiaryId: string, userId: string) {
        // Verify
        const apiary = await prisma.apiary.findFirst({
            where: { id: apiaryId, ownerId: userId }
        });
        if (!apiary) throw new AppError('Apiary not found', 404);

        // Get total fed last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRecords = await prisma.feedingRecord.findMany({
            where: {
                apiaryId,
                feedingDate: { gte: thirtyDaysAgo }
            },
            include: { type: true }
        });

        // Group by type
        const summary = recentRecords.reduce((acc, record) => {
            const typeName = record.type.name;
            if (!acc[typeName]) acc[typeName] = 0;
            acc[typeName] += Number(record.quantity);
            return acc;
        }, {} as Record<string, number>);

        return summary;
    }
}

export const feedingService = new FeedingService();
