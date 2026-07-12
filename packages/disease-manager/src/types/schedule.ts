/**
 * Treatment Schedule Types
 * أنواع جدولة العلاجات
 */

import { Treatment } from './treatment';

/**
 * حالة الجرعة
 */
export type DoseStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

/**
 * حالة الجدول
 */
export type ScheduleStatus = 'active' | 'completed' | 'cancelled' | 'paused';

/**
 * جرعة مجدولة
 */
export interface ScheduledDose {
  /** معرف الجرعة */
  id: string;
  
  /** معرف الجدول */
  scheduleId: string;
  
  /** رقم الجرعة */
  doseNumber: number;
  
  /** تاريخ الجرعة المجدولة */
  scheduledDate: Date;
  
  /** تاريخ الإكمال الفعلي */
  completedDate?: Date;
  
  /** الحالة */
  status: DoseStatus;
  
  /** ملاحظات */
  notes?: string;
  
  /** معرف المستخدم الذي أكمل الجرعة */
  completedBy?: string;
}

/**
 * جدول علاج
 */
export interface TreatmentSchedule {
  /** معرف الجدول */
  id: string;
  
  /** معرف الخلية */
  hiveId: string;
  
  /** معرف العلاج */
  treatmentId: string;
  
  /** بيانات العلاج */
  treatment: Treatment;
  
  /** تاريخ البدء */
  startDate: Date;
  
  /** تاريخ الانتهاء المتوقع */
  expectedEndDate: Date;
  
  /** تاريخ الانتهاء الفعلي */
  actualEndDate?: Date;
  
  /** الحالة */
  status: ScheduleStatus;
  
  /** الجرعات المجدولة */
  doses: ScheduledDose[];
  
  /** فترة الأمان (بالأيام) */
  safetyPeriodDays: number;
  
  /** تاريخ انتهاء فترة الأمان */
  safetyPeriodEndDate: Date;
  
  /** التكلفة الإجمالية */
  totalCost: number;
  
  /** ملاحظات */
  notes?: string;
  
  /** معرف المستخدم الذي أنشأ الجدول */
  createdBy: string;
  
  /** تاريخ الإنشاء */
  createdAt: Date;
  
  /** تاريخ آخر تحديث */
  updatedAt: Date;
}

/**
 * معلومات فترة الأمان
 */
export interface SafetyPeriodInfo {
  /** هل فترة الأمان نشطة */
  isActive: boolean;
  
  /** تاريخ انتهاء فترة الأمان */
  endDate: Date;
  
  /** عدد الأيام المتبقية */
  daysRemaining: number;
  
  /** الجداول النشطة التي تؤثر على فترة الأمان */
  activeSchedules: TreatmentSchedule[];
}

/**
 * إحصائيات الجدول
 */
export interface ScheduleStatistics {
  /** إجمالي الجداول */
  totalSchedules: number;
  
  /** الجداول النشطة */
  activeSchedules: number;
  
  /** الجداول المكتملة */
  completedSchedules: number;
  
  /** الجداول الملغاة */
  cancelledSchedules: number;
  
  /** إجمالي الجرعات */
  totalDoses: number;
  
  /** الجرعات المكتملة */
  completedDoses: number;
  
  /** الجرعات المعلقة */
  pendingDoses: number;
  
  /** الجرعات المتأخرة */
  overdueDoses: number;
  
  /** التكلفة الإجمالية */
  totalCost: number;
  
  /** معدل الالتزام (%) */
  complianceRate: number;
}

/**
 * خيارات إنشاء جدول
 */
export interface CreateScheduleOptions {
  /** معرف الخلية */
  hiveId: string;
  
  /** معرف العلاج */
  treatmentId: string;
  
  /** تاريخ البدء */
  startDate: Date;
  
  /** عدد الجرعات (اختياري - يمكن حسابه من العلاج) */
  numberOfDoses?: number;
  
  /** الفترة بين الجرعات بالأيام (اختياري - يمكن حسابها من العلاج) */
  intervalDays?: number;
  
  /** ملاحظات */
  notes?: string;
  
  /** معرف المستخدم */
  userId: string;
}

/**
 * خيارات تحديث الجدول
 */
export interface UpdateScheduleOptions {
  /** الحالة الجديدة */
  status?: ScheduleStatus;
  
  /** ملاحظات */
  notes?: string;
  
  /** تاريخ الانتهاء الفعلي */
  actualEndDate?: Date;
}

/**
 * خيارات إكمال الجرعة
 */
export interface CompleteDoseOptions {
  /** معرف الجرعة */
  doseId: string;
  
  /** تاريخ الإكمال */
  completedDate?: Date;
  
  /** ملاحظات */
  notes?: string;
  
  /** معرف المستخدم */
  userId: string;
}

/**
 * خيارات الفلترة للجداول
 */
export interface ScheduleFilter {
  /** معرف الخلية */
  hiveId?: string;
  
  /** معرف العلاج */
  treatmentId?: string;
  
  /** الحالة */
  status?: ScheduleStatus;
  
  /** تاريخ البدء من */
  startDateFrom?: Date;
  
  /** تاريخ البدء إلى */
  startDateTo?: Date;
  
  /** فقط الجداول التي لديها جرعات متأخرة */
  hasOverdueDoses?: boolean;
  
  /** فقط الجداول التي لديها فترة أمان نشطة */
  hasActiveSafetyPeriod?: boolean;
}

/**
 * نتيجة التحقق من فترة الأمان
 */
export interface SafetyPeriodCheckResult {
  /** هل يمكن الحصاد */
  canHarvest: boolean;
  
  /** رسالة */
  message: string;
  
  /** معلومات فترة الأمان */
  safetyPeriodInfo?: SafetyPeriodInfo;
}
