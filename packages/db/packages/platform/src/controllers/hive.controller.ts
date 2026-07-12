/**
 * Hive Controller
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/error.middleware';

export class HiveController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { apiaryId } = req.query;

      const where: any = {
        apiary: {
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
      };

      if (apiaryId) {
        where.apiaryId = apiaryId;
      }

      const hives = await prisma.hive.findMany({
        where,
        include: {
          apiary: {
            select: { id: true, name: true },
          },
          queen: {
            select: { id: true, marked: true, markColor: true },
          },
        },
      });

      res.json({ hives });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        apiaryId,
        hiveNumber,
        name,
        hiveType,
        stories,
        framesPerBox,
        frameSize,
        installationDate,
      } = req.body;

      if (!apiaryId || !hiveNumber || !hiveType) {
        throw new AppError(400, 'Apiary ID, hive number, and hive type are required');
      }

      const hive = await prisma.hive.create({
        data: {
          apiaryId,
          hiveNumber,
          name,
          hiveType,
          stories: stories || 1,
          framesPerBox: framesPerBox || 10,
          frameSize,
          installationDate: installationDate ? new Date(installationDate) : new Date(),
          status: 'ACTIVE',
        },
      });

      // Update apiary hive count
      await prisma.apiary.update({
        where: { id: apiaryId },
        data: {
          currentHiveCount: { increment: 1 },
        },
      });

      // Update user hive count
      const userId = req.user?.id;
      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          totalHives: { increment: 1 },
        },
      });

      res.status(201).json({ hive });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const hive = await prisma.hive.findUnique({
        where: { id },
        include: {
          apiary: {
            select: { id: true, name: true },
          },
          queen: true,
          frames: {
            orderBy: [{ story: 'asc' }, { position: 'asc' }],
          },
          supers: {
            where: { status: 'ACTIVE' },
            orderBy: { superNumber: 'asc' },
          },
        },
      });

      if (!hive) {
        throw new AppError(404, 'Hive not found');
      }

      res.json({ hive });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const hive = await prisma.hive.update({
        where: { id },
        data: updateData,
      });

      res.json({ hive });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const hive = await prisma.hive.findUnique({
        where: { id },
        select: { apiaryId: true },
      });

      if (!hive) {
        throw new AppError(404, 'Hive not found');
      }

      await prisma.hive.delete({
        where: { id },
      });

      // Update apiary hive count
      await prisma.apiary.update({
        where: { id: hive.apiaryId },
        data: {
          currentHiveCount: { decrement: 1 },
        },
      });

      // Update user hive count
      const userId = req.user?.id;
      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          totalHives: { decrement: 1 },
        },
      });

      res.json({ message: 'Hive deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getFrames(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const frames = await prisma.hiveFrame.findMany({
        where: { hiveId: id },
        orderBy: [{ story: 'asc' }, { position: 'asc' }],
      });

      res.json({ frames });
    } catch (error) {
      next(error);
    }
  }

  async updateFrames(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { frames } = req.body;

      if (!Array.isArray(frames)) {
        throw new AppError(400, 'Frames must be an array');
      }

      // Update frames in transaction
      await prisma.$transaction(
        frames.map((frame: any) =>
          prisma.hiveFrame.upsert({
            where: { id: frame.id || 'new' },
            create: {
              hiveId: id,
              story: frame.story,
              position: frame.position,
              frameType: frame.frameType,
              broodPercentage: frame.broodPercentage || 0,
              broodType: frame.broodType,
              honeyPercentage: frame.honeyPercentage || 0,
              pollenPercentage: frame.pollenPercentage || 0,
              condition: frame.condition || 'GOOD',
            },
            update: {
              broodPercentage: frame.broodPercentage,
              broodType: frame.broodType,
              honeyPercentage: frame.honeyPercentage,
              pollenPercentage: frame.pollenPercentage,
              condition: frame.condition,
              lastUpdated: new Date(),
              updatedBy: req.user?.id,
            },
          })
        )
      );

      res.json({ message: 'Frames updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getInspections(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      const inspections = await prisma.inspection.findMany({
        where: { hiveId: id },
        orderBy: { inspectionDate: 'desc' },
        take: Number(limit),
        select: {
          id: true,
          inspectionDate: true,
          inspectionType: true,
          overallAssessment: true,
          strengthAfter: true,
          queenSeen: true,
          notes: true,
        },
      });

      res.json({ inspections });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const [hive, frameStats, inspectionCount, lastInspection] = await Promise.all([
        prisma.hive.findUnique({
          where: { id },
          select: {
            strengthScore: true,
            strengthRating: true,
            lastInspectionDate: true,
          },
        }),
        prisma.hiveFrame.aggregate({
          where: { hiveId: id },
          _avg: {
            broodPercentage: true,
            honeyPercentage: true,
            pollenPercentage: true,
          },
          _count: true,
        }),
        prisma.inspection.count({ where: { hiveId: id } }),
        prisma.inspection.findFirst({
          where: { hiveId: id },
          orderBy: { inspectionDate: 'desc' },
          select: {
            inspectionDate: true,
            overallAssessment: true,
          },
        }),
      ]);

      res.json({
        stats: {
          strength: {
            score: hive?.strengthScore,
            rating: hive?.strengthRating,
          },
          frames: {
            total: frameStats._count,
            avgBrood: frameStats._avg.broodPercentage,
            avgHoney: frameStats._avg.honeyPercentage,
            avgPollen: frameStats._avg.pollenPercentage,
          },
          inspections: {
            total: inspectionCount,
            lastDate: lastInspection?.inspectionDate,
            lastAssessment: lastInspection?.overallAssessment,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

