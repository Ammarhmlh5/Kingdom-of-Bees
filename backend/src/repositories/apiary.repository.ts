
import { Apiary, Prisma } from '@prisma/client';

import prisma from '../config/prisma';

export class ApiaryRepository {
    /**
     * Find all apiaries for a user (Owned + Member)
     */
    async findAllForUser(userId: string): Promise<Apiary[]> {
        return prisma.apiary.findMany({
            where: {
                isActive: true,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId, status: 'ACTIVE' } } }
                ]
            },
            include: {
                _count: { select: { hives: true, members: true } },
                members: { where: { userId }, select: { role: true } } // return their role
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(apiaryId: string): Promise<Apiary | null> {
        return prisma.apiary.findUnique({
            where: { id: apiaryId },
            include: {
                members: { include: { user: { select: { fullName: true, email: true } } } }
            }
        });
    }

    // Ownership verification is typically done by the Service or Guard, but we can have a strict finder
    async findByIdAndAccess(apiaryId: string, userId: string) {
        return prisma.apiary.findFirst({
            where: {
                id: apiaryId,
                isActive: true,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId, status: 'ACTIVE' } } }
                ]
            }
        });
    }

    async create(data: Prisma.ApiaryCreateInput): Promise<Apiary> {
        return prisma.apiary.create({
            data
        });
    }

    async update(id: string, data: Prisma.ApiaryUpdateInput): Promise<Apiary> {
        return prisma.apiary.update({
            where: { id },
            data
        });
    }

    async softDelete(id: string): Promise<Apiary> {
        return prisma.apiary.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async migrateLegacyApiaries(oldOwnerId: string, newOwnerId: string): Promise<number> {
        const result = await prisma.apiary.updateMany({
            where: { ownerId: oldOwnerId },
            data: { ownerId: newOwnerId }
        });
        return result.count;
    }

    async getDashboardMetrics(userId: string) {
        // 1. Get total hives across all active apiaries for this user
        // We need to filter by owner OR member access
        const apiaryIds = (await this.findAllForUser(userId)).map(a => a.id);

        const hives = await prisma.hive.findMany({
            where: {
                apiaryId: { in: apiaryIds },
                status: 'ACTIVE'
            },
            select: {
                strengthRating: true,
                nextInspectionDue: true,
                frames: {
                    select: {
                        pollenPercentage: true,
                        broodPercentage: true,
                        honeyPercentage: true
                    }
                },
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1,
                    select: {
                        pollenFramesCount: true,
                        broodFramesCount: true,
                        honeyFramesCount: true
                    }
                }
            }

        });

        // 2. Count active alerts for this user (related to their apiaries/hives or direct user alerts)
        // Schema shows Alert has userId, so we can fetch directly
        const activeAlerts = await prisma.alert.count({
            where: {
                userId: userId,
                status: 'ACTIVE'
            }
        });

        return {
            hives,
            activeAlerts
        };
    }

    async getApiaryMetricsForApiary(apiaryId: string) {
        const hives = await prisma.hive.findMany({
            where: {
                apiaryId: apiaryId,
                status: 'ACTIVE'
            },
            select: {
                strengthRating: true,
                nextInspectionDue: true,
                frames: {
                    select: {
                        pollenPercentage: true,
                        broodPercentage: true,
                        honeyPercentage: true
                    }
                },
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1,
                    select: {
                        pollenFramesCount: true,
                        broodFramesCount: true,
                        honeyFramesCount: true
                    }
                }
            }

        });

        // Fetch alerts specifically linked to this apiary or its hives
        const activeAlerts = await prisma.alert.count({
            where: {
                apiaryId: apiaryId,
                status: 'ACTIVE'
            }
        });

        return {
            hives,
            activeAlerts
        };
    }
}

export const apiaryRepository = new ApiaryRepository();
