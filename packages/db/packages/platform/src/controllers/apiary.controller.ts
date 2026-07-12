/**
 * Apiary Controller
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/error.middleware';

export class ApiaryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const apiaries = await prisma.apiary.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                  status: 'ACTIVE',
                },
              },
            },
          ],
        },
        include: {
          _count: {
            select: { hives: true },
          },
        },
      });

      res.json({ apiaries });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        name,
        description,
        type,
        locationLat,
        locationLng,
        address,
        region,
        elevation,
        establishedDate,
        initialHiveCount,
      } = req.body;

      if (!name || !type) {
        throw new AppError(400, 'Name and type are required');
      }

      const apiary = await prisma.apiary.create({
        data: {
          ownerId: userId!,
          name,
          description,
          type,
          locationLat,
          locationLng,
          address,
          region,
          elevation,
          establishedDate: establishedDate ? new Date(establishedDate) : null,
          initialHiveCount: initialHiveCount || 0,
          currentHiveCount: 0,
        },
      });

      // Update user apiary count
      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          totalApiaries: { increment: 1 },
        },
      });

      res.status(201).json({ apiary });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const apiary = await prisma.apiary.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          members: {
            where: { status: 'ACTIVE' },
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: { hives: true },
          },
        },
      });

      if (!apiary) {
        throw new AppError(404, 'Apiary not found');
      }

      res.json({ apiary });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const apiary = await prisma.apiary.update({
        where: { id },
        data: updateData,
      });

      res.json({ apiary });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await prisma.apiary.delete({
        where: { id },
      });

      // Update user apiary count
      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          totalApiaries: { decrement: 1 },
        },
      });

      res.json({ message: 'Apiary deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getHives(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const hives = await prisma.hive.findMany({
        where: { apiaryId: id },
        include: {
          queen: {
            select: { id: true, marked: true, markColor: true, qualityRating: true },
          },
        },
        orderBy: { hiveNumber: 'asc' },
      });

      res.json({ hives });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const [totalHives, activeHives, weakHives, queenlessHives, lastInspection] = await Promise.all([
        prisma.hive.count({ where: { apiaryId: id } }),
        prisma.hive.count({ where: { apiaryId: id, status: 'ACTIVE' } }),
        prisma.hive.count({ where: { apiaryId: id, status: 'WEAK' } }),
        prisma.hive.count({ where: { apiaryId: id, status: 'QUEENLESS' } }),
        prisma.inspection.findFirst({
          where: { apiaryId: id },
          orderBy: { inspectionDate: 'desc' },
          select: { inspectionDate: true },
        }),
      ]);

      res.json({
        stats: {
          totalHives,
          activeHives,
          weakHives,
          queenlessHives,
          lastInspectionDate: lastInspection?.inspectionDate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const members = await prisma.apiaryMembership.findMany({
        where: { apiaryId: id },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
        },
      });

      res.json({ members });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, role = 'WORKER' } = req.body;

      if (!email) {
        throw new AppError(400, 'Email is required');
      }

      // Find user by email
      const user = await prisma.userProfile.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Check if already a member
      const existing = await prisma.apiaryMembership.findFirst({
        where: {
          apiaryId: id,
          userId: user.id,
        },
      });

      if (existing) {
        throw new AppError(409, 'User is already a member');
      }

      const membership = await prisma.apiaryMembership.create({
        data: {
          apiaryId: id,
          userId: user.id,
          role,
          status: 'PENDING',
          invitedBy: req.user?.id,
        },
      });

      res.status(201).json({ membership });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;

      await prisma.apiaryMembership.delete({
        where: { id: memberId },
      });

      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

