/**
 * Treatment Schedule Manager
 * مدير جداول العلاجات
 */

import {
  TreatmentSchedule,
  ScheduledDose,
  CreateScheduleOptions,
  UpdateScheduleOptions,
  CompleteDoseOptions,
  ScheduleFilter,
  ScheduleStatistics,
  DoseStatus,
  ScheduleStatus,
} from '../types/schedule';
import { TreatmentService } from '../services/TreatmentService';

/**
 * مدير جداول العلاجات
 */
export class TreatmentScheduleManager {
  private schedules: Map<string, TreatmentSchedule> = new Map();
  private nextId = 1;

  /**
   * إنشاء جدول علاج جديد
   */
  createSchedule(options: CreateScheduleOptions): TreatmentSchedule {
    // الحصول على بيانات العلاج
    const treatment = TreatmentService.getTreatmentById(options.treatmentId);
    if (!treatment) {
      throw new Error(`العلاج غير موجود: ${options.treatmentId}`);
    }

    // حساب عدد الجرعات والفترة بينها
    const numberOfDoses = options.numberOfDoses || treatment.dosage.frequency || 1;
    const intervalDays = options.intervalDays || treatment.duration.days || 7;

    // إنشاء الجرعات المجدولة
    const doses: ScheduledDose[] = [];
    const startDate = new Date(options.startDate);

    for (let i = 0; i < numberOfDoses; i++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + (i * intervalDays));

      doses.push({
        id: `dose-${this.nextId}-${i + 1}`,
        scheduleId: `schedule-${this.nextId}`,
        doseNumber: i + 1,
        scheduledDate,
        status: 'pending',
      });
    }

    // حساب تاريخ الانتهاء المتوقع
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setDate(
      expectedEndDate.getDate() + ((numberOfDoses - 1) * intervalDays)
    );

    // حساب فترة الأمان
    const safetyPeriodDays = treatment.safetyPeriod?.days || 0;
    const safetyPeriodEndDate = new Date(expectedEndDate);
    safetyPeriodEndDate.setDate(safetyPeriodEndDate.getDate() + safetyPeriodDays);

    // حساب التكلفة الإجمالية
    const totalCost = (treatment.cost?.price || 0) * numberOfDoses;

    // إنشاء الجدول
    const schedule: TreatmentSchedule = {
      id: `schedule-${this.nextId++}`,
      hiveId: options.hiveId,
      treatmentId: options.treatmentId,
      treatment,
      startDate,
      expectedEndDate,
      status: 'active',
      doses,
      safetyPeriodDays,
      safetyPeriodEndDate,
      totalCost,
      notes: options.notes,
      createdBy: options.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // حفظ الجدول
    this.schedules.set(schedule.id, schedule);

    return schedule;
  }

  /**
   * الحصول على جدول بالمعرف
   */
  getSchedule(scheduleId: string): TreatmentSchedule | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * الحصول على جميع الجداول
   */
  getSchedules(filter?: ScheduleFilter): TreatmentSchedule[] {
    let schedules = Array.from(this.schedules.values());

    if (!filter) {
      return schedules;
    }

    // تطبيق الفلاتر
    if (filter.hiveId) {
      schedules = schedules.filter(s => s.hiveId === filter.hiveId);
    }

    if (filter.treatmentId) {
      schedules = schedules.filter(s => s.treatmentId === filter.treatmentId);
    }

    if (filter.status) {
      schedules = schedules.filter(s => s.status === filter.status);
    }

    if (filter.startDateFrom) {
      schedules = schedules.filter(s => s.startDate >= filter.startDateFrom!);
    }

    if (filter.startDateTo) {
      schedules = schedules.filter(s => s.startDate <= filter.startDateTo!);
    }

    if (filter.hasOverdueDoses) {
      schedules = schedules.filter(s =>
        s.doses.some(d => d.status === 'overdue')
      );
    }

    if (filter.hasActiveSafetyPeriod) {
      const now = new Date();
      schedules = schedules.filter(s =>
        s.status === 'active' && s.safetyPeriodEndDate > now
      );
    }

    return schedules;
  }

  /**
   * تحديث جدول
   */
  updateSchedule(
    scheduleId: string,
    options: UpdateScheduleOptions
  ): TreatmentSchedule {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`الجدول غير موجود: ${scheduleId}`);
    }

    // تحديث الحقول
    if (options.status !== undefined) {
      schedule.status = options.status;
    }

    if (options.notes !== undefined) {
      schedule.notes = options.notes;
    }

    if (options.actualEndDate !== undefined) {
      schedule.actualEndDate = options.actualEndDate;
    }

    schedule.updatedAt = new Date();

    return schedule;
  }

  /**
   * إلغاء جدول
   */
  cancelSchedule(scheduleId: string): TreatmentSchedule {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`الجدول غير موجود: ${scheduleId}`);
    }

    schedule.status = 'cancelled';
    schedule.actualEndDate = new Date();
    schedule.updatedAt = new Date();

    // إلغاء جميع الجرعات المعلقة
    schedule.doses.forEach(dose => {
      if (dose.status === 'pending') {
        dose.status = 'cancelled';
      }
    });

    return schedule;
  }

  /**
   * إيقاف جدول مؤقتاً
   */
  pauseSchedule(scheduleId: string): TreatmentSchedule {
    return this.updateSchedule(scheduleId, { status: 'paused' });
  }

  /**
   * استئناف جدول
   */
  resumeSchedule(scheduleId: string): TreatmentSchedule {
    return this.updateSchedule(scheduleId, { status: 'active' });
  }

  /**
   * حذف جدول
   */
  deleteSchedule(scheduleId: string): boolean {
    return this.schedules.delete(scheduleId);
  }

  /**
   * الحصول على جرعة بالمعرف
   */
  getDose(scheduleId: string, doseId: string): ScheduledDose | undefined {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      return undefined;
    }

    return schedule.doses.find(d => d.id === doseId);
  }

  /**
   * إكمال جرعة
   */
  completeDose(scheduleId: string, options: CompleteDoseOptions): ScheduledDose {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`الجدول غير موجود: ${scheduleId}`);
    }

    const dose = schedule.doses.find(d => d.id === options.doseId);
    if (!dose) {
      throw new Error(`الجرعة غير موجودة: ${options.doseId}`);
    }

    if (dose.status === 'completed') {
      throw new Error('الجرعة مكتملة بالفعل');
    }

    // تحديث الجرعة
    dose.status = 'completed';
    dose.completedDate = options.completedDate || new Date();
    dose.completedBy = options.userId;
    if (options.notes) {
      dose.notes = options.notes;
    }

    // تحديث الجدول
    schedule.updatedAt = new Date();

    // التحقق إذا كانت جميع الجرعات مكتملة
    const allCompleted = schedule.doses.every(d => d.status === 'completed');
    if (allCompleted) {
      schedule.status = 'completed';
      schedule.actualEndDate = new Date();
    }

    return dose;
  }

  /**
   * تحديث حالة الجرعات المتأخرة
   */
  updateOverdueDoses(): number {
    const now = new Date();
    let count = 0;

    this.schedules.forEach(schedule => {
      if (schedule.status === 'active') {
        schedule.doses.forEach(dose => {
          if (dose.status === 'pending' && dose.scheduledDate < now) {
            dose.status = 'overdue';
            count++;
          }
        });
      }
    });

    return count;
  }

  /**
   * الحصول على الجرعات القادمة
   */
  getUpcomingDoses(days: number = 7): ScheduledDose[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingDoses: ScheduledDose[] = [];

    this.schedules.forEach(schedule => {
      if (schedule.status === 'active') {
        schedule.doses.forEach(dose => {
          if (
            dose.status === 'pending' &&
            dose.scheduledDate >= now &&
            dose.scheduledDate <= futureDate
          ) {
            upcomingDoses.push(dose);
          }
        });
      }
    });

    // ترتيب حسب التاريخ
    return upcomingDoses.sort(
      (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );
  }

  /**
   * الحصول على الجرعات المتأخرة
   */
  getOverdueDoses(): ScheduledDose[] {
    const overdueDoses: ScheduledDose[] = [];

    this.schedules.forEach(schedule => {
      if (schedule.status === 'active') {
        schedule.doses.forEach(dose => {
          if (dose.status === 'overdue') {
            overdueDoses.push(dose);
          }
        });
      }
    });

    return overdueDoses;
  }

  /**
   * الحصول على إحصائيات الجداول
   */
  getStatistics(hiveId?: string): ScheduleStatistics {
    let schedules = Array.from(this.schedules.values());

    if (hiveId) {
      schedules = schedules.filter(s => s.hiveId === hiveId);
    }

    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter(s => s.status === 'active').length;
    const completedSchedules = schedules.filter(s => s.status === 'completed').length;
    const cancelledSchedules = schedules.filter(s => s.status === 'cancelled').length;

    let totalDoses = 0;
    let completedDoses = 0;
    let pendingDoses = 0;
    let overdueDoses = 0;
    let totalCost = 0;

    schedules.forEach(schedule => {
      totalDoses += schedule.doses.length;
      totalCost += schedule.totalCost;

      schedule.doses.forEach(dose => {
        if (dose.status === 'completed') completedDoses++;
        else if (dose.status === 'pending') pendingDoses++;
        else if (dose.status === 'overdue') overdueDoses++;
      });
    });

    const complianceRate =
      totalDoses > 0 ? (completedDoses / totalDoses) * 100 : 0;

    return {
      totalSchedules,
      activeSchedules,
      completedSchedules,
      cancelledSchedules,
      totalDoses,
      completedDoses,
      pendingDoses,
      overdueDoses,
      totalCost,
      complianceRate,
    };
  }

  /**
   * مسح جميع الجداول (للاختبار فقط)
   */
  clear(): void {
    this.schedules.clear();
    this.nextId = 1;
  }
}
