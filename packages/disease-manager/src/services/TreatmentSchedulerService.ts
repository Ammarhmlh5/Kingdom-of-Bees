/**
 * Treatment Scheduler Service
 * خدمة جدولة العلاجات
 */

import { DatabaseAdapter } from '../database/types';
import { TreatmentScheduleManager } from '../core/TreatmentScheduleManager';
import { SafetyPeriodCalculator } from '../core/SafetyPeriodCalculator';
import { CostTracker, CostStatistics, HiveCostInfo } from '../core/CostTracker';
import {
  TreatmentSchedule,
  ScheduledDose,
  CreateScheduleOptions,
  UpdateScheduleOptions,
  CompleteDoseOptions,
  ScheduleFilter,
  ScheduleStatistics,
  SafetyPeriodInfo,
  SafetyPeriodCheckResult,
} from '../types/schedule';

/**
 * خدمة جدولة العلاجات الشاملة
 */
export class TreatmentSchedulerService {
  private scheduleManager: TreatmentScheduleManager;
  private database?: DatabaseAdapter;

  constructor(database?: DatabaseAdapter) {
    this.scheduleManager = new TreatmentScheduleManager();
    this.database = database;
  }

  // ==================== Schedule Management ====================

  /**
   * إنشاء جدول علاج جديد
   */
  async createSchedule(
    options: CreateScheduleOptions
  ): Promise<TreatmentSchedule> {
    const schedule = this.scheduleManager.createSchedule(options);

    // حفظ في قاعدة البيانات إذا كانت متاحة
    if (this.database) {
      await this.database.create('treatment_schedules', schedule);
    }

    return schedule;
  }

  /**
   * الحصول على جدول بالمعرف
   */
  async getSchedule(scheduleId: string): Promise<TreatmentSchedule | undefined> {
    // محاولة الحصول من الذاكرة أولاً
    let schedule = this.scheduleManager.getSchedule(scheduleId);

    // إذا لم يوجد، محاولة الحصول من قاعدة البيانات
    if (!schedule && this.database) {
      const result = await this.database.findOne<TreatmentSchedule>(
        'treatment_schedules',
        { id: scheduleId }
      );
      schedule = result || undefined;
    }

    return schedule;
  }

  /**
   * الحصول على جميع الجداول
   */
  async getSchedules(filter?: ScheduleFilter): Promise<TreatmentSchedule[]> {
    // الحصول من الذاكرة
    let schedules = this.scheduleManager.getSchedules(filter);

    // إذا كانت قاعدة البيانات متاحة، دمج النتائج
    if (this.database) {
      const dbSchedules = await this.database.find<TreatmentSchedule>(
        'treatment_schedules',
        filter as any
      );
      
      // دمج النتائج (تجنب التكرار)
      const scheduleMap = new Map<string, TreatmentSchedule>();
      [...schedules, ...dbSchedules].forEach(s => scheduleMap.set(s.id, s));
      schedules = Array.from(scheduleMap.values());
    }

    return schedules;
  }

  /**
   * تحديث جدول
   */
  async updateSchedule(
    scheduleId: string,
    options: UpdateScheduleOptions
  ): Promise<TreatmentSchedule> {
    const schedule = this.scheduleManager.updateSchedule(scheduleId, options);

    // تحديث في قاعدة البيانات
    if (this.database) {
      await this.database.update('treatment_schedules', scheduleId, schedule);
    }

    return schedule;
  }

  /**
   * إلغاء جدول
   */
  async cancelSchedule(scheduleId: string): Promise<TreatmentSchedule> {
    const schedule = this.scheduleManager.cancelSchedule(scheduleId);

    // تحديث في قاعدة البيانات
    if (this.database) {
      await this.database.update('treatment_schedules', scheduleId, schedule);
    }

    return schedule;
  }

  /**
   * إيقاف جدول مؤقتاً
   */
  async pauseSchedule(scheduleId: string): Promise<TreatmentSchedule> {
    const schedule = this.scheduleManager.pauseSchedule(scheduleId);

    // تحديث في قاعدة البيانات
    if (this.database) {
      await this.database.update('treatment_schedules', scheduleId, schedule);
    }

    return schedule;
  }

  /**
   * استئناف جدول
   */
  async resumeSchedule(scheduleId: string): Promise<TreatmentSchedule> {
    const schedule = this.scheduleManager.resumeSchedule(scheduleId);

    // تحديث في قاعدة البيانات
    if (this.database) {
      await this.database.update('treatment_schedules', scheduleId, schedule);
    }

    return schedule;
  }

  /**
   * حذف جدول
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    const deleted = this.scheduleManager.deleteSchedule(scheduleId);

    // حذف من قاعدة البيانات
    if (deleted && this.database) {
      await this.database.delete('treatment_schedules', scheduleId);
    }

    return deleted;
  }

  // ==================== Dose Management ====================

  /**
   * الحصول على جرعة بالمعرف
   */
  getDose(scheduleId: string, doseId: string): ScheduledDose | undefined {
    return this.scheduleManager.getDose(scheduleId, doseId);
  }

  /**
   * إكمال جرعة
   */
  async completeDose(
    scheduleId: string,
    options: CompleteDoseOptions
  ): Promise<ScheduledDose> {
    const dose = this.scheduleManager.completeDose(scheduleId, options);

    // تحديث الجدول في قاعدة البيانات
    if (this.database) {
      const schedule = this.scheduleManager.getSchedule(scheduleId);
      if (schedule) {
        await this.database.update('treatment_schedules', scheduleId, schedule);
      }
    }

    return dose;
  }

  /**
   * تحديث حالة الجرعات المتأخرة
   */
  async updateOverdueDoses(): Promise<number> {
    const count = this.scheduleManager.updateOverdueDoses();

    // تحديث في قاعدة البيانات
    if (count > 0 && this.database) {
      const schedules = this.scheduleManager.getSchedules();
      for (const schedule of schedules) {
        await this.database.update('treatment_schedules', schedule.id, schedule);
      }
    }

    return count;
  }

  /**
   * الحصول على الجرعات القادمة
   */
  getUpcomingDoses(days: number = 7): ScheduledDose[] {
    return this.scheduleManager.getUpcomingDoses(days);
  }

  /**
   * الحصول على الجرعات المتأخرة
   */
  getOverdueDoses(): ScheduledDose[] {
    return this.scheduleManager.getOverdueDoses();
  }

  // ==================== Safety Period ====================

  /**
   * حساب معلومات فترة الأمان لخلية
   */
  async calculateSafetyPeriod(hiveId: string): Promise<SafetyPeriodInfo> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.calculateSafetyPeriod(schedules, hiveId);
  }

  /**
   * التحقق من إمكانية الحصاد
   */
  async canHarvest(
    hiveId: string,
    harvestDate?: Date
  ): Promise<SafetyPeriodCheckResult> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.canHarvest(schedules, hiveId, harvestDate);
  }

  /**
   * الحصول على تحذيرات فترة الأمان
   */
  async getSafetyWarnings(
    hiveId: string,
    warningDays: number = 7
  ): Promise<string[]> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.getSafetyWarnings(
      schedules,
      hiveId,
      warningDays
    );
  }

  /**
   * حساب تاريخ أقرب حصاد ممكن
   */
  async getEarliestHarvestDate(hiveId: string): Promise<Date> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.getEarliestHarvestDate(schedules, hiveId);
  }

  /**
   * التحقق من تعارض العلاجات مع الحصاد المخطط
   */
  async checkHarvestConflict(
    hiveId: string,
    plannedHarvestDate: Date
  ): Promise<{
    hasConflict: boolean;
    conflictingSchedules: TreatmentSchedule[];
    message: string;
  }> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.checkHarvestConflict(
      schedules,
      hiveId,
      plannedHarvestDate
    );
  }

  /**
   * اقتراح تاريخ بديل للحصاد
   */
  async suggestAlternativeHarvestDate(
    hiveId: string,
    preferredDate: Date
  ): Promise<{
    suggestedDate: Date;
    reason: string;
    daysDelay: number;
  }> {
    const schedules = await this.getSchedules({ hiveId });
    return SafetyPeriodCalculator.suggestAlternativeHarvestDate(
      schedules,
      hiveId,
      preferredDate
    );
  }

  // ==================== Cost Tracking ====================

  /**
   * حساب التكلفة الإجمالية لخلية
   */
  async calculateHiveCost(hiveId: string): Promise<HiveCostInfo> {
    const schedules = await this.getSchedules({ hiveId });
    return CostTracker.calculateHiveCost(schedules, hiveId);
  }

  /**
   * حساب التكلفة الإجمالية لجميع الخلايا
   */
  async calculateTotalCost(): Promise<number> {
    const schedules = await this.getSchedules();
    return CostTracker.calculateTotalCost(schedules);
  }

  /**
   * الحصول على إحصائيات التكاليف
   */
  async getCostStatistics(from?: Date, to?: Date): Promise<CostStatistics> {
    const schedules = await this.getSchedules();
    return CostTracker.getStatistics(schedules, from, to);
  }

  /**
   * مقارنة التكاليف بين خليتين
   */
  async compareHiveCosts(
    hiveId1: string,
    hiveId2: string
  ): Promise<{
    hive1: HiveCostInfo;
    hive2: HiveCostInfo;
    difference: number;
    percentageDifference: number;
  }> {
    const schedules = await this.getSchedules();
    return CostTracker.compareHiveCosts(schedules, hiveId1, hiveId2);
  }

  /**
   * الحصول على أغلى الخلايا
   */
  async getMostExpensiveHives(limit: number = 10): Promise<HiveCostInfo[]> {
    const schedules = await this.getSchedules();
    return CostTracker.getMostExpensiveHives(schedules, limit);
  }

  /**
   * تصدير تقرير التكاليف
   */
  async exportCostReport(format: 'json' | 'csv' = 'json'): Promise<string> {
    const schedules = await this.getSchedules();
    return CostTracker.exportCostReport(schedules, format);
  }

  // ==================== Statistics ====================

  /**
   * الحصول على إحصائيات الجداول
   */
  async getStatistics(hiveId?: string): Promise<ScheduleStatistics> {
    const schedules = await this.getSchedules(hiveId ? { hiveId } : undefined);
    return this.scheduleManager.getStatistics(hiveId);
  }

  // ==================== Utility ====================

  /**
   * مسح جميع الجداول (للاختبار فقط)
   */
  clear(): void {
    this.scheduleManager.clear();
  }
}
