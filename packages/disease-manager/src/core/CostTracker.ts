/**
 * Cost Tracker
 * متتبع التكاليف
 */

import { TreatmentSchedule } from '../types/schedule';

/**
 * معلومات التكلفة لخلية
 */
export interface HiveCostInfo {
  /** معرف الخلية */
  hiveId: string;
  /** التكلفة الإجمالية */
  totalCost: number;
  /** عدد العلاجات */
  treatmentCount: number;
  /** العلاجات */
  schedules: TreatmentSchedule[];
  /** العملة */
  currency: string;
}

/**
 * معلومات التكلفة لعلاج
 */
export interface TreatmentCostInfo {
  /** معرف العلاج */
  treatmentId: string;
  /** اسم العلاج */
  treatmentName: string;
  /** التكلفة الإجمالية */
  totalCost: number;
  /** عدد الاستخدامات */
  usageCount: number;
  /** متوسط التكلفة لكل استخدام */
  averageCostPerUse: number;
}

/**
 * إحصائيات التكاليف
 */
export interface CostStatistics {
  /** التكلفة الإجمالية */
  totalCost: number;
  /** متوسط التكلفة لكل خلية */
  averageCostPerHive: number;
  /** متوسط التكلفة لكل علاج */
  averageCostPerTreatment: number;
  /** أغلى علاج */
  mostExpensiveTreatment?: TreatmentCostInfo;
  /** أرخص علاج */
  leastExpensiveTreatment?: TreatmentCostInfo;
  /** العملة */
  currency: string;
  /** الفترة الزمنية */
  period?: {
    from: Date;
    to: Date;
  };
}

/**
 * متتبع التكاليف
 */
export class CostTracker {
  /**
   * حساب التكلفة الإجمالية لخلية
   */
  static calculateHiveCost(
    schedules: TreatmentSchedule[],
    hiveId: string
  ): HiveCostInfo {
    const hiveSchedules = schedules.filter(s => s.hiveId === hiveId);

    const totalCost = hiveSchedules.reduce(
      (sum, schedule) => sum + schedule.totalCost,
      0
    );

    // الحصول على العملة من أول علاج
    const currency =
      hiveSchedules.length > 0
        ? hiveSchedules[0].treatment.cost?.currency || 'USD'
        : 'USD';

    return {
      hiveId,
      totalCost,
      treatmentCount: hiveSchedules.length,
      schedules: hiveSchedules,
      currency,
    };
  }

  /**
   * حساب التكلفة الإجمالية لجميع الخلايا
   */
  static calculateTotalCost(schedules: TreatmentSchedule[]): number {
    return schedules.reduce((sum, schedule) => sum + schedule.totalCost, 0);
  }

  /**
   * حساب التكلفة حسب العلاج
   */
  static calculateCostByTreatment(
    schedules: TreatmentSchedule[]
  ): TreatmentCostInfo[] {
    const treatmentMap = new Map<string, TreatmentCostInfo>();

    schedules.forEach(schedule => {
      const existing = treatmentMap.get(schedule.treatmentId);

      if (existing) {
        existing.totalCost += schedule.totalCost;
        existing.usageCount += 1;
        existing.averageCostPerUse = existing.totalCost / existing.usageCount;
      } else {
        treatmentMap.set(schedule.treatmentId, {
          treatmentId: schedule.treatmentId,
          treatmentName: schedule.treatment.name.ar,
          totalCost: schedule.totalCost,
          usageCount: 1,
          averageCostPerUse: schedule.totalCost,
        });
      }
    });

    return Array.from(treatmentMap.values());
  }

  /**
   * حساب التكلفة حسب الفترة الزمنية
   */
  static calculateCostByPeriod(
    schedules: TreatmentSchedule[],
    from: Date,
    to: Date
  ): number {
    const filteredSchedules = schedules.filter(
      s => s.startDate >= from && s.startDate <= to
    );

    return this.calculateTotalCost(filteredSchedules);
  }

  /**
   * الحصول على إحصائيات التكاليف
   */
  static getStatistics(
    schedules: TreatmentSchedule[],
    from?: Date,
    to?: Date
  ): CostStatistics {
    let filteredSchedules = schedules;

    if (from && to) {
      filteredSchedules = schedules.filter(
        s => s.startDate >= from && s.startDate <= to
      );
    }

    const totalCost = this.calculateTotalCost(filteredSchedules);

    // حساب عدد الخلايا الفريدة
    const uniqueHives = new Set(filteredSchedules.map(s => s.hiveId));
    const hiveCount = uniqueHives.size;

    const averageCostPerHive = hiveCount > 0 ? totalCost / hiveCount : 0;
    const averageCostPerTreatment =
      filteredSchedules.length > 0 ? totalCost / filteredSchedules.length : 0;

    // إيجاد أغلى وأرخص علاج
    const treatmentCosts = this.calculateCostByTreatment(filteredSchedules);
    treatmentCosts.sort((a, b) => b.totalCost - a.totalCost);

    const mostExpensiveTreatment =
      treatmentCosts.length > 0 ? treatmentCosts[0] : undefined;
    const leastExpensiveTreatment =
      treatmentCosts.length > 0
        ? treatmentCosts[treatmentCosts.length - 1]
        : undefined;

    // الحصول على العملة
    const currency =
      filteredSchedules.length > 0
        ? filteredSchedules[0].treatment.cost?.currency || 'USD'
        : 'USD';

    return {
      totalCost,
      averageCostPerHive,
      averageCostPerTreatment,
      mostExpensiveTreatment,
      leastExpensiveTreatment,
      currency,
      period: from && to ? { from, to } : undefined,
    };
  }

  /**
   * مقارنة التكاليف بين خليتين
   */
  static compareHiveCosts(
    schedules: TreatmentSchedule[],
    hiveId1: string,
    hiveId2: string
  ): {
    hive1: HiveCostInfo;
    hive2: HiveCostInfo;
    difference: number;
    percentageDifference: number;
  } {
    const hive1 = this.calculateHiveCost(schedules, hiveId1);
    const hive2 = this.calculateHiveCost(schedules, hiveId2);

    const difference = hive1.totalCost - hive2.totalCost;
    const percentageDifference =
      hive2.totalCost > 0
        ? ((difference / hive2.totalCost) * 100)
        : 0;

    return {
      hive1,
      hive2,
      difference,
      percentageDifference,
    };
  }

  /**
   * الحصول على أغلى الخلايا
   */
  static getMostExpensiveHives(
    schedules: TreatmentSchedule[],
    limit: number = 10
  ): HiveCostInfo[] {
    const uniqueHives = new Set(schedules.map(s => s.hiveId));
    const hiveCosts: HiveCostInfo[] = [];

    uniqueHives.forEach(hiveId => {
      hiveCosts.push(this.calculateHiveCost(schedules, hiveId));
    });

    // ترتيب حسب التكلفة (من الأعلى إلى الأقل)
    hiveCosts.sort((a, b) => b.totalCost - a.totalCost);

    return hiveCosts.slice(0, limit);
  }

  /**
   * حساب التكلفة المتوقعة لعلاج
   */
  static estimateTreatmentCost(
    treatmentId: string,
    numberOfDoses: number,
    costPerDose: number
  ): number {
    return numberOfDoses * costPerDose;
  }

  /**
   * تصدير تقرير التكاليف
   */
  static exportCostReport(
    schedules: TreatmentSchedule[],
    format: 'json' | 'csv' = 'json'
  ): string {
    const statistics = this.getStatistics(schedules);
    const treatmentCosts = this.calculateCostByTreatment(schedules);

    if (format === 'json') {
      return JSON.stringify(
        {
          statistics,
          treatmentCosts,
          schedules: schedules.map(s => ({
            id: s.id,
            hiveId: s.hiveId,
            treatmentName: s.treatment.name.ar,
            startDate: s.startDate,
            totalCost: s.totalCost,
            status: s.status,
          })),
        },
        null,
        2
      );
    }

    // CSV format
    let csv = 'معرف الجدول,معرف الخلية,اسم العلاج,تاريخ البدء,التكلفة,الحالة\n';
    schedules.forEach(s => {
      csv += `${s.id},${s.hiveId},${s.treatment.name.ar},${s.startDate.toISOString()},${s.totalCost},${s.status}\n`;
    });

    return csv;
  }
}
