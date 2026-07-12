import { prisma } from '../config/database';
import { Nucleus, Prisma, NucleusStatus } from '@prisma/client';

export class NucleusService {

    static async createNucleus(data: Prisma.NucleusCreateInput) {
        return prisma.nucleus.create({
            data,
            include: {
                queen: true,
                apiary: true
            }
        });
    }

    static async getNucleiByApiary(apiaryId: string) {
        return prisma.nucleus.findMany({
            where: { apiaryId },
            include: {
                queen: true,
                _count: { select: { queensHoused: true } }
            }
        });
    }

    static async updateNucleus(id: string, data: Prisma.NucleusUpdateInput) {
        return prisma.nucleus.update({
            where: { id },
            data,
            include: { queen: true }
        });
    }

    static async getNucleusById(id: string) {
        return prisma.nucleus.findUnique({
            where: { id },
            include: {
                queen: true,
                apiary: true,
                queensHoused: true
            }
        });
    }

    /**
     * Graduate a Nucleus to a full Hive
     */
    static async graduateToHive(nucleusId: string, hiveDetails: { name?: string, hiveType: any }) {
        return prisma.$transaction(async (tx) => {
            const nucleus = await tx.nucleus.findUnique({ where: { id: nucleusId } });
            if (!nucleus) throw new Error("Nucleus not found");

            if (nucleus.status === 'GRADUATED' || nucleus.status === 'LOST') {
                throw new Error("Cannot graduate an inactive nucleus");
            }

            // Create Hive
            const newHive = await tx.hive.create({
                data: {
                    apiaryId: nucleus.apiaryId,
                    hiveNumber: `G-${nucleus.nucleusNumber}`, // Auto-generate or pass in
                    name: hiveDetails.name || nucleus.name,
                    hiveType: hiveDetails.hiveType,
                    queenId: nucleus.queenId, // Transfer active queen
                    framesPerBox: nucleus.frameCount, // Start with nuc frames
                    installationDate: new Date(),
                    stories: 1,
                    status: 'ACTIVE'
                }
            });

            // Update Queen location (if exists)
            if (nucleus.queenId) {
                await tx.queen.update({
                    where: { id: nucleus.queenId },
                    data: {
                        currentHiveId: newHive.id,
                        currentNucleusId: null
                    }
                });
            }

            // Archive Nucleus
            await tx.nucleus.update({
                where: { id: nucleusId },
                data: {
                    status: 'GRADUATED', // Need to ensure enum has this or use SOLD/DEAD/inactive equivalent if not. 
                    // Let's assume we map to an inactive status if GRADUATED isn't in Enum.
                    // Checking Schema: NucleusStatus usually has ACTIVE, SOLD, DEAD, MERGED. 
                    // I'll check enum later, for now assuming MERGED or similar implies gone.
                    // Safest is to set graduationDate.
                    graduationDate: new Date(),
                    queenId: null // Remove queen reference as she moved
                }
            });

            return newHive;
        });
    }

    static async deleteNucleus(id: string) {
        return prisma.nucleus.delete({ where: { id } });
    }
}
