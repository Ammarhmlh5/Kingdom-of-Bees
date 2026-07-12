/**
 * User Controller
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        include: {
          ownedApiaries: {
            select: { id: true, name: true, type: true },
          },
          apiaryMemberships: {
            where: { status: 'ACTIVE' },
            include: {
              apiary: {
                select: { id: true, name: true, type: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { fullName, phone, language, timezone, avatarUrl } = req.body;

      const user = await prisma.userProfile.update({
        where: { id: userId },
        data: {
          fullName,
          phone,
          language,
          timezone,
          avatarUrl,
        },
      });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.userProfile.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          userType: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const where = {
        userId,
        ...(unreadOnly === 'true' && { read: false }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip: (Number(page) - 1) * Number(limit),
        }),
        prisma.notification.count({ where }),
      ]);

      res.json({
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      await prisma.notification.update({
        where: {
          id,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

