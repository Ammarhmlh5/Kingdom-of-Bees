import { Request, Response } from 'express';
import { AdminPlantService } from '../services/admin-plant.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { createPlantSchema, updatePlantSchema } from '../validators/plant.schema';

const service = new AdminPlantService();

export class AdminPlantController {

  async list(req: Request, res: Response) {
    try {
      const { page, limit, search } = parsePagination(req);
      const { type, verified } = req.query;
      const result = await service.listPlants({
        page,
        limit,
        type: type as string,
        search,
        verified: verified !== undefined ? verified === 'true' : undefined,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      return ApiResponse.error(res, 'فشل جلب النباتات');
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plant = await service.getPlant(id);
      return ApiResponse.success(res, plant);
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'النبتة غير موجودة', 404);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = createPlantSchema.parse(req.body);
      const plant = await service.createPlant(parsed);
      return ApiResponse.created(res, plant, 'تمت إضافة النبتة');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ApiResponse.badRequest(res, 'بيانات غير صالحة', error.errors);
      }
      return ApiResponse.error(res, error.message || 'فشل إضافة النبتة');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updatePlantSchema.parse(req.body);
      const plant = await service.updatePlant(id, parsed);
      return ApiResponse.success(res, plant, 'تم تحديث النبتة');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ApiResponse.badRequest(res, 'بيانات غير صالحة', error.errors);
      }
      return ApiResponse.error(res, error.message || 'فشل تحديث النبتة');
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.deletePlant(id);
      return ApiResponse.success(res, null, 'تم حذف النبتة');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'فشل حذف النبتة', 404);
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as AuthenticatedRequest).user;
      const plant = await service.verifyPlant(id, user?.id || '');
      return ApiResponse.success(res, plant, plant.verified ? 'تم توثيق النبتة' : 'تم إلغاء توثيق النبتة');
    } catch (error: any) {
      return ApiResponse.error(res, error.message || 'فشل تحديث حالة التوثيق', 404);
    }
  }
}
