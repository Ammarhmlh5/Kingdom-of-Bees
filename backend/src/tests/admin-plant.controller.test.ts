const mockListPlants = jest.fn();
const mockGetPlant = jest.fn();
const mockCreatePlant = jest.fn();
const mockUpdatePlant = jest.fn();
const mockDeletePlant = jest.fn();
const mockVerifyPlant = jest.fn();

jest.mock('../services/admin-plant.service', () => ({
  AdminPlantService: jest.fn().mockImplementation(() => ({
    listPlants: mockListPlants,
    getPlant: mockGetPlant,
    createPlant: mockCreatePlant,
    updatePlant: mockUpdatePlant,
    deletePlant: mockDeletePlant,
    verifyPlant: mockVerifyPlant,
  })),
}));

import { Request, Response } from 'express';
import { AdminPlantController } from '../controllers/admin-plant.controller';

function mockReq(overrides: any = {}): any {
  return {
    params: { id: 'plant-1' },
    query: {},
    body: {},
    user: { id: 'admin-1' },
    ...overrides,
  };
}

function mockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AdminPlantController.list', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('returns paginated plants', async () => {
    const result = { data: [{ id: '1', commonNameAr: 'سدر' }], total: 1, page: 1, limit: 50, totalPages: 1 };
    mockListPlants.mockResolvedValue(result);

    const req = mockReq({ query: { page: '1', limit: '10', type: 'TREE' } });
    const res = mockRes();

    await controller.list(req as Request, res as Response);

    expect(mockListPlants).toHaveBeenCalledWith({ page: 1, limit: 10, type: 'TREE', search: undefined, verified: undefined });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: result }));
  });

  it('handles verified filter', async () => {
    mockListPlants.mockResolvedValue({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 });

    const req = mockReq({ query: { verified: 'true' } });
    const res = mockRes();

    await controller.list(req as Request, res as Response);

    expect(mockListPlants).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it('returns 500 on service error', async () => {
    mockListPlants.mockRejectedValue(new Error('DB error'));

    const req = mockReq();
    const res = mockRes();

    await controller.list(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe('AdminPlantController.get', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('returns a plant by id', async () => {
    const plant = { id: 'plant-1', commonNameAr: 'سدر' };
    mockGetPlant.mockResolvedValue(plant);

    const req = mockReq();
    const res = mockRes();

    await controller.get(req as Request, res as Response);

    expect(mockGetPlant).toHaveBeenCalledWith('plant-1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: plant }));
  });

  it('returns 404 when plant not found', async () => {
    mockGetPlant.mockRejectedValue(new Error('النبتة غير موجودة'));

    const req = mockReq();
    const res = mockRes();

    await controller.get(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('AdminPlantController.create', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('creates a plant with valid data', async () => {
    const body = {
      scientificName: 'Test',
      commonNameAr: 'اختبار',
      plantType: 'TREE',
      localNames: [],
      synonyms: [],
      nativeRegions: [],
      cultivatedRegions: [],
      images: [],
      videos: [],
    };
    const created = { id: 'plant-1', ...body };
    mockCreatePlant.mockResolvedValue(created);

    const req = mockReq({ body });
    const res = mockRes();

    await controller.create(req as Request, res as Response);

    expect(mockCreatePlant).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when body is invalid', async () => {
    const req = mockReq({ body: { plantType: 'INVALID' } });
    const res = mockRes();

    await controller.create(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('AdminPlantController.update', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('updates a plant', async () => {
    const body = {
      commonNameAr: 'سدر محدث',
      localNames: [],
      synonyms: [],
      nativeRegions: [],
      cultivatedRegions: [],
      images: [],
      videos: [],
    };
    const updated = { id: 'plant-1', ...body };
    mockUpdatePlant.mockResolvedValue(updated);

    const req = mockReq({ body });
    const res = mockRes();

    await controller.update(req as Request, res as Response);

    expect(mockUpdatePlant).toHaveBeenCalledWith('plant-1', body);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: updated }));
  });

  it('returns 400 when body is invalid', async () => {
    const req = mockReq({ body: { heightMinMeters: -1 } });
    const res = mockRes();

    await controller.update(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('AdminPlantController.delete', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('deletes a plant', async () => {
    mockDeletePlant.mockResolvedValue({ deleted: true });

    const req = mockReq();
    const res = mockRes();

    await controller.delete(req as Request, res as Response);

    expect(mockDeletePlant).toHaveBeenCalledWith('plant-1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
  });

  it('returns 404 when plant not found', async () => {
    mockDeletePlant.mockRejectedValue(new Error('النبتة غير موجودة'));

    const req = mockReq();
    const res = mockRes();

    await controller.delete(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('AdminPlantController.verify', () => {
  let controller: AdminPlantController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminPlantController();
  });

  it('toggles verification status', async () => {
    const plant = { id: 'plant-1', verified: true };
    mockVerifyPlant.mockResolvedValue(plant);

    const req = mockReq();
    const res = mockRes();

    await controller.verify(req as Request, res as Response);

    expect(mockVerifyPlant).toHaveBeenCalledWith('plant-1', 'admin-1');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: plant }));
  });

  it('returns 404 when plant not found', async () => {
    mockVerifyPlant.mockRejectedValue(new Error('النبتة غير موجودة'));

    const req = mockReq();
    const res = mockRes();

    await controller.verify(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
