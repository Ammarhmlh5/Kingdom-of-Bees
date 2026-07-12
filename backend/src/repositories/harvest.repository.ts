
import { HarvestRecord, HarvestUnit, Prisma } from '@prisma/client';

import prisma from '../config/prisma';

export class HarvestRepository {

    async findAllByApiaryId(apiaryId: string) {
        return prisma.harvestRecord.findMany({
            where: { apiaryId },
            include: {
                honeyHarvests: true,
                pollenHarvests: true
            },
            orderBy: { harvestDate: 'desc' }
        });
    }

    async findAllByUserId(userId: string) {
        return prisma.harvestRecord.findMany({
            where: {
                apiary: { ownerId: userId }
            },
            include: {
                apiary: { select: { name: true, id: true } },
                honeyHarvests: true,
                pollenHarvests: true
            },
            orderBy: { harvestDate: 'desc' }
        });
    }

    async create(data: Prisma.HarvestRecordCreateInput): Promise<HarvestRecord> {
        return prisma.harvestRecord.create({
            data
        });
    }

    // Specialized Method for Honey Harvest (Most Common)
    async createHoneyHarvest(data: {
        apiaryId: string,
        date: Date,
        totalQuantity: number,
        unit: HarvestUnit,
        harvestedBy?: string,
        notes?: string,
        items: {
            hiveId: string,
            quantity: number, // kg usually
            framesHarvested?: number
        }[]
    }) {
        return prisma.harvestRecord.create({
            data: {
                apiary: { connect: { id: data.apiaryId } },
                harvestType: 'HONEY',
                harvestDate: data.date,
                totalQuantity: data.totalQuantity,
                unit: data.unit,
                harvestedBy: data.harvestedBy,
                notes: data.notes,
                honeyHarvests: {
                    create: data.items.map(item => ({
                        hive: { connect: { id: item.hiveId } },
                        quantityKg: item.quantity,
                        framesHarvested: item.framesHarvested
                    }))
                }
            },
            include: {
                honeyHarvests: true
            }
        });
    }
}

export const harvestRepository = new HarvestRepository();
