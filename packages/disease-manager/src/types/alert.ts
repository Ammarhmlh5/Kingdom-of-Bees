/**
 * Alert System Types
 * أنواع نظام التنبيهات
 */

import { LocalizedString } from '../i18n/types';

/**
 * Alert Type
 * نوع التنبيه
 */
export type AlertType =
  | 'inspection_reminder' // تذكير بالفحص
  | 'treatment_reminder' // تذكير بالعلاج
  | 'disease_outbreak' // تفشي مرض
  | 'weather_warning' // تحذير طقس
  | 'emergency' // حالة طوارئ
  | 'inventory_low' // مخزون منخفض
  | 'expiry_warning' // تحذير انتهاء صلاحية
  | 'safety_period' // فترة أمان
  | 'harvest_ready' // جاهز للحصاد
  | 'custom'; // تنبيه مخصص

/**
 * Alert Priority
 * أولوية التنبيه
 */
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert Status
 * حالة التنبيه
 */
export type AlertStatus = 'pending' | 'sent' | 'dismissed' | 'expired';

/**
 * Entity Reference
 * مرجع الكيان المرتبط بالتنبيه
 */
export interface EntityReference {
  type: 'hive' | 'treatment' | 'disease' | 'inspection' | 'inventory';
  id: string;
}

/**
 * Alert Action
 * إجراء يمكن تنفيذه من التنبيه
 */
export interface AlertAction {
  label: LocalizedString;
  action: string; // Action identifier
  params?: Record<string, any>;
}

/**
 * Alert
 * تنبيه
 */
export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: LocalizedString;
  message: LocalizedString;
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  relatedEntity?: EntityReference;
  actions?: AlertAction[];
  status: AlertStatus;
  metadata?: Record<string, any>;
}

/**
 * Alert Input
 * بيانات إنشاء تنبيه جديد
 */
export interface AlertInput {
  type: AlertType;
  priority: AlertPriority;
  title: LocalizedString;
  message: LocalizedString;
  scheduledFor?: Date;
  expiresAt?: Date;
  relatedEntity?: EntityReference;
  actions?: AlertAction[];
  metadata?: Record<string, any>;
}

/**
 * Alert Filter
 * فلتر التنبيهات
 */
export interface AlertFilter {
  types?: AlertType[];
  priorities?: AlertPriority[];
  statuses?: AlertStatus[];
  fromDate?: Date;
  toDate?: Date;
  relatedEntityType?: EntityReference['type'];
  relatedEntityId?: string;
}

/**
 * Notification Channel
 * قناة الإشعارات
 */
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

/**
 * Time Range
 * نطاق زمني (للساعات الهادئة)
 */
export interface TimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

/**
 * Alert Settings
 * إعدادات التنبيهات
 */
export interface AlertSettings {
  enabledTypes: AlertType[];
  quietHours?: TimeRange;
  notificationChannels: NotificationChannel[];
  priorityThreshold?: AlertPriority;
  autoExpireAfterDays?: number;
}

/**
 * Recurring Alert Config
 * تكوين تنبيه متكرر
 */
export interface RecurringAlertConfig {
  id: string;
  type: AlertType;
  schedule: SimpleSchedule;
  template: AlertTemplate;
  enabled: boolean;
  relatedEntity?: EntityReference;
}

/**
 * Simple Schedule
 * جدول بسيط للتنبيهات المتكررة
 */
export interface SimpleSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
}

/**
 * Alert Template
 * قالب تنبيه
 */
export interface AlertTemplate {
  title: LocalizedString;
  message: LocalizedString;
  priority: AlertPriority;
  actions?: AlertAction[];
}

/**
 * Alert Statistics
 * إحصائيات التنبيهات
 */
export interface AlertStatistics {
  total: number;
  pending: number;
  sent: number;
  dismissed: number;
  expired: number;
  byType: Record<AlertType, number>;
  byPriority: Record<AlertPriority, number>;
}
