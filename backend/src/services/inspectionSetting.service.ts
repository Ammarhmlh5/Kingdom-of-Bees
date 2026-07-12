import prisma from '../config/prisma';

export interface InspectionSettingData {
  type: string;
  nameAr: string;
  nameEn: string;
  minInterval: number;
  maxInterval: number;
  isActive?: boolean;
  description?: string;
}

export class InspectionSettingService {
  /**
   * الحصول على جميع إعدادات الفحص
   */
  async getAll() {
    return await prisma.inspectionSetting.findMany({
      orderBy: { type: 'asc' }
    });
  }

  /**
   * الحصول على إعداد حسب النوع
   */
  async getByType(type: string) {
    return await prisma.inspectionSetting.findUnique({
      where: { type }
    });
  }

  /**
   * إنشاء أو تحديث إعداد
   */
  async upsert(data: InspectionSettingData) {
    return await prisma.inspectionSetting.upsert({
      where: { type: data.type },
      update: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        minInterval: data.minInterval,
        maxInterval: data.maxInterval,
        isActive: data.isActive ?? true,
        description: data.description
      },
      create: {
        type: data.type,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        minInterval: data.minInterval,
        maxInterval: data.maxInterval,
        isActive: data.isActive ?? true,
        description: data.description
      }
    });
  }

  /**
   * تحديث إعداد حسب النوع
   */
  async update(type: string, data: Partial<InspectionSettingData>) {
    return await prisma.inspectionSetting.update({
      where: { type },
      data: {
        nameAr: data.nameAr,
        minInterval: data.minInterval,
        maxInterval: data.maxInterval,
        isActive: data.isActive,
        description: data.description
      }
    });
  }

  /**
   * حذف إعداد (تعطيله فقط)
   */
  async deactivate(type: string) {
    return await prisma.inspectionSetting.update({
      where: { type },
      data: { isActive: false }
    });
  }

  /**
   * التحقق من صحة التاريخ بناءً على الإعدادات
   */
  async validateDate(type: string, inspectionDate: Date): Promise<{
    valid: boolean;
    message: string;
    setting?: any;
  }> {
    const setting = await this.getByType(type);

    if (!setting) {
      return { valid: true, message: 'لا توجد إعدادات لهذا النوع' };
    }

    if (!setting.isActive) {
      return { valid: false, message: 'هذا النوع غير مفعل' };
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(inspectionDate).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // التحقق من الحد الأدنى
    if (setting.minInterval > 0 && diffDays < setting.minInterval) {
      return {
        valid: false,
        message: `التاريخ قريب جداً. أدنى فترة مسموحة: ${setting.minInterval} أيام`
      };
    }

    // التحقق من الحد الأعلى
    if (diffDays > setting.maxInterval) {
      return {
        valid: false,
        message: `التاريخ متأخر جداً. أقصى فترة مسموحة: ${setting.maxInterval} أيام`
      };
    }

    return { valid: true, message: '', setting };
  }
}

export const inspectionSettingService = new InspectionSettingService();
