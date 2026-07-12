/**
 * Tests for hasApiaryAccess
 * Feature: kingdom-bees-v2-integration
 */

// Mock prisma before importing the module under test
jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    apiary: { findUnique: jest.fn() },
    apiaryMembership: { findFirst: jest.fn() },
  },
}));

import prisma from '../config/prisma';
import { hasApiaryAccess } from '../lib/access';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('hasApiaryAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Property 1 & 2: owner scenario
  it('returns owner role when user is the apiary owner', async () => {
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'user-1' });

    const result = await hasApiaryAccess('user-1', 'apiary-1');

    expect(result).toEqual({ hasAccess: true, role: 'owner' });
    expect(mockPrisma.apiaryMembership.findFirst).not.toHaveBeenCalled();
  });

  // Property 1: active member scenario
  it('returns assistant role when user is an active member', async () => {
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'owner-id' });
    (mockPrisma.apiaryMembership.findFirst as jest.Mock).mockResolvedValue({ id: 'membership-1' });

    const result = await hasApiaryAccess('user-2', 'apiary-1');

    expect(result).toEqual({ hasAccess: true, role: 'assistant' });
  });

  // Property 1: no access scenario
  it('returns no access when user has no relation to the apiary', async () => {
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'owner-id' });
    (mockPrisma.apiaryMembership.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await hasApiaryAccess('stranger', 'apiary-1');

    expect(result).toEqual({ hasAccess: false, role: null });
  });

  // Property 1: apiary not found
  it('returns no access when apiary does not exist', async () => {
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await hasApiaryAccess('user-1', 'nonexistent-apiary');

    expect(result).toEqual({ hasAccess: false, role: null });
    expect(mockPrisma.apiaryMembership.findFirst).not.toHaveBeenCalled();
  });

  // Property 2: idempotence — same inputs return same result
  it('returns the same result on two consecutive calls with same inputs (idempotence)', async () => {
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue({ ownerId: 'user-1' });

    const result1 = await hasApiaryAccess('user-1', 'apiary-1');
    const result2 = await hasApiaryAccess('user-1', 'apiary-1');

    expect(result1).toEqual(result2);
  });
});
