import prisma from '../config/prisma';

export class AdminPlantService {

  async listPlants(params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    verified?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.type) where.plantType = params.type;
    if (params.verified !== undefined) where.verified = params.verified;
    if (params.search) {
      where.OR = [
        { commonNameAr: { contains: params.search, mode: 'insensitive' } },
        { commonNameEn: { contains: params.search, mode: 'insensitive' } },
        { scientificName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.plantLibrary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { commonNameAr: 'asc' },
      }),
      prisma.plantLibrary.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPlant(id: string) {
    const plant = await prisma.plantLibrary.findUnique({ where: { id } });
    if (!plant) throw new Error('النبتة غير موجودة');
    return plant;
  }

  async createPlant(data: any) {
    return prisma.plantLibrary.create({ data });
  }

  async updatePlant(id: string, data: any) {
    const plant = await prisma.plantLibrary.findUnique({ where: { id } });
    if (!plant) throw new Error('النبتة غير موجودة');
    return prisma.plantLibrary.update({ where: { id }, data });
  }

  async deletePlant(id: string) {
    const plant = await prisma.plantLibrary.findUnique({ where: { id } });
    if (!plant) throw new Error('النبتة غير موجودة');
    await prisma.plantLibrary.delete({ where: { id } });
    return { deleted: true };
  }

  async verifyPlant(id: string, verifiedBy: string) {
    const plant = await prisma.plantLibrary.findUnique({ where: { id } });
    if (!plant) throw new Error('النبتة غير موجودة');
    return prisma.plantLibrary.update({
      where: { id },
      data: { verified: !plant.verified, verifiedBy: !plant.verified ? verifiedBy : null },
    });
  }
}
