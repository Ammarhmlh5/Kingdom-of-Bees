/**
 * Tests for disease.controller — Prisma error handling
 * Feature: kingdom-bees-v2-integration
 * Property 11: reject disease deletion when related alerts exist (P2003)
 */

import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

// Mock the service module — must be before any imports that use it
const mockDeleteDiseaseRecord = jest.fn();
const mockGetActiveDiseases = jest.fn();
const mockGetLibrary = jest.fn();
const mockReportOutbreak = jest.fn();
const mockResolveDisease = jest.fn();

jest.mock('../services/disease.service', () => ({
  DiseaseService: jest.fn().mockImplementation(() => ({
    deleteDiseaseRecord: mockDeleteDiseaseRecord,
    getActiveDiseases: mockGetActiveDiseases,
    getLibrary: mockGetLibrary,
    reportOutbreak: mockReportOutbreak,
    resolveDisease: mockResolveDisease,
  })),
}));

import { Request, Response } from 'express';
import { DiseaseController } from '../controllers/disease.controller';

function mockReq(overrides: any = {}): any {
  return {
    params: { apiaryId: 'apiary-1', recordId: 'record-1' },
    body: {},
    apiaryId: 'apiary-1',
    ...overrides,
  };
}

function mockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makePrismaKnownError(code: string): PrismaClientKnownRequestError {
  return new PrismaClientKnownRequestError('Foreign key constraint failed', {
    code,
    clientVersion: '5.0.0',
  });
}

describe('DiseaseController.deleteDisease', () => {
  let controller: DiseaseController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DiseaseController();
  });

  // Property 11: returns 409 when disease has related alerts (P2003)
  it('returns 409 when deletion fails due to related records (P2003)', async () => {
    mockDeleteDiseaseRecord.mockRejectedValue(makePrismaKnownError('P2003'));

    const req = mockReq();
    const res = mockRes();

    await controller.deleteDisease(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Cannot delete: related records exist' })
    );
  });

  it('returns 400 when PrismaClientValidationError is thrown', async () => {
    const validationError = new PrismaClientValidationError('Validation failed', {
      clientVersion: '5.0.0',
    });
    mockDeleteDiseaseRecord.mockRejectedValue(validationError);

    const req = mockReq();
    const res = mockRes();

    await controller.deleteDisease(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid field value' })
    );
  });

  it('returns success when deletion succeeds', async () => {
    mockDeleteDiseaseRecord.mockResolvedValue(undefined);

    const req = mockReq();
    const res = mockRes();

    await controller.deleteDisease(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
