import { prisma } from '../config/database';
import { Queen, QueenStatus, Prisma } from '@prisma/client';

export class QueenService {

    static async createQueen(data: Prisma.QueenCreateInput) {
        return prisma.queen.create({
            data,
            include: {
                beeBreed: true,
                currentHive: true,
                currentNucleus: true
            }
        });
    }

    static async updateQueen(id: string, data: Prisma.QueenUpdateInput) {
        return prisma.queen.update({
            where: { id },
            data,
            include: {
                beeBreed: true
            }
        });
    }

    static async getQueenById(id: string) {
        return prisma.queen.findUnique({
            where: { id },
            include: {
                beeBreed: true,
                motherQueen: {
                    select: { id: true, name: true, queenNumber: true }
                },
                daughters: {
                    select: { id: true, name: true, queenNumber: true }
                },
                currentHive: {
                    select: { id: true, name: true, hiveNumber: true }
                },
                currentNucleus: {
                    select: { id: true, name: true, nucleusNumber: true }
                }
            }
        });
    }

    // Get all queens for a specific user (via their apiaries/breeding program)
    // Since Queen doesn't have ownerId directly, we find via Apiary relations or specific Query
    // Or simply returning all if accessed by breeder? 
    // Schema has `breederApiaryId` -> `breederUser`.
    static async getQueensByUser(userId: string) {
        return prisma.queen.findMany({
            where: {
                OR: [
                    { breederUser: { id: userId } }, // Bred by user
                    { currentHive: { apiary: { ownerId: userId } } }, // In user's hive
                    { currentNucleus: { apiary: { ownerId: userId } } } // In user's nucleus
                ]
            },
            include: {
                beeBreed: true,
                currentHive: { select: { id: true, name: true, hiveNumber: true } },
                currentNucleus: { select: { id: true, name: true, nucleusNumber: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getLineage(id: string) {
        // Get full family tree logic could go here, for now simple getter
        const queen = await prisma.queen.findUnique({
            where: { id },
            include: {
                motherQueen: {
                    include: {
                        beeBreed: true
                    }
                },
                daughters: {
                    include: {
                        currentHive: true
                    }
                }
            }
        });
        return queen;
    }

    static async deleteQueen(id: string) {
        return prisma.queen.delete({ where: { id } });
    }
}
