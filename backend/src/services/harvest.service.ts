import { harvestRepository } from '../repositories/harvest.repository';
import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export class HarvestService {

    async getHistory(apiaryId: string) {
        return harvestRepository.findAllByApiaryId(apiaryId);
    }

    async getMyHarvests(userId: string) {
        return harvestRepository.findAllByUserId(userId);
    }

    async recordHoneyHarvest(apiaryId: string, userId: string, data: {
        date: Date;
        notes?: string;
        items: { hiveId: string; quantityKg: number; frames?: number }[];
    }) {
        if (!data.items || data.items.length === 0) {
            throw new Error('No harvest items provided');
        }

        const totalQuantity = data.items.reduce((sum, item) => sum + item.quantityKg, 0);

        // 1. Save harvest record
        const harvestRecord = await harvestRepository.createHoneyHarvest({
            apiaryId,
            date: new Date(data.date),
            totalQuantity,
            unit: 'KG',
            harvestedBy: userId,
            items: data.items.map(i => ({
                hiveId: i.hiveId,
                quantity: i.quantityKg,
                framesHarvested: i.frames
            })),
            notes: data.notes
        });

        // 2. Log one ApiaryOperation record per hive harvested for full traceability
        for (const item of data.items) {
            const hive = await prisma.hive.findUnique({ where: { id: item.hiveId } });

            const opRecord = await prisma.apiaryOperation.create({
                data: {
                    apiaryId,
                    operationType: 'HARVEST',
                    hiveId: item.hiveId,
                    description: `قطف عسل من الخلية ${hive?.hiveNumber || ''} — ${item.quantityKg} كجم`,
                    performedBy: userId,
                    operationDate: new Date(data.date),
                    data: {
                        quantityKg: item.quantityKg,
                        framesHarvested: item.frames,
                        totalHarvestRecordId: harvestRecord.id,
                        notes: data.notes,
                        sourceRecordId: harvestRecord.id
                    }
                }
            });

            // Fire & Forget: resolve any pending HONEY_YIELD_ESTIMATE predictions for this hive
            analyticsMatchingService.processOperationAsync(
                apiaryId,
                item.hiveId,
                opRecord.id,
                'HARVEST',
                { quantityKg: item.quantityKg, frames: item.frames }
            );
        }

        return harvestRecord;
    }

    async recordHarvest(apiaryId: string, userId: string, data: {
        harvestType: string;
        harvestDate: string | Date;
        totalQuantity: number;
        unit: string;
        hiveId?: string;
        notes?: string;
    }) {
        // 1. Create the base HarvestRecord
        const record = await prisma.harvestRecord.create({
            data: {
                apiary: { connect: { id: apiaryId } },
                harvestType: data.harvestType as any,
                harvestDate: new Date(data.harvestDate),
                totalQuantity: data.totalQuantity,
                unit: data.unit as any,
                notes: data.notes,
                harvestedBy: userId,
            }
        });

        // 2. If hiveId is provided, also create the specific sub-record (like HoneyHarvest or PollenHarvest)
        if (data.hiveId) {
            if (data.harvestType === 'HONEY') {
                await prisma.honeyHarvest.create({
                    data: {
                        harvestRecord: { connect: { id: record.id } },
                        hive: { connect: { id: data.hiveId } },
                        quantityKg: data.totalQuantity,
                    }
                });
            } else if (data.harvestType === 'POLLEN') {
                await prisma.pollenHarvest.create({
                    data: {
                        harvestRecord: { connect: { id: record.id } },
                        hive: { connect: { id: data.hiveId } },
                        quantityKg: data.totalQuantity,
                        collectionMethod: 'POLLEN_TRAP',
                    }
                });
            } else if (data.harvestType === 'ROYAL_JELLY') {
                await prisma.royalJellyProduction.create({
                    data: {
                        id: record.id,
                        hiveId: data.hiveId,
                        graftingTime: new Date(data.harvestDate),
                        harvestTime: new Date(data.harvestDate),
                        hoursElapsed: 0,
                        cupsHarvested: 0,
                        totalQuantityGrams: data.totalQuantity,
                        averagePerCupMg: 0,
                    }
                });
            }
        }

        // 3. Log ApiaryOperation record for traceability
        let description = `تسجيل حصاد ${data.harvestType === 'HONEY' ? 'عسل' : data.harvestType === 'POLLEN' ? 'حبوب لقاح' : 'منتجات أخرى'} بقيمة ${data.totalQuantity} ${data.unit}`;
        if (data.hiveId) {
            const hive = await prisma.hive.findUnique({ where: { id: data.hiveId } });
            description += ` من الخلية ${hive?.hiveNumber || ''}`;
        }

        await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'HARVEST',
                hiveId: data.hiveId || null,
                description,
                performedBy: userId,
                operationDate: new Date(data.harvestDate),
                data: {
                    quantity: data.totalQuantity,
                    unit: data.unit,
                    harvestType: data.harvestType,
                    notes: data.notes,
                    sourceRecordId: record.id
                }
            }
        });

        return record;
    }
}

export const harvestService = new HarvestService();

