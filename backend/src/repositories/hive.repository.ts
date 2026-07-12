
import { Hive, HiveFrame, Prisma, FrameType } from '@prisma/client';

import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export class HiveRepository {

    /**
     * Find all hives in an apiary with full details for dashboard
     */
    async findAllByApiaryId(apiaryId: string): Promise<Hive[]> {
        return prisma.hive.findMany({
            where: { apiaryId },
            orderBy: { hiveNumber: 'asc' },
            include: {
                _count: {
                    select: {
                        frames: true,
                        inspections: true
                    }
                },
                frames: {
                    orderBy: { position: 'asc' },
                    select: {
                        id: true,
                        position: true,
                        frameType: true,
                        broodPercentage: true,
                        honeyPercentage: true,
                        pollenPercentage: true,
                        condition: true
                    }
                },
                hiveType: {
                    select: { nameEn: true, nameAr: true, id: true }
                },
                queen: {
                    select: {
                        id: true,
                        birthDate: true,
                        markColor: true,
                        marked: true,
                        source: true
                    }
                },
                inspections: {
                    orderBy: { inspectionDate: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        inspectionDate: true,
                        queenSeen: true,
                        broodFramesCount: true,
                        honeyFramesCount: true
                    }
                }
            }
        });
    }

    async findById(hiveId: string, apiaryId: string): Promise<Hive | null> {
        return prisma.hive.findFirst({
            where: { id: hiveId, apiaryId },
            include: {
                frames: {
                    orderBy: { position: 'asc' }
                },
                hiveType: {
                    select: { nameEn: true, nameAr: true, id: true }
                },
                queen: true
            }
        });
    }

    async getFramesByHiveId(hiveId: string): Promise<HiveFrame[]> {
        const frames = await prisma.hiveFrame.findMany({
            where: { hiveId },
            orderBy: { position: 'asc' }
        });
        logger.info('[HiveRepository] getFramesByHiveId:', hiveId, 'found:', frames.length, 'frames');
        return frames;
    }

    async create(data: Prisma.HiveCreateInput): Promise<Hive> {
        return prisma.hive.create({
            data
        });
    }

    async update(id: string, _apiaryId: string, data: Prisma.HiveUpdateInput): Promise<Hive> {
        return prisma.hive.update({
            where: { id },
            data
        });
    }

    async delete(id: string, _apiaryId: string): Promise<Hive> {
        return prisma.hive.delete({
            where: { id }
        });
    }

    // ==========================================
    // FRAME OPERATIONS
    // ==========================================

    async upsertFrame(hiveId: string, frameData: {
        id?: string;
        position: number;
        type: FrameType; // Correct enum type
        content?: any; // Content percentages passed as separate fields in real frame
        broodPercentage?: number;
        honeyPercentage?: number;
        pollenPercentage?: number;
    }) {
        if (frameData.id) {
            return prisma.hiveFrame.update({
                where: { id: frameData.id },
                data: {
                    frameType: frameData.type,
                    broodPercentage: frameData.broodPercentage || 0,
                    honeyPercentage: frameData.honeyPercentage || 0,
                    pollenPercentage: frameData.pollenPercentage || 0
                }
            });
        }

        return prisma.hiveFrame.create({
            data: {
                hiveId,
                position: frameData.position,
                frameType: frameData.type,
                broodPercentage: frameData.broodPercentage || 0,
                honeyPercentage: frameData.honeyPercentage || 0,
                pollenPercentage: frameData.pollenPercentage || 0
            }
        });
    }

    async getFrames(hiveId: string): Promise<HiveFrame[]> {
        return prisma.hiveFrame.findMany({
            where: { hiveId },
            orderBy: { position: 'asc' }
        });
    }

    // ==========================================
    // COMPLEX OPERATIONS (Transactions)
    // ==========================================

    async addSuper(hiveId: string, superData: { type: string; frames: number; hasExcluder: boolean }): Promise<any> {
        return prisma.$transaction(async (tx) => {
            // Get current max story
            const hive = await tx.hive.findUnique({ where: { id: hiveId } });
            if (!hive) throw new Error('Hive not found');

            const nextStory = (hive.stories || 1) + 1;

            // Create Super
            const newSuper = await tx.hiveSuper.create({
                data: {
                    hiveId,
                    superNumber: nextStory - 1, // distinct from story index? let's assume super 1 is above brood box
                    frameCount: superData.frames,
                    queenExcluder: superData.hasExcluder,
                    addedDate: new Date(),
                    status: 'ACTIVE'
                }
            });

            // Create Frames for this super
            const framesToCreate = [];
            for (let i = 1; i <= superData.frames; i++) {
                framesToCreate.push({
                    hiveId,
                    story: nextStory,
                    position: i,
                    frameType: FrameType.STANDARD, // Default
                    condition: 'GOOD'
                });
            }

            // Batch create frames? Prisma createMany
            await tx.hiveFrame.createMany({
                data: framesToCreate as any
            });

            // Update Hive stories count
            await tx.hive.update({
                where: { id: hiveId },
                data: { stories: nextStory }
            });

            return newSuper;
        });
    }

    async split(sourceHiveId: string, apiaryId: string, splitData: { newHive: Prisma.HiveCreateInput, frameIdsToMove?: string[] }): Promise<any> {
        return prisma.$transaction(async (tx) => {
            // 1. Create New Hive
            const newHive = await tx.hive.create({
                data: splitData.newHive
            });

            // 2. Move Frames if any
            if (splitData.frameIdsToMove && splitData.frameIdsToMove.length > 0) {
                await tx.hiveFrame.updateMany({
                    where: { id: { in: splitData.frameIdsToMove } },
                    data: { hiveId: newHive.id }
                });
            }

            // 3. Log Split Operation
            await tx.splitOperation.create({
                data: {
                    apiaryId,
                    motherHiveId: sourceHiveId,
                    newHiveIds: [newHive.id],
                    newHivesCount: 1,
                    splitDate: new Date(),
                    splitType: 'WALK_AWAY',
                    method: 'STANDARD',
                    resourceDistribution: { frames: 2, honey: 0, pollen: 0 }
                }
            });

            return newHive;
        });
    }

    async merge(weakHiveId: string, targetHiveId: string, apiaryId: string): Promise<any> {
        return prisma.$transaction(async (tx) => {
            // 1. Move all frames from weak hive to target hive
            // Problem: Position conflicts?
            // For simplicity, we might just reassign them. A real app would need to re-index positions.
            // Let's just move them to a "temporary" story or append to existing?
            // "Stacking" logic: Find target max story, move weak hive stories on top.

            const targetHive = await tx.hive.findUnique({ where: { id: targetHiveId } });
            const weakHive = await tx.hive.findUnique({ where: { id: weakHiveId } });

            if (!targetHive || !weakHive) throw new Error("Hive not found");

            const targetBaseStory = targetHive.stories || 1;

            // Update weak hive frames: increment their story by targetBaseStory
            // Prisma doesn't support "update x = x + val" in updateMany easily without raw SQL or loop.
            // Using raw SQL for efficiency if possible, or simple loop.
            // Since we are in transaction, let's fetch and update.
            const weakFrames = await tx.hiveFrame.findMany({ where: { hiveId: weakHiveId } });

            for (const frame of weakFrames) {
                await tx.hiveFrame.update({
                    where: { id: frame.id },
                    data: {
                        hiveId: targetHiveId,
                        story: frame.story + targetBaseStory
                    }
                });
            }

            // 2. Update Target Hive Story Count
            await tx.hive.update({
                where: { id: targetHiveId },
                data: { stories: targetBaseStory + (weakHive.stories || 1) }
            });

            // 3. Log Merge Operation
            await tx.mergeOperation.create({
                data: {
                    apiaryId,
                    mergedHiveId: weakHiveId,
                    survivorHiveId: targetHiveId,
                    mergeDate: new Date(),
                    method: 'DIRECT',
                    queenKept: 'TARGET',
                    outcome: { success: true, notes: 'Merged colonies' },
                    notes: 'Merged colonies'
                }
            });

            // 4. Deactivate Weak Hive
            await tx.hive.update({
                where: { id: weakHiveId },
                data: {
                    status: 'DEAD',
                    condition: 'CRITICAL',
                    notes: `Merged into Hive #${targetHive.hiveNumber}`
                }
            });

            return { success: true };
        });
    }
}

export const hiveRepository = new HiveRepository();
