const mockSearchLibrary = jest.fn();
const mockGetApiaryPlants = jest.fn();
const mockAddLocalPlant = jest.fn();
const mockUpdateLocalPlant = jest.fn();
const mockRemoveLocalPlant = jest.fn();

jest.mock('../services/plant.service', () => ({
  PlantService: jest.fn().mockImplementation(() => ({
    searchLibrary: mockSearchLibrary,
    getApiaryPlants: mockGetApiaryPlants,
    addLocalPlant: mockAddLocalPlant,
    updateLocalPlant: mockUpdateLocalPlant,
    removeLocalPlant: mockRemoveLocalPlant,
  })),
}));

import { Request, Response } from 'express';
import { PlantController } from '../controllers/plant.controller';

function mockReq(overrides: any = {}): any {
  return {
    params: { apiaryId: 'apiary-1', plantId: 'plant-1' },
    query: {},
    body: {},
    user: { id: 'user-1' },
    ...overrides,
  };
}

function mockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('PlantController.search', () => {
  let controller: PlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PlantController();
  });

  it('returns plants when query is provided', async () => {
    const plants = [{ id: '1', commonNameAr: 'سدر' }];
    mockSearchLibrary.mockResolvedValue(plants);

    const req = mockReq({ query: { q: 'سدر' } });
    const res = mockRes();

    await controller.search(req as Request, res as Response);

    expect(mockSearchLibrary).toHaveBeenCalledWith('سدر');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: plants })
    );
  });

  it('returns empty array when query is empty', async () => {
    const req = mockReq({ query: { q: '' } });
    const res = mockRes();

    await controller.search(req as Request, res as Response);

    expect(mockSearchLibrary).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [] })
    );
  });

  it('returns 500 on service error', async () => {
    mockSearchLibrary.mockRejectedValue(new Error('DB error'));

    const req = mockReq({ query: { q: 'سدر' } });
    const res = mockRes();

    await controller.search(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe('PlantController.listByApiary', () => {
  let controller: PlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PlantController();
  });

  it('returns plants for the given apiary', async () => {
    const plants = [{ id: '1', plant: { commonNameAr: 'سدر' } }];
    mockGetApiaryPlants.mockResolvedValue(plants);

    const req = mockReq();
    const res = mockRes();

    await controller.listByApiary(req as Request, res as Response);

    expect(mockGetApiaryPlants).toHaveBeenCalledWith('apiary-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: plants })
    );
  });

  it('returns 500 on service error', async () => {
    mockGetApiaryPlants.mockRejectedValue(new Error('DB error'));

    const req = mockReq();
    const res = mockRes();

    await controller.listByApiary(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe('PlantController.add', () => {
  let controller: PlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PlantController();
  });

  it('creates a local plant with valid data', async () => {
    const body = {
      plantId: '00000000-0000-4000-8000-000000000000',
      coverage: 50,
      coverageUnit: 'PERCENTAGE',
    };
    const created = { id: 'local-1', plantId: body.plantId, coverage: 50 };
    mockAddLocalPlant.mockResolvedValue(created);

    const req = mockReq({ body });
    const res = mockRes();

    await controller.add(req as Request, res as Response);

    expect(mockAddLocalPlant).toHaveBeenCalledWith('apiary-1', {
      ...body,
      addedBy: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when body is invalid', async () => {
    const req = mockReq({ body: { plantId: 'not-a-uuid' } });
    const res = mockRes();

    await controller.add(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('PlantController.update', () => {
  let controller: PlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PlantController();
  });

  it('updates bloom dates', async () => {
    const body = { bloomStartDate: '2026-07-01T00:00:00.000Z' };
    const updated = { id: 'local-1', bloomStartDate: new Date() };
    mockUpdateLocalPlant.mockResolvedValue(updated);

    const req = mockReq({ body });
    const res = mockRes();

    await controller.update(req as Request, res as Response);

    expect(mockUpdateLocalPlant).toHaveBeenCalledWith('plant-1', 'apiary-1', body);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: updated })
    );
  });

  it('returns 400 when body is invalid', async () => {
    const req = mockReq({ body: { bloomStartDate: 'not-a-date' } });
    const res = mockRes();

    await controller.update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('PlantController.remove', () => {
  let controller: PlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PlantController();
  });

  it('soft-deletes a local plant', async () => {
    mockRemoveLocalPlant.mockResolvedValue({ id: 'local-1', status: 'REMOVED' });

    const req = mockReq();
    const res = mockRes();

    await controller.remove(req as Request, res as Response);

    expect(mockRemoveLocalPlant).toHaveBeenCalledWith('plant-1', 'apiary-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: null })
    );
  });

  it('returns 500 on service error', async () => {
    mockRemoveLocalPlant.mockRejectedValue(new Error('DB error'));

    const req = mockReq();
    const res = mockRes();

    await controller.remove(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
