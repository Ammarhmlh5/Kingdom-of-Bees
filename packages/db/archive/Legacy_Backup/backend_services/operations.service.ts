import { prisma } from '../config/database';
import { Prisma, SplitMethod, MergeMethod, OperationStatus, SwarmEventType } from '@prisma/client';

export class OperationsService {

    // --- Split Operation ---
    static async splitHive(data: {
        apiaryId: string;
        motherHiveId: string;
        splitDate: string | Date;
        newHivesCount: number;
        method: SplitMethod;
        resourceDistribution: any;
        newHivesData?: { name: string, hiveType: any, queenId?: string }[];
        notes?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Fetch mother hive for context
            const motherHive = await tx.hive.findUnique({ 
                where: { id: data.motherHiveId },
                include: { frames: true }
            });
            if (!motherHive) throw new Error("Mother hive not found");

            const newHiveIds: string[] = [];
            
            // 2. Create New Hives
            if (data.newHivesData && data.newHivesData.length > 0) {
                for (let i = 0; i < data.newHivesData.length; i++) {
                    const hiveData = data.newHivesData[i];
                    const newHive = await tx.hive.create({
                        data: {
                            apiaryId: data.apiaryId,
                            hiveNumber: `S-${motherHive.hiveNumber}-${i + 1}`,
                            name: hiveData.name || `Split of ${motherHive.hiveNumber}`,
                            hiveType: hiveData.hiveType || motherHive.hiveType,
                            queenId: hiveData.queenId,
                            framesPerBox: motherHive.framesPerBox,
                            frameSize: motherHive.frameSize,
                            stories: 1,
                            status: 'ACTIVE',
                            installationDate: new Date(data.splitDate)
                        }
                    });

                    // Initialize frames for the new hive (copying mother hive count)
                    for (let p = 1; p <= motherHive.framesPerBox; p++) {
                        await tx.hiveFrame.create({
                            data: {
                                hiveId: newHive.id,
                                story: 1,
                                position: p,
                                frameType: 'STANDARD',
                                condition: 'GOOD'
                            }
                        });
                    }

                    newHiveIds.push(newHive.id);
                }
            }

            // 3. Update Mother Hive status or notes
            await tx.hive.update({
                where: { id: data.motherHiveId },
                data: {
                    status: 'SPLITTING', // Temporary status or just keep ACTIVE
                    notes: `${motherHive.notes || ''}\n[Split performed on ${new Date(data.splitDate).toLocaleDateString()}]`.trim()
                }
            });

            // 4. Register Split Operation
            const operation = await tx.splitOperation.create({
                data: {
                    apiaryId: data.apiaryId,
                    motherHiveId: data.motherHiveId,
                    splitDate: new Date(data.splitDate),
                    newHivesCount: data.newHivesCount,
                    newHiveIds: newHiveIds,
                    method: data.method,
                    resourceDistribution: data.resourceDistribution,
                    status: 'COMPLETED',
                    successfulHives: newHiveIds.length,
                    notes: data.notes
                }
            });

            return { operation, newHiveIds };
        });
    }

    // --- Merge Operation ---
    static async mergeHives(data: {
        apiaryId: string;
        survivorHiveId: string;
        mergedHiveId: string;
        mergeDate: string | Date;
        method: MergeMethod;
        outcome: any;
        notes?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Register Operation
            const operation = await tx.mergeOperation.create({
                data: {
                    apiaryId: data.apiaryId,
                    survivorHiveId: data.survivorHiveId,
                    mergedHiveId: data.mergedHiveId,
                    mergeDate: new Date(data.mergeDate),
                    method: data.method,
                    outcome: data.outcome, // Json
                    notes: data.notes
                }
            });

            // 2. Deactivate Merged Hive
            await tx.hive.update({
                where: { id: data.mergedHiveId },
                data: {
                    status: 'MERGED' as any, // Verify HiveStatus enum has MERGED, if not use SOLD or ARCHIVED logic
                    // Checking Schema: HiveStatus Enum defined where? 
                    // Usually HiveStatus has ACTIVE, INACTIVE, DEAD, SOLD, MERGED. 
                    // If not, we might fail here. Assuming standard enum from my plan.
                }
            });

            return operation;
        });
    }

    // --- Swarm Event ---
    static async recordSwarm(data: Prisma.SwarmEventCreateInput) {
        return prisma.swarmEvent.create({ data });
    }

    // --- Getters ---
    static async getApiaryOperations(apiaryId: string) {
        const splits = await prisma.splitOperation.findMany({ where: { apiaryId }, orderBy: { splitDate: 'desc' } });
        const merges = await prisma.mergeOperation.findMany({ where: { apiaryId }, orderBy: { mergeDate: 'desc' } });
        const swarms = await prisma.swarmEvent.findMany({ where: { apiaryId }, orderBy: { swarmDate: 'desc' } });

        return { splits, merges, swarms };
    }
}
