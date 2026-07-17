import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { hasApiaryAccess } from '../lib/access';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiaryId = req.params.apiaryId as string;
    const userId = (req as AuthenticatedRequest).user!.id;

    const { hasAccess, role } = await hasApiaryAccess(userId, apiaryId);
    if (!hasAccess) {
      ApiResponse.forbidden(res, 'Access denied');
      return;
    }
    if (role !== 'owner') {
      ApiResponse.forbidden(res, 'Only the owner can view members');
      return;
    }

    const apiary = await prisma.apiary.findUnique({
      where: { id: apiaryId },
      include: { owner: { select: { id: true, fullName: true, email: true } } },
    }) as { owner: { id: string; fullName: string; email: string } } | null;

    const memberships = await prisma.apiaryMembership.findMany({
      where: { apiaryId, status: 'ACTIVE' },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    }) as ({ user: { id: string; fullName: string; email: string }; joinedAt: Date | null })[];

    const members = [
      {
        userId: apiary!.owner.id,
        name: apiary!.owner.fullName,
        email: apiary!.owner.email,
        role: 'owner',
        joinedAt: null,
      },
      ...memberships.map((m) => ({
        userId: m.user.id,
        name: m.user.fullName,
        email: m.user.email,
        role: 'assistant',
        joinedAt: m.joinedAt,
      })),
    ];

    ApiResponse.success(res, members);
  } catch (error) {
    ApiResponse.error(res, 'Internal server error', 500);
  }
};

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiaryId = req.params.apiaryId as string;
    const userId = (req as AuthenticatedRequest).user!.id;
    const { email } = req.body;

    if (!email) {
      ApiResponse.error(res, 'Email is required', 400);
      return;
    }

    const { hasAccess, role } = await hasApiaryAccess(userId, apiaryId);
    if (!hasAccess || role !== 'owner') {
      ApiResponse.forbidden(res, 'Only the owner can invite members');
      return;
    }

    // Find the user to invite
    const invitee = await prisma.userProfile.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    if (!invitee) {
      ApiResponse.error(res, 'User not found', 404);
      return;
    }

    // Cannot invite yourself
    if (invitee.id === userId) {
      ApiResponse.error(res, 'Owner cannot invite themselves', 400);
      return;
    }

    // Check if already a member
    const existing = await prisma.apiaryMembership.findUnique({
      where: { apiaryId_userId: { apiaryId, userId: invitee.id } },
    });

    if (existing) {
      ApiResponse.error(res, 'User is already a member', 409);
      return;
    }

    const membership = await prisma.apiaryMembership.create({
      data: {
        apiaryId,
        userId: invitee.id,
        role: 'WORKER',
        status: 'ACTIVE',
        invitedBy: userId,
        joinedAt: new Date(),
      },
    });

    ApiResponse.created(res, {
      membership: {
        userId: invitee.id,
        name: invitee.fullName,
        email: invitee.email,
        role: 'assistant',
        joinedAt: membership.joinedAt,
      },
    }, 'Member invited successfully');
  } catch (error) {
    ApiResponse.error(res, 'Internal server error', 500);
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiaryId = req.params.apiaryId as string;
    const memberId = req.params.memberId as string;
    const userId = (req as AuthenticatedRequest).user!.id;

    const { hasAccess, role } = await hasApiaryAccess(userId, apiaryId);
    if (!hasAccess || role !== 'owner') {
      ApiResponse.forbidden(res, 'Only the owner can remove members');
      return;
    }

    const membership = await prisma.apiaryMembership.findUnique({
      where: { apiaryId_userId: { apiaryId, userId: memberId } },
    });

    if (!membership) {
      ApiResponse.error(res, 'Member not found', 404);
      return;
    }

    await prisma.apiaryMembership.delete({
      where: { apiaryId_userId: { apiaryId, userId: memberId } },
    });

    ApiResponse.success(res, null, 'Member removed successfully');
  } catch (error) {
    ApiResponse.error(res, 'Internal server error', 500);
  }
};
