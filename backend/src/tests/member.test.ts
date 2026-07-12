/**
 * Tests for member.controller
 * Feature: kingdom-bees-v2-integration
 * Properties 5 & 6: invite member creates ApiaryMembership, getMembers returns required fields
 */

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    apiary: { findUnique: jest.fn() },
    apiaryMembership: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    userProfile: { findUnique: jest.fn() },
  },
}));

jest.mock('../lib/access', () => ({
  hasApiaryAccess: jest.fn(),
}));

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { hasApiaryAccess } from '../lib/access';
import { inviteMember, getMembers } from '../controllers/member.controller';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHasAccess = hasApiaryAccess as jest.Mock;

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    params: { apiaryId: 'apiary-1' },
    body: {},
    ...overrides,
    // @ts-ignore
    user: { id: 'owner-1' },
    ...overrides,
  };
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('inviteMember', () => {
  beforeEach(() => jest.clearAllMocks());

  // Property 5: invite creates ApiaryMembership with WORKER role and ACTIVE status
  it('creates ApiaryMembership with WORKER role and ACTIVE status on valid invite', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
    (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      id: 'invitee-1',
      email: 'invitee@test.com',
      fullName: 'Test User',
    });
    (mockPrisma.apiaryMembership.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.apiaryMembership.create as jest.Mock).mockResolvedValue({
      id: 'membership-1',
      joinedAt: new Date(),
    });

    const req = mockReq({ body: { email: 'invitee@test.com' } });
    const res = mockRes();

    await inviteMember(req as Request, res as Response);

    expect(mockPrisma.apiaryMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'WORKER', status: 'ACTIVE' }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 409 when user is already a member', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
    (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      id: 'invitee-1',
      email: 'invitee@test.com',
      fullName: 'Test User',
    });
    (mockPrisma.apiaryMembership.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    const req = mockReq({ body: { email: 'invitee@test.com' } });
    const res = mockRes();

    await inviteMember(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('returns 400 when owner invites themselves', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
    (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      id: 'owner-1', // same as req.user.id
      email: 'owner@test.com',
      fullName: 'Owner',
    });

    const req = mockReq({ body: { email: 'owner@test.com' } });
    const res = mockRes();

    await inviteMember(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when invitee email not found', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
    (mockPrisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ body: { email: 'nobody@test.com' } });
    const res = mockRes();

    await inviteMember(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when assistant tries to invite', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'assistant' });

    const req = mockReq({ body: { email: 'someone@test.com' } });
    const res = mockRes();

    await inviteMember(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('getMembers', () => {
  beforeEach(() => jest.clearAllMocks());

  // Property 6: response contains userId, name, email, role, joinedAt for each member
  it('returns members with required fields: userId, name, email, role, joinedAt', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'owner' });
    (mockPrisma.apiary.findUnique as jest.Mock).mockResolvedValue({
      owner: { id: 'owner-1', fullName: 'Owner Name', email: 'owner@test.com' },
    });
    (mockPrisma.apiaryMembership.findMany as jest.Mock).mockResolvedValue([
      {
        user: { id: 'member-1', fullName: 'Member One', email: 'member1@test.com' },
        joinedAt: new Date('2025-01-01'),
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await getMembers(req as Request, res as Response);

    expect(res.json).toHaveBeenCalled();
    const members = (res.json as jest.Mock).mock.calls[0][0];

    // Every member must have the required fields
    members.forEach((m: any) => {
      expect(m).toHaveProperty('userId');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('email');
      expect(m).toHaveProperty('role');
      expect(m).toHaveProperty('joinedAt');
    });

    // Owner must be included
    expect(members.some((m: any) => m.role === 'owner')).toBe(true);
  });

  it('returns 403 when assistant tries to view members', async () => {
    mockHasAccess.mockResolvedValue({ hasAccess: true, role: 'assistant' });

    const req = mockReq();
    const res = mockRes();

    await getMembers(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
