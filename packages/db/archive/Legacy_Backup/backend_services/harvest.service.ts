import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class HarvestService {
    // Create harvest record
    async create(data: {
        apiaryId: string;
        harvestDate: Date;
        harvestType: string;
        totalYieldKg: number;
        notes?: string;
        performedBy: string;
    }) {
        return prisma.harvestRecord.create({
            data: data as any,
            include: {
                apiary: {
                    select: { id: true, name: true },
                },
                honeyHarvests: true,
                pollenHarvests: true,
            },
        });
    }

    // Get all harvest records
    async getAll(userId: string, filters?: {
        apiaryId?: string;
        harvestType?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = {
            apiary: {
                ownerId: userId,
            },
        };

        if (filters?.apiaryId) {
            where.apiaryId = filters.apiaryId;
        }

        if (filters?.harvestType) {
            where.harvestType = filters.harvestType;
        }

        if (filters?.startDate || filters?.endDate) {
            where.harvestDate = {};
            if (filters.startDate) {
                where.harvestDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.harvestDate.lte = filters.endDate;
            }
        }

        return prisma.harvestRecord.findMany({
            where,
            include: {
                apiary: {
                    select: { id: true, name: true },
                },
                honeyHarvests: {
                    include: {
                        hive: {
                            select: { id: true, hiveNumber: true, name: true },
                        },
                    },
                },
                pollenHarvests: {
                    include: {
                        hive: {
                            select: { id: true, hiveNumber: true, name: true },
                        },
                    },
                },
            },
            orderBy: {
                harvestDate: 'desc',
            },
        });
    }

    // Get harvest record by ID
    async getById(id: string, userId: string) {
        const record = await prisma.harvestRecord.findFirst({
            where: {
                id,
                apiary: {
                    ownerId: userId,
                },
            },
            include: {
                apiary: {
                    select: { id: true, name: true },
                },
                honeyHarvests: {
                    include: {
                        hive: {
                            select: { id: true, hiveNumber: true, name: true },
                        },
                    },
                },
                pollenHarvests: {
                    include: {
                        hive: {
                            select: { id: true, hiveNumber: true, name: true },
                        },
                    },
                },
            },
        });

        if (!record) {
            throw new AppError('Harvest record not found', 404);
        }

        return record;
    }

    // Update harvest record
    async update(id: string, userId: string, data: Partial<{
        harvestDate: Date;
        harvestType: string;
        totalYieldKg: number;
        notes: string;
    }>) {
        await this.getById(id, userId);

        return prisma.harvestRecord.update({
            where: { id },
            data: data as any,
            include: {
                apiary: {
                    select: { id: true, name: true },
                },
                honeyHarvests: true,
                pollenHarvests: true,
            },
        });
    }

    // Delete harvest record
    async delete(id: string, userId: string) {
        await this.getById(id, userId);

        await prisma.harvestRecord.delete({
            where: { id },
        });
    }

    // Create honey harvest
    async createHoneyHarvest(data: {
        harvestRecordId: string;
        hiveId: string;
        honeyType?: string;
        quantityKg: number;
        moisturePercentage?: number;
        purityScore?: number;
        pricePerKg?: number;
        totalValue?: number;
        framesHarvested?: number;
        notes?: string;
        userId: string;
    }) {
        // Verify ownership
        await this.getById(data.harvestRecordId, data.userId);

        const honeyHarvest = await prisma.honeyHarvest.create({
            data: {
                harvestRecordId: data.harvestRecordId,
                hiveId: data.hiveId,
                quantityKg: data.quantityKg,
                moisturePercentage: data.moisturePercentage,
                purityScore: data.purityScore,
                framesHarvested: data.framesHarvested,
                pricePerKg: data.pricePerKg,
                totalValue: data.totalValue,
                notes: data.notes,
            },
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
                harvestRecord: {
                    select: { id: true, harvestDate: true },
                },
            },
        });

        // Update total yield in harvest record
        await this.updateTotalYield(data.harvestRecordId);

        return honeyHarvest;
    }

    // Get honey harvests
    async getHoneyHarvests(userId: string, filters?: {
        harvestRecordId?: string;
        hiveId?: string;
    }) {
        const where: any = {
            harvestRecord: {
                apiary: {
                    ownerId: userId,
                },
            },
        };

        if (filters?.harvestRecordId) {
            where.harvestRecordId = filters.harvestRecordId;
        }

        if (filters?.hiveId) {
            where.hiveId = filters.hiveId;
        }

        return prisma.honeyHarvest.findMany({
            where,
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
                harvestRecord: {
                    select: { id: true, harvestDate: true, apiaryId: true },
                },
            },
            orderBy: {
                harvestRecord: {
                    harvestDate: 'desc',
                },
            },
        });
    }

    // Create pollen harvest
    async createPollenHarvest(data: {
        harvestRecordId: string;
        hiveId: string;
        quantityKg: number; // Renamed from yieldKg
        pollenColor?: string;
        qualityGrade?: string;
        pricePerKg?: number; // New field
        totalValue?: number; // New field
        notes?: string;
        userId: string;
    }) {
        await this.getById(data.harvestRecordId, data.userId);

        const pollenHarvest = await prisma.pollenHarvest.create({
            data: {
                harvestRecordId: data.harvestRecordId,
                hiveId: data.hiveId,
                quantityKg: data.quantityKg,
                pollenColor: data.pollenColor,
                qualityGrade: data.qualityGrade as any,
                pricePerKg: data.pricePerKg,
                totalValue: data.totalValue,
                notes: data.notes,
            },
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
                harvestRecord: {
                    select: { id: true, harvestDate: true },
                },
            },
        });

        await this.updateTotalYield(data.harvestRecordId);

        return pollenHarvest;
    }

    // Get pollen harvests
    async getPollenHarvests(userId: string, filters?: {
        harvestRecordId?: string;
        hiveId?: string;
    }) {
        const where: any = {
            harvestRecord: {
                apiary: {
                    ownerId: userId,
                },
            },
        };

        if (filters?.harvestRecordId) {
            where.harvestRecordId = filters.harvestRecordId;
        }

        if (filters?.hiveId) {
            where.hiveId = filters.hiveId;
        }

        return prisma.pollenHarvest.findMany({
            where,
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
                harvestRecord: {
                    select: { id: true, harvestDate: true, apiaryId: true },
                },
            },
            orderBy: {
                harvestRecord: {
                    harvestDate: 'desc',
                },
            },
        });
    }

    /*
    // Create royal jelly production
    async createRoyalJellyProduction(data: {
        hiveId: string;
        productionDate: Date;
        yieldGrams: number;
        qualityGrade?: string;
        pricePerGram?: number; // New field
        totalValue?: number; // New field
        notes?: string;
        userId: string;
    }) {
        // Verify hive ownership
        const hive = await prisma.hive.findFirst({
            where: {
                id: data.hiveId,
                apiary: {
                    ownerId: data.userId,
                },
            },
        });

        if (!hive) {
            throw new AppError('Hive not found', 404);
        }

        return prisma.royalJellyProduction.create({
            data: {
                hiveId: data.hiveId,
                productionDate: data.productionDate,
                yieldGrams: data.yieldGrams,
                qualityGrade: data.qualityGrade as any,
                pricePerGram: data.pricePerGram,
                totalValue: data.totalValue,
                notes: data.notes,
            },
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true },
                },
            },
        });
    }

    // Get royal jelly productions
    async getRoyalJellyProductions(userId: string, filters?: {
        hiveId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = {
            hive: {
                apiary: {
                    ownerId: userId,
                },
            },
        };

        if (filters?.hiveId) {
            where.hiveId = filters.hiveId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.productionDate = {};
            if (filters.startDate) {
                where.productionDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.productionDate.lte = filters.endDate;
            }
        }

        return prisma.royalJellyProduction.findMany({
            where,
            include: {
                hive: {
                    select: { id: true, hiveNumber: true, name: true, apiaryId: true },
                },
            },
            orderBy: {
                productionDate: 'desc',
            },
        });
    }
    */

    // Helper: Update total yield
    private async updateTotalYield(harvestRecordId: string) {
        const honeyTotal = await prisma.honeyHarvest.aggregate({
            where: { harvestRecordId },
            _sum: { quantityKg: true, totalValue: true },
        });

        const pollenTotal = await prisma.pollenHarvest.aggregate({
            where: { harvestRecordId },
            _sum: { quantityKg: true, totalValue: true },
        });

        const totalYield = (honeyTotal._sum.quantityKg || 0) + (pollenTotal._sum.quantityKg || 0);

        await prisma.harvestRecord.update({
            where: { id: harvestRecordId },
            data: { totalQuantity: totalYield },
        });
    }

    // Get production statistics
    async getProductionStats(userId: string, apiaryId?: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            apiary: {
                ownerId: userId,
            },
        };

        if (apiaryId) {
            where.apiaryId = apiaryId;
        }

        if (startDate || endDate) {
            where.harvestDate = {};
            if (startDate) {
                where.harvestDate.gte = startDate;
            }
            if (endDate) {
                where.harvestDate.lte = endDate;
            }
        }

        const harvests = await prisma.harvestRecord.findMany({
            where,
            include: {
                honeyHarvests: true,
                pollenHarvests: true,
            },
        });

        const honeyTotal = await prisma.honeyHarvest.aggregate({
            where: { harvestRecord: where },
            _sum: { quantityKg: true, totalValue: true }
        });

        const pollenTotal = await prisma.pollenHarvest.aggregate({
            where: { harvestRecord: where },
            _sum: { quantityKg: true, totalValue: true }
        });

        /*
        const royalJellyTotal = await prisma.royalJellyProduction.aggregate({
            where: { hive: { apiary: { ownerId: userId, id: apiaryId } }, productionDate: where.harvestDate },
            _sum: { yieldGrams: true, totalValue: true }
        });
        */

        const stats = {
            totalHarvests: harvests.length,
            honey: {
                totalYieldKg: Number(honeyTotal._sum.quantityKg || 0),
                totalValue: Number(honeyTotal._sum.totalValue || 0)
            },
            pollen: {
                totalYieldKg: Number(pollenTotal._sum.quantityKg || 0),
                totalValue: Number(pollenTotal._sum.totalValue || 0)
            },
            /*
            royalJelly: {
                totalYieldGrams: Number(royalJellyTotal._sum.yieldGrams || 0),
                totalValue: Number(royalJellyTotal._sum.totalValue || 0)
            },
            */
            averageHoneyPerHarvest: 0,
            averagePollenPerHarvest: 0,
            byMonth: {} as any,
        };

        if (stats.totalHarvests > 0) {
            stats.averageHoneyPerHarvest = stats.honey.totalYieldKg / stats.totalHarvests;
            stats.averagePollenPerHarvest = stats.pollen.totalYieldKg / stats.totalHarvests;
        }

        return stats;
    }
}

export const harvestService = new HarvestService();
