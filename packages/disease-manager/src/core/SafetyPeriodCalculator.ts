/**
 * Safety Period Calculator
 * حاسبة فترة الأمان قبل الحصاد
 */

import {
  TreatmentSchedule,
  SafetyPeriodInfo,
  SafetyPeriodCheckResult,
} from '../types/schedule';

/**
 * حاسبة فترة الأمان
 */
export class SafetyPeriodCalculator {
  /**
   * حساب معلومات فترة الأمان لخلية
   */
  static calculateSafetyPeriod(
    schedules: TreatmentSchedule[],
    hiveId: string
  ): SafetyPeriodInfo {
    // فلترة الجداول النشطة للخلية المحددة
    const activeSchedules = schedules.filter(
      s => s.hiveId === hiveId && s.status === 'active'
    );

    if (activeSchedules.length === 0) {
      return {
        isActive: false,
        endDate: new Date(),
        daysRemaining: 0,
        activeSchedules: [],
      };
    }

    // إيجاد أبعد تاريخ لانتهاء فترة الأمان
    const now = new Date();
    let latestEndDate = new Date(0); // تاريخ قديم جداً

    activeSchedules.forEach(schedule => {
      if (schedule.safetyPeriodEndDate > latestEndDate) {
        latestEndDate = schedule.safetyPeriodEndDate;
      }
    });

    // حساب الأيام المتبقية
    const daysRemaining = Math.max(
      0,
      Math.ceil((latestEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      isActive: latestEndDate > now,
      endDate: latestEndDate,
      daysRemaining,
      activeSchedules: activeSchedules.filter(
        s => s.safetyPeriodEndDate > now
      ),
    };
  }

  /**
   * التحقق من إمكانية الحصاد
   */
  static canHarvest(
    schedules: TreatmentSchedule[],
    hiveId: string,
    harvestDate?: Date
  ): SafetyPeriodCheckResult {
    const checkDate = harvestDate || new Date();
    const safetyPeriodInfo = this.calculateSafetyPeriod(schedules, hiveId);

    if (!safetyPeriodInfo.isActive) {
      return {
        canHarvest: true,
        message: 'يمكن الحصاد - لا توجد فترة أمان نشطة',
      };
    }

    if (checkDate < safetyPeriodInfo.endDate) {
      const treatmentNames = safetyPeriodInfo.activeSchedules
        .map(s => s.treatment.name.ar)
        .join('، ');

      return {
        canHarvest: false,
        message: `لا يمكن الحصاد - فترة الأمان نشطة حتى ${safetyPeriodInfo.endDate.toLocaleDateString('ar-EG')} (${safetyPeriodInfo.daysRemaining} يوم متبقي). العلاجات النشطة: ${treatmentNames}`,
        safetyPeriodInfo,
      };
    }

    return {
      canHarvest: true,
      message: 'يمكن الحصاد - انتهت فترة الأمان',
    };
  }

  /**
   * الحصول على تحذيرات فترة الأمان
   */
  static getSafetyWarnings(
    schedules: TreatmentSchedule[],
    hiveId: string,
    warningDays: number = 7
  ): string[] {
    const safetyPeriodInfo = this.calculateSafetyPeriod(schedules, hiveId);
    const warnings: string[] = [];

    if (!safetyPeriodInfo.isActive) {
      return warnings;
    }

    // تحذير إذا كانت فترة الأمان نشطة
    if (safetyPeriodInfo.daysRemaining > 0) {
      warnings.push(
        `⚠️ فترة الأمان نشطة - لا يمكن الحصاد حتى ${safetyPeriodInfo.endDate.toLocaleDateString('ar-EG')}`
      );
    }

    // تحذير إذا كانت فترة الأمان ستنتهي قريباً
    if (
      safetyPeriodInfo.daysRemaining > 0 &&
      safetyPeriodInfo.daysRemaining <= warningDays
    ) {
      warnings.push(
        `⏰ ستنتهي فترة الأمان خلال ${safetyPeriodInfo.daysRemaining} يوم`
      );
    }

    // تحذير لكل علاج نشط
    safetyPeriodInfo.activeSchedules.forEach(schedule => {
      const daysUntilEnd = Math.ceil(
        (schedule.safetyPeriodEndDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilEnd > 0) {
        warnings.push(
          `📋 ${schedule.treatment.name.ar}: فترة أمان ${schedule.safetyPeriodDays} يوم (متبقي ${daysUntilEnd} يوم)`
        );
      }
    });

    return warnings;
  }

  /**
   * حساب تاريخ أقرب حصاد ممكن
   */
  static getEarliestHarvestDate(
    schedules: TreatmentSchedule[],
    hiveId: string
  ): Date {
    const safetyPeriodInfo = this.calculateSafetyPeriod(schedules, hiveId);

    if (!safetyPeriodInfo.isActive) {
      return new Date(); // يمكن الحصاد الآن
    }

    return safetyPeriodInfo.endDate;
  }

  /**
   * التحقق من تعارض العلاجات مع الحصاد المخطط
   */
  static checkHarvestConflict(
    schedules: TreatmentSchedule[],
    hiveId: string,
    plannedHarvestDate: Date
  ): {
    hasConflict: boolean;
    conflictingSchedules: TreatmentSchedule[];
    message: string;
  } {
    const safetyPeriodInfo = this.calculateSafetyPeriod(schedules, hiveId);

    if (!safetyPeriodInfo.isActive) {
      return {
        hasConflict: false,
        conflictingSchedules: [],
        message: 'لا يوجد تعارض - لا توجد فترة أمان نشطة',
      };
    }

    if (plannedHarvestDate < safetyPeriodInfo.endDate) {
      const conflictingSchedules = safetyPeriodInfo.activeSchedules.filter(
        s => plannedHarvestDate < s.safetyPeriodEndDate
      );

      const treatmentNames = conflictingSchedules
        .map(s => s.treatment.name.ar)
        .join('، ');

      return {
        hasConflict: true,
        conflictingSchedules,
        message: `⚠️ تعارض: تاريخ الحصاد المخطط (${plannedHarvestDate.toLocaleDateString('ar-EG')}) يقع ضمن فترة الأمان. العلاجات المتعارضة: ${treatmentNames}. يجب الانتظار حتى ${safetyPeriodInfo.endDate.toLocaleDateString('ar-EG')}`,
      };
    }

    return {
      hasConflict: false,
      conflictingSchedules: [],
      message: 'لا يوجد تعارض - تاريخ الحصاد بعد انتهاء فترة الأمان',
    };
  }

  /**
   * اقتراح تاريخ بديل للحصاد
   */
  static suggestAlternativeHarvestDate(
    schedules: TreatmentSchedule[],
    hiveId: string,
    preferredDate: Date
  ): {
    suggestedDate: Date;
    reason: string;
    daysDelay: number;
  } {
    const safetyPeriodInfo = this.calculateSafetyPeriod(schedules, hiveId);

    if (!safetyPeriodInfo.isActive || preferredDate >= safetyPeriodInfo.endDate) {
      return {
        suggestedDate: preferredDate,
        reason: 'التاريخ المفضل مناسب',
        daysDelay: 0,
      };
    }

    // اقتراح اليوم التالي لانتهاء فترة الأمان
    const suggestedDate = new Date(safetyPeriodInfo.endDate);
    suggestedDate.setDate(suggestedDate.getDate() + 1);

    const daysDelay = Math.ceil(
      (suggestedDate.getTime() - preferredDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      suggestedDate,
      reason: `التاريخ المفضل يقع ضمن فترة الأمان. يُقترح التأجيل ${daysDelay} يوم`,
      daysDelay,
    };
  }
}
