/**
 * Property-Based Tests for disease.controller
 * Feature: kingdom-bees-v2-integration
 * Property 11: reject disease deletion when related alerts exist (P2003)
 */

import * as fc from 'fast-check';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const mockDeleteDiseaseRecord = jest.fn();

jest.mock('../services/disease.service', () => ({
  DiseaseService: jest.fn().mockImplementation(() => ({
    deleteDiseaseRecord: mockDeleteDiseaseRecord,
    getActiveDiseases: jest.fn(),
    getLibrary: jest.fn(),
    reportOutbreak: jest.fn(),
    resolveDisease: jest.fn(),
  })),
}));

import { Request, Response } from 'express';
import { DiseaseController } from '../controllers/disease.controller';

function makeRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makePrismaP2003(): PrismaClientKnownRequestError {
  return new PrismaClientKnownRequestError('Foreign key constraint failed', {
    code: 'P2003',
    clientVersion: '5.0.0',
  });
}

beforeEach(() => jest.clearAllMocks());

// Feature: kingdom-bees-v2-integration, Property 11: رفض حذف المرض مع تنبيهات
describe('Property 11: deleteDisease returns 409 when disease has related alerts', () => {
  it('for any diseaseId with related alerts (P2003), always returns 409', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        async (apiaryId, recordId) => {
          mockDeleteDiseaseRecord.mockRejectedValue(makePrismaP2003());

          const controller = new DiseaseController();
          const req: any = { params: { recordId }, apiaryId };
          const res = makeRes();

          await controller.deleteDisease(req as Request, res as Response);

          const statusCalls = (res.status as jest.Mock).mock.calls;
          return statusCalls.some((call: any[]) => call[0] === 409);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any diseaseId without related alerts, deletion succeeds (no 409)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z0-9-]+$/.test(s)),
        async (apiaryId, recordId) => {
          mockDeleteDiseaseRecord.mockResolvedValue(undefined);

          const controller = new DiseaseController();
          const req: any = { params: { recordId }, apiaryId };
          const res = makeRes();

          await controller.deleteDisease(req as Request, res as Response);

          const statusCalls = (res.status as jest.Mock).mock.calls;
          // Should NOT return 409
          return !statusCalls.some((call: any[]) => call[0] === 409);
        }
      ),
      { numRuns: 100 }
    );
  });
});
