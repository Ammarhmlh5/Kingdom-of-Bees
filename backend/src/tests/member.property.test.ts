/**
 * Property-Based Tests for member.controller
 * Feature: kingdom-bees-v2-integration
 * Properties 5 & 6
 */

import * as fc from 'fast-check';

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockApiaryFindUnique = jest.fn();

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    apiary: { findUnique: mockApiaryFindUnique },
    apiaryMembership: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      delete: jest.fn(),
    },
    userProfile: { findUnique: mockUserFindUnique },
  },
}));

jest.mock('../lib/access', () => ({
  hasApiaryAccess: jest.fn(),
}));

import { Request, Response } from 'express';
import { hasApiaryAccess } from '../lib/access';
import { inviteMember, getMembers } from '../controllers/member.controller';

const mockHasAccess = hasApiaryAccess as jest.Mock;

function makeReq(params: any, body: any, userId: string): any {
  return { params, body, user: { id: userId } };
}

function makeRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

// Feature: kingdom-bees-v2-integration, Property 5: دعوة عضو تُنشئ سجل ApiaryMembership
describe('Property 5: inviteMember creates ApiaryMembership with WORKER role and ACTIVE status', () => {
  it('for any valid owner+invitee pair, membership is created with WORKER/ACTIVE', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9]+$/.test(s)),
        async (ownerId, inviteeId, apiaryId) => {
          fc.pre(ownerId !== inviteeId);

          mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
          mockUserFindUnique.mockResolvedValue({
            id: inviteeId,
            email: `${inviteeId}@test.com`,
            fullName: 'Test User',
          });
          mockFindUnique.mockResolvedValue(null); // not already a member
          mockCreate.mockResolvedValue({ id: 'new-membership', joinedAt: new Date() });

          const req = makeReq({ apiaryId }, { email: `${inviteeId}@test.com` }, ownerId);
          const res = makeRes();

          await inviteMember(req as Request, res as Response);

          if (mockCreate.mock.calls.length === 0) return false;

          const createArgs = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
          return (
            createArgs.data.role === 'WORKER' &&
            createArgs.data.status === 'ACTIVE' &&
            createArgs.data.userId === inviteeId
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: kingdom-bees-v2-integration, Property 6: قائمة الأعضاء بالحقول المطلوبة
describe('Property 6: getMembers response contains required fields for every member', () => {
  it('for any number of members, each has userId, name, email, role, joinedAt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z0-9]+$/.test(s)),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z0-9]+$/.test(s)),
            fullName: fc.string({ minLength: 1, maxLength: 20 }),
            email: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        async (ownerId, apiaryId, members) => {
          mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
          mockApiaryFindUnique.mockResolvedValue({
            owner: { id: ownerId, fullName: 'Owner', email: 'owner@test.com' },
          });
          mockFindMany.mockResolvedValue(
            members.map(m => ({
              user: { id: m.id, fullName: m.fullName, email: m.email },
              joinedAt: new Date(),
            }))
          );

          const req = makeReq({ apiaryId }, {}, ownerId);
          const res = makeRes();

          await getMembers(req as Request, res as Response);

          if (res.json.mock.calls.length === 0) return false;

          const result = res.json.mock.calls[0][0];
          if (!Array.isArray(result)) return false;

          // Every member must have all required fields
          return result.every(
            (m: any) =>
              'userId' in m &&
              'name' in m &&
              'email' in m &&
              'role' in m &&
              'joinedAt' in m
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
