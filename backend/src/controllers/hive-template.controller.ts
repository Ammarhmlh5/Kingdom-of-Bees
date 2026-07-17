import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

const TYPE_CODES: Record<string, string> = {
  LANGSTROTH: 'Langstroth',
  BALADI: 'Baladi',
  KENYAN: 'Kenyan',
  WARRE: 'Warr',
  OTHER: 'Other',
};

async function resolveHiveTypeId(typeCode: string): Promise<string> {
  const searchTerm = TYPE_CODES[typeCode.toUpperCase()] ?? typeCode;
  const type = await prisma.hiveType.findFirst({
    where: {
      OR: [
        { nameEn: { contains: searchTerm, mode: 'insensitive' } },
        { nameAr: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
  });
  if (type) return type.id;
  const fallback = await prisma.hiveType.findFirst({
    where: { nameEn: { contains: 'Other', mode: 'insensitive' } },
  });
  if (fallback) return fallback.id;
  throw new Error('No hive types found in database.');
}

function toFrontend(template: any) {
  return {
    id: template.id,
    name: template.name,
    type: template.hiveType?.nameEn ?? 'Other',
    frames: template.framesPerBox,
    notes: template.defaultNotes ?? undefined,
    createdAt: template.createdAt.toISOString(),
  };
}

export class HiveTemplateController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const templates = await prisma.hiveTemplate.findMany({
        where: { isActive: true, createdBy: userId },
        include: { hiveType: true },
        orderBy: { createdAt: 'desc' },
      });
      ApiResponse.success(res, templates.map(toFrontend));
    } catch (error) {
      logger.error('Error fetching hive templates:', error);
      ApiResponse.error(res, 'Failed to fetch templates', 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, type, frames, notes } = req.body;
      if (!name || !type) {
        return ApiResponse.error(res, 'Name and type are required', 400);
      }
      const hiveTypeId = await resolveHiveTypeId(type);
      const template = await prisma.hiveTemplate.create({
        data: {
          name,
          hiveType: { connect: { id: hiveTypeId } },
          framesPerBox: frames ?? 10,
          defaultNotes: notes ?? undefined,
        },
        include: { hiveType: true },
      });
      ApiResponse.created(res, toFrontend(template));
    } catch (error) {
      logger.error('Error creating hive template:', error);
      ApiResponse.error(res, (error as Error).message, 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).user?.id;
      const template = await prisma.hiveTemplate.findFirst({
        where: { id, createdBy: userId },
      });
      if (!template) {
        return ApiResponse.error(res, 'Template not found', 404);
      }
      await prisma.hiveTemplate.update({
        where: { id },
        data: { isActive: false },
      });
      ApiResponse.success(res, null);
    } catch (error) {
      logger.error('Error deleting hive template:', error);
      ApiResponse.error(res, 'Failed to delete template', 500);
    }
  }
}
