import { Request, Response } from 'express';
import { inspectionSettingService } from '../services/inspectionSetting.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class InspectionSettingController {
  /**
   * GET /api/inspection-settings
   * عرض جميع الإعدادات
   */
  async getAll(_req: Request, res: Response) {
    try {
      const settings = await inspectionSettingService.getAll();
      ApiResponse.success(res, settings);
    } catch (error) {
      logger.error('Error fetching inspection settings:', error);
      ApiResponse.error(res, 'فشل في جلب إعدادات الفحص', 500);
    }
  }

  /**
   * GET /api/inspection-settings/:type
   * عرض إعداد نوع محدد
   */
  async getByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const setting = await inspectionSettingService.getByType(type);
      
      if (!setting) {
        return ApiResponse.error(res, 'الإعداد غير موجود', 404);
      }
      
      ApiResponse.success(res, setting);
    } catch (error) {
      logger.error('Error fetching inspection setting:', error);
      ApiResponse.error(res, 'فشل في جلب الإعداد', 500);
    }
  }

  /**
   * POST /api/inspection-settings
   * إنشاء أو تحديث إعداد
   */
  async upsert(req: Request, res: Response) {
    try {
      const { type, nameAr, minInterval, maxInterval, isActive, description } = req.body;
      
      if (!type || minInterval === undefined || maxInterval === undefined) {
        return ApiResponse.error(res, 'يرجى إدخال نوع الفحص والحد الأدنى والأقصى', 400);
      }
      
      const setting = await inspectionSettingService.upsert({
        type,
        nameAr: nameAr || type,
        nameEn: type, // Use type as English name
        minInterval,
        maxInterval,
        isActive,
        description
      });
      
      ApiResponse.success(res, setting, 'تم حفظ الإعداد بنجاح');
    } catch (error) {
      logger.error('Error saving inspection setting:', error);
      ApiResponse.error(res, 'فشل في حفظ الإعداد', 500);
    }
  }

  /**
   * PUT /api/inspection-settings/:type
   * تحديث إعداد نوع محدد
   */
  async update(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const { nameAr, minInterval, maxInterval, isActive, description } = req.body;
      
      const setting = await inspectionSettingService.update(type, {
        nameAr,
        minInterval,
        maxInterval,
        isActive,
        description
      });
      
      ApiResponse.success(res, setting, 'تم تحديث الإعداد بنجاح');
    } catch (error) {
      logger.error('Error updating inspection setting:', error);
      ApiResponse.error(res, 'فشل في تحديث الإعداد', 500);
    }
  }

  /**
   * DELETE /api/inspection-settings/:type
   * تعطيل إعداد (الحذف الناعم)
   */
  async deactivate(req: Request, res: Response) {
    try {
      const { type } = req.params;
      await inspectionSettingService.deactivate(type);
      
      ApiResponse.success(res, null, 'تم تعطيل الإعداد بنجاح');
    } catch (error) {
      logger.error('Error deactivating inspection setting:', error);
      ApiResponse.error(res, 'فشل في تعطيل الإعداد', 500);
    }
  }

  /**
   * POST /api/inspection-settings/validate
   * التحقق من صحة التاريخ
   */
  async validate(req: Request, res: Response) {
    try {
      const { type, inspectionDate } = req.body;
      
      if (!type || !inspectionDate) {
        return ApiResponse.error(res, 'يرجى إدخال نوع الفحص وتاريخه', 400);
      }
      
      const result = await inspectionSettingService.validateDate(type, new Date(inspectionDate));
      
      ApiResponse.success(res, {
        valid: result.valid,
        message: result.message,
        setting: result.setting
      });
    } catch (error) {
      logger.error('Error validating inspection date:', error);
      ApiResponse.error(res, 'فشل في التحقق من التاريخ', 500);
    }
  }
}

export const inspectionSettingController = new InspectionSettingController();