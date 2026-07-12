jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    plantLibrary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from '../config/prisma';
import { AdminPlantService } from '../services/admin-plant.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const service = new AdminPlantService();

describe('AdminPlantService.listPlants', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns paginated results', async () => {
    const plants = [{ id: '1', commonNameAr: 'سدر' }];
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue(plants);
    (mockPrisma.plantLibrary.count as jest.Mock).mockResolvedValue(1);

    const result = await service.listPlants({ page: 1, limit: 10 });

    expect(mockPrisma.plantLibrary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 })
    );
    expect(result).toEqual({ data: plants, total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it('filters by plantType', async () => {
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.plantLibrary.count as jest.Mock).mockResolvedValue(0);

    await service.listPlants({ type: 'TREE' });

    expect(mockPrisma.plantLibrary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ plantType: 'TREE' }) })
    );
  });

  it('filters by verified status', async () => {
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.plantLibrary.count as jest.Mock).mockResolvedValue(0);

    await service.listPlants({ verified: true });

    expect(mockPrisma.plantLibrary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ verified: true }) })
    );
  });

  it('searches by name', async () => {
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.plantLibrary.count as jest.Mock).mockResolvedValue(0);

    await service.listPlants({ search: 'سدر' });

    expect(mockPrisma.plantLibrary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ commonNameAr: { contains: 'سدر', mode: 'insensitive' } }),
          ]),
        }),
      })
    );
  });
});

describe('AdminPlantService.getPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a plant when found', async () => {
    const plant = { id: 'plant-1', commonNameAr: 'سدر' };
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(plant);

    const result = await service.getPlant('plant-1');
    expect(result).toEqual(plant);
  });

  it('throws when plant not found', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.getPlant('plant-1')).rejects.toThrow('النبتة غير موجودة');
  });
});

describe('AdminPlantService.createPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a new plant', async () => {
    const data = { scientificName: 'Test', commonNameAr: 'اختبار', plantType: 'TREE' };
    const created = { id: 'plant-1', ...data };
    (mockPrisma.plantLibrary.create as jest.Mock).mockResolvedValue(created);

    const result = await service.createPlant(data);
    expect(mockPrisma.plantLibrary.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual(created);
  });
});

describe('AdminPlantService.updatePlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates an existing plant', async () => {
    const existing = { id: 'plant-1', commonNameAr: 'سدر' };
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(existing);
    (mockPrisma.plantLibrary.update as jest.Mock).mockResolvedValue({ ...existing, commonNameAr: 'سدر محدث' });

    const result = await service.updatePlant('plant-1', { commonNameAr: 'سدر محدث' });
    expect(mockPrisma.plantLibrary.update).toHaveBeenCalledWith({
      where: { id: 'plant-1' },
      data: { commonNameAr: 'سدر محدث' },
    });
    expect(result.commonNameAr).toBe('سدر محدث');
  });

  it('throws when plant not found', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.updatePlant('plant-1', {})).rejects.toThrow('النبتة غير موجودة');
  });
});

describe('AdminPlantService.deletePlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes an existing plant', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue({ id: 'plant-1' });
    (mockPrisma.plantLibrary.delete as jest.Mock).mockResolvedValue({ id: 'plant-1' });

    const result = await service.deletePlant('plant-1');
    expect(mockPrisma.plantLibrary.delete).toHaveBeenCalledWith({ where: { id: 'plant-1' } });
    expect(result).toEqual({ deleted: true });
  });

  it('throws when plant not found', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.deletePlant('plant-1')).rejects.toThrow('النبتة غير موجودة');
  });
});

describe('AdminPlantService.verifyPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('toggles verified from false to true', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue({ id: 'plant-1', verified: false });
    (mockPrisma.plantLibrary.update as jest.Mock).mockResolvedValue({ id: 'plant-1', verified: true, verifiedBy: 'admin-1' });

    const result = await service.verifyPlant('plant-1', 'admin-1');
    expect(mockPrisma.plantLibrary.update).toHaveBeenCalledWith({
      where: { id: 'plant-1' },
      data: { verified: true, verifiedBy: 'admin-1' },
    });
    expect(result.verified).toBe(true);
  });

  it('toggles verified from true to false (clears verifiedBy)', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue({ id: 'plant-1', verified: true });
    (mockPrisma.plantLibrary.update as jest.Mock).mockResolvedValue({ id: 'plant-1', verified: false, verifiedBy: null });

    const result = await service.verifyPlant('plant-1', 'admin-1');
    expect(mockPrisma.plantLibrary.update).toHaveBeenCalledWith({
      where: { id: 'plant-1' },
      data: { verified: false, verifiedBy: null },
    });
    expect(result.verified).toBe(false);
  });

  it('throws when plant not found', async () => {
    (mockPrisma.plantLibrary.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.verifyPlant('plant-1', 'admin-1')).rejects.toThrow('النبتة غير موجودة');
  });
});
