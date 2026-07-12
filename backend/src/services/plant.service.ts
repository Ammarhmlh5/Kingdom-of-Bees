import prisma from '../config/prisma';

export class PlantService {

  async searchLibrary(query: string) {
    return prisma.plantLibrary.findMany({
      where: {
        OR: [
          { commonNameAr: { contains: query, mode: 'insensitive' } },
          { commonNameEn: { contains: query, mode: 'insensitive' } },
          { scientificName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { commonNameAr: 'asc' },
    });
  }

  async getApiaryPlants(apiaryId: string) {
    return prisma.localPlant.findMany({
      where: { apiaryId, status: { not: 'REMOVED' } },
      include: { plant: true },
      orderBy: { addedDate: 'desc' },
    });
  }

  async addLocalPlant(apiaryId: string, data: {
    plantId: string;
    coverage: number;
    coverageUnit: string;
    distanceKm?: number;
    direction?: string;
    bloomStartDate?: string;
    notes?: string;
    addedBy?: string;
  }) {
    return prisma.localPlant.create({
      data: {
        apiaryId,
        plantId: data.plantId,
        coverage: data.coverage,
        coverageUnit: data.coverageUnit as any,
        distanceKm: data.distanceKm,
        direction: data.direction,
        bloomStartDate: data.bloomStartDate ? new Date(data.bloomStartDate) : undefined,
        notes: data.notes,
        addedBy: data.addedBy,
        status: data.bloomStartDate ? 'BLOOMING' : 'ACTIVE',
      },
      include: { plant: true },
    });
  }

  async updateLocalPlant(id: string, apiaryId: string, data: {
    bloomStartDate?: string;
    bloomEndDate?: string;
    distanceKm?: number;
    direction?: string;
    coverage?: number;
    coverageUnit?: string;
    notes?: string;
  }) {
    const updateData: any = {};
    if (data.bloomStartDate !== undefined) updateData.bloomStartDate = new Date(data.bloomStartDate);
    if (data.bloomEndDate !== undefined) updateData.bloomEndDate = new Date(data.bloomEndDate);
    if (data.distanceKm !== undefined) updateData.distanceKm = data.distanceKm;
    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.coverage !== undefined) updateData.coverage = data.coverage;
    if (data.coverageUnit !== undefined) updateData.coverageUnit = data.coverageUnit;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.bloomEndDate) {
      updateData.status = 'ENDED';
    } else if (data.bloomStartDate) {
      updateData.status = 'BLOOMING';
    }

    updateData.lastUpdated = new Date();

    return prisma.localPlant.update({
      where: { id, apiaryId },
      data: updateData,
      include: { plant: true },
    });
  }

  async removeLocalPlant(id: string, apiaryId: string) {
    return prisma.localPlant.update({
      where: { id, apiaryId },
      data: { status: 'REMOVED', lastUpdated: new Date() },
    });
  }
}
