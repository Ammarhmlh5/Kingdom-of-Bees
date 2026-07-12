import prisma from '../config/prisma';

export interface CreateScheduleData {
  hiveId: string;
  settingId: string;
  scheduledDate: Date;
  notes?: string;
  apiaryId?: string;
}

export class InspectionScheduleService {
  /**
   * الحصول على جميع الجداول لخطة محددة
   */
  async getAll(apiaryId?: string) {
    const where = apiaryId ? {
      hive: { apiaryId }
    } : {};

    return await prisma.inspectionSchedule.findMany({
      where,
      include: {
        hive: {
          select: {
            id: true,
            hiveNumber: true,
            name: true,
            apiaryId: true
          }
        },
        setting: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  /**
   * الحصول على جداول خلية محددة
   */
  async getByHiveId(hiveId: string) {
    return await prisma.inspectionSchedule.findMany({
      where: { hiveId },
      include: { setting: true },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  /**
   * الحصول على جداول قادمة
   */
  async getUpcoming(limit: number = 10) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return await prisma.inspectionSchedule.findMany({
      where: {
        status: 'PENDING',
        scheduledDate: { lte: tomorrow }
      },
      include: {
        hive: {
          include: {
            apiary: {
              select: { id: true, name: true }
            }
          }
        },
        setting: true
      },
      orderBy: { scheduledDate: 'asc' },
      take: limit
    });
  }

  /**
   * الحصول على الجداول المتأخرة
   */
  async getOverdue(limit: number = 10) {
    const now = new Date();

    return await prisma.inspectionSchedule.findMany({
      where: {
        status: 'PENDING',
        scheduledDate: { lt: now }
      },
      include: {
        hive: {
          include: {
            apiary: {
              select: { id: true, name: true }
            }
          }
        },
        setting: true
      },
      orderBy: { scheduledDate: 'asc' },
      take: limit
    });
  }

  /**
   * إنشاء جدول جديد
   */
  async create(data: CreateScheduleData) {
    const apiaryId = data.apiaryId || (
      await prisma.hive.findUniqueOrThrow({
        where: { id: data.hiveId },
        select: { apiaryId: true }
      })
    ).apiaryId;

    return await prisma.inspectionSchedule.create({
      data: {
        hiveId: data.hiveId,
        apiaryId,
        settingId: data.settingId,
        scheduledDate: data.scheduledDate,
        status: 'PENDING' as any,
        notes: data.notes
      },
      include: {
        hive: true,
        setting: true
      }
    });
  }

  /**
   * تحديث حالة الجدول
   */
  async updateStatus(id: string, status: string, completedAt?: Date) {
    return await prisma.inspectionSchedule.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: completedAt || null
      },
      include: {
        hive: true,
        setting: true
      }
    });
  }

  /**
   * تحديد الجدول كمكتمل
   */
  async complete(id: string) {
    return await this.updateStatus(id, 'COMPLETED', new Date());
  }

  /**
   * تحديد الجدول كملغى
   */
  async cancel(id: string) {
    return await this.updateStatus(id, 'CANCELLED');
  }

  /**
   * حذف جدول
   */
  async delete(id: string) {
    return await prisma.inspectionSchedule.delete({
      where: { id }
    });
  }

  /**
   * البحث عن جدول pending للخلية
   */
  async getPendingByHiveId(hiveId: string) {
    return await prisma.inspectionSchedule.findFirst({
      where: {
        hiveId,
        status: 'PENDING'
      },
      include: { setting: true },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  /**
   * حساب تاريخ الفحص القادم
   */
  calculateNextDate(lastInspectionDate: Date, maxInterval: number): Date {
    const nextDate = new Date(lastInspectionDate);
    nextDate.setDate(nextDate.getDate() + maxInterval);
    return nextDate;
  }

  /**
   * التحقق من الموعد المجدول السابق وتحديث حالته
   */
  async checkAndUpdatePreviousSchedule(hiveId: string, completedDate: Date) {
    const pendingSchedule = await this.getPendingByHiveId(hiveId);

    if (!pendingSchedule) {
      return null;
    }

    const isOnTimeOrLate = completedDate >= pendingSchedule.scheduledDate;
    const isEarly = completedDate < pendingSchedule.scheduledDate;

    if (isOnTimeOrLate) {
      // تم الفحص في الوقت المحدد أو متأخراً
      await this.complete(pendingSchedule.id);
    } else if (isEarly) {
      // تم الفحص مبكراً - نحدد الحالي كمكتمل ونلغي الجدولة الجديدة المحسوبة
      await this.complete(pendingSchedule.id);
    }

    return pendingSchedule;
  }
}

export const inspectionScheduleService = new InspectionScheduleService();
