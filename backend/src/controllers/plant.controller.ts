import { Request, Response } from 'express';
import { PlantService } from '../services/plant.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';
import { addLocalPlantSchema, updateLocalPlantSchema } from '../validators/plant.schema';

const plantService = new PlantService();

export class PlantController {

  async search(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        return ApiResponse.success(res, [], 'No query provided');
      }
      const results = await plantService.searchLibrary(query);
      return ApiResponse.success(res, results);
    } catch (error) {
      return ApiResponse.error(res, 'فشل البحث في مكتبة النباتات');
    }
  }

  async listByApiary(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const plants = await plantService.getApiaryPlants(apiaryId);
      return ApiResponse.success(res, plants);
    } catch (error) {
      return ApiResponse.error(res, 'فشل جلب نباتات المنحل');
    }
  }

  async add(req: Request, res: Response) {
    try {
      const apiaryId = req.params.apiaryId as string;
      const user = (req as AuthenticatedRequest).user;
      const parsed = addLocalPlantSchema.parse(req.body);
      const plant = await plantService.addLocalPlant(apiaryId, {
        ...parsed,
        addedBy: user?.id,
      });
      return ApiResponse.created(res, plant, 'تمت إضافة النبات للمنحل');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ApiResponse.badRequest(res, 'بيانات غير صالحة', error.errors);
      }
      return ApiResponse.error(res, error.message || 'فشل إضافة النبات');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { apiaryId, plantId } = req.params as Record<string, string>;
      const parsed = updateLocalPlantSchema.parse(req.body);
      const plant = await plantService.updateLocalPlant(plantId, apiaryId, parsed);
      return ApiResponse.success(res, plant, 'تم تحديث بيانات النبات');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ApiResponse.badRequest(res, 'بيانات غير صالحة', error.errors);
      }
      return ApiResponse.error(res, error.message || 'فشل تحديث النبات');
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { apiaryId, plantId } = req.params as Record<string, string>;
      await plantService.removeLocalPlant(plantId, apiaryId);
      return ApiResponse.success(res, null, 'تم حذف النبات من المنحل');
    } catch (error) {
      return ApiResponse.error(res, 'فشل حذف النبات');
    }
  }
}
