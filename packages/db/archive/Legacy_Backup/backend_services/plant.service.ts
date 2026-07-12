import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class PlantService {

    static async searchLibrary(query: string) {
        return prisma.plantLibrary.findMany({
            where: {
                OR: [
                    { commonNameAr: { contains: query, mode: 'insensitive' } },
                    { commonNameEn: { contains: query, mode: 'insensitive' } },
                    { scientificName: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 20
        });
    }

    static async getApiaryPlants(apiaryId: string) {
        return prisma.localPlant.findMany({
            where: { apiaryId, status: 'ACTIVE' },
            include: { plant: true },
            orderBy: { coverage: 'desc' }
        });
    }

    static async addLocalPlant(data: {
        apiaryId: string;
        plantId: string;
        coverage: number;
        coverageUnit: any; // Enum CoverageUnit
    }) {
        return prisma.localPlant.create({
            data: {
                apiaryId: data.apiaryId,
                plantId: data.plantId,
                coverage: data.coverage,
                coverageUnit: data.coverageUnit,
                status: 'ACTIVE'
            }
        });
    }

    static async updateLocalPlant(id: string, data: any) {
        return prisma.localPlant.update({
            where: { id },
            data
        });
    }

    static async removeLocalPlant(id: string) {
        return prisma.localPlant.update({
            where: { id },
            data: { status: 'REMOVED' as any } // Verify Enum
        });
    }
}
