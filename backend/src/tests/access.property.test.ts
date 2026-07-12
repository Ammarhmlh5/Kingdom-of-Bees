/**
 * Property-Based Tests for hasApiaryAccess
 * Feature: kingdom-bees-v2-integration
 * Properties 1 & 2
 */

import * as fc from 'fast-check';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    apiary: { findUnique: jest.fn() },
    apiaryMembership: { findFirst: jest.fn() },
  },
}));

import prisma from '../config/prisma';
import { hasApiaryAccess } from '../lib/access';

const mockApiary = prisma.apiary.findUnique as jest.Mock;
const mockMembership = prisma.apiaryMembership.findFirst as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// Feature: kingdom-bees-v2-integration, Property 1: صحة نتيجة hasApiaryAccess حسب العلاقة
describe('Property 1: hasApiaryAccess returns correct role based on relationship', () => {
  it('owner: always returns { hasAccess: true, role: "owner" }', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (userId, apiaryId) => {
          mockApiary.mockResolvedValue({ ownerId: userId });
          const result = await hasApiaryAccess(userId, apiaryId);
          return result.hasAccess === true && result.role === 'owner';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('active member: always returns { hasAccess: true, role: "assistant" }', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (ownerId, userId, apiaryId) => {
          fc.pre(ownerId !== userId); // user is not the owner
          mockApiary.mockResolvedValue({ ownerId });
          mockMembership.mockResolvedValue({ id: 'membership-1' });
          const result = await hasApiaryAccess(userId, apiaryId);
          return result.hasAccess === true && result.role === 'assistant';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no relation: always returns { hasAccess: false, role: null }', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (ownerId, userId, apiaryId) => {
          fc.pre(ownerId !== userId);
          mockApiary.mockResolvedValue({ ownerId });
          mockMembership.mockResolvedValue(null);
          const result = await hasApiaryAccess(userId, apiaryId);
          return result.hasAccess === false && result.role === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('apiary not found: always returns { hasAccess: false, role: null }', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (userId, apiaryId) => {
          mockApiary.mockResolvedValue(null);
          const result = await hasApiaryAccess(userId, apiaryId);
          return result.hasAccess === false && result.role === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: kingdom-bees-v2-integration, Property 2: idempotence لـ hasApiaryAccess
describe('Property 2: hasApiaryAccess is idempotent', () => {
  it('two consecutive calls with same inputs return identical results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.oneof(
          fc.constant('owner'),
          fc.constant('assistant'),
          fc.constant('none')
        ),
        async (userId, apiaryId, scenario) => {
          if (scenario === 'owner') {
            mockApiary.mockResolvedValue({ ownerId: userId });
          } else if (scenario === 'assistant') {
            mockApiary.mockResolvedValue({ ownerId: 'other-owner' });
            mockMembership.mockResolvedValue({ id: 'membership-1' });
          } else {
            mockApiary.mockResolvedValue({ ownerId: 'other-owner' });
            mockMembership.mockResolvedValue(null);
          }

          const result1 = await hasApiaryAccess(userId, apiaryId);
          const result2 = await hasApiaryAccess(userId, apiaryId);

          return (
            result1.hasAccess === result2.hasAccess &&
            result1.role === result2.role
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
