jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    plantLibrary: {
      findMany: jest.fn(),
    },
    localPlant: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import prisma from '../config/prisma';
import { PlantService } from '../services/plant.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const service = new PlantService();

describe('PlantService.searchLibrary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('searches by commonNameAr', async () => {
    const plants = [{ id: '1', commonNameAr: 'سدر' }];
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue(plants);

    const result = await service.searchLibrary('سدر');

    expect(mockPrisma.plantLibrary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: expect.arrayContaining([
            expect.objectContaining({ commonNameAr: { contains: 'سدر', mode: 'insensitive' } }),
          ]),
        },
        take: 20,
      })
    );
    expect(result).toEqual(plants);
  });

  it('returns empty array when no match', async () => {
    (mockPrisma.plantLibrary.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.searchLibrary('zzz');
    expect(result).toEqual([]);
  });
});

describe('PlantService.getApiaryPlants', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns plants for an apiary excluding REMOVED', async () => {
    const plants = [{ id: '1', plant: { commonNameAr: 'سدر' } }];
    (mockPrisma.localPlant.findMany as jest.Mock).mockResolvedValue(plants);

    const result = await service.getApiaryPlants('apiary-1');

    expect(mockPrisma.localPlant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { apiaryId: 'apiary-1', status: { not: 'REMOVED' } },
        include: { plant: true },
      })
    );
    expect(result).toEqual(plants);
  });
});

describe('PlantService.addLocalPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a local plant with BLOOMING status when bloomStartDate given', async () => {
    const created = { id: 'local-1', status: 'BLOOMING' };
    (mockPrisma.localPlant.create as jest.Mock).mockResolvedValue(created);

    const result = await service.addLocalPlant('apiary-1', {
      plantId: 'plant-1',
      coverage: 50,
      coverageUnit: 'PERCENTAGE',
      bloomStartDate: '2026-07-01T00:00:00.000Z',
      addedBy: 'user-1',
    });

    expect(mockPrisma.localPlant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          apiaryId: 'apiary-1',
          plantId: 'plant-1',
          coverage: 50,
          coverageUnit: 'PERCENTAGE',
          bloomStartDate: expect.any(Date),
          status: 'BLOOMING',
        }),
      })
    );
    expect(result).toEqual(created);
  });

  it('creates with ACTIVE status when no bloomStartDate', async () => {
    const created = { id: 'local-2', status: 'ACTIVE' };
    (mockPrisma.localPlant.create as jest.Mock).mockResolvedValue(created);

    const result = await service.addLocalPlant('apiary-1', {
      plantId: 'plant-2',
      coverage: 30,
      coverageUnit: 'PERCENTAGE',
    });

    expect(mockPrisma.localPlant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
    expect(result).toEqual(created);
  });

  it('includes optional distanceKm and direction', async () => {
    (mockPrisma.localPlant.create as jest.Mock).mockResolvedValue({ id: 'local-3' });

    await service.addLocalPlant('apiary-1', {
      plantId: 'plant-1',
      coverage: 40,
      coverageUnit: 'PERCENTAGE',
      distanceKm: 5.5,
      direction: 'شمال',
    });

    expect(mockPrisma.localPlant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          distanceKm: 5.5,
          direction: 'شمال',
        }),
      })
    );
  });
});

describe('PlantService.updateLocalPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates bloomStartDate and sets status to BLOOMING', async () => {
    (mockPrisma.localPlant.update as jest.Mock).mockResolvedValue({ id: 'local-1' });

    await service.updateLocalPlant('local-1', 'apiary-1', {
      bloomStartDate: '2026-07-01T00:00:00.000Z',
    });

    expect(mockPrisma.localPlant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'local-1', apiaryId: 'apiary-1' },
        data: expect.objectContaining({
          bloomStartDate: expect.any(Date),
          status: 'BLOOMING',
          lastUpdated: expect.any(Date),
        }),
      })
    );
  });

  it('updates bloomEndDate and sets status to ENDED', async () => {
    (mockPrisma.localPlant.update as jest.Mock).mockResolvedValue({ id: 'local-1' });

    await service.updateLocalPlant('local-1', 'apiary-1', {
      bloomEndDate: '2026-08-01T00:00:00.000Z',
    });

    expect(mockPrisma.localPlant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bloomEndDate: expect.any(Date),
          status: 'ENDED',
        }),
      })
    );
  });

  it('updates distanceKm and direction', async () => {
    (mockPrisma.localPlant.update as jest.Mock).mockResolvedValue({ id: 'local-1' });

    await service.updateLocalPlant('local-1', 'apiary-1', {
      distanceKm: 3,
      direction: 'شرق',
    });

    expect(mockPrisma.localPlant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ distanceKm: 3, direction: 'شرق' }),
      })
    );
  });
});

describe('PlantService.removeLocalPlant', () => {
  beforeEach(() => jest.clearAllMocks());

  it('soft-deletes by setting status to REMOVED', async () => {
    (mockPrisma.localPlant.update as jest.Mock).mockResolvedValue({ id: 'local-1', status: 'REMOVED' });

    const result = await service.removeLocalPlant('local-1', 'apiary-1');

    expect(mockPrisma.localPlant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'local-1', apiaryId: 'apiary-1' },
        data: expect.objectContaining({ status: 'REMOVED', lastUpdated: expect.any(Date) }),
      })
    );
    expect(result.status).toBe('REMOVED');
  });
});
