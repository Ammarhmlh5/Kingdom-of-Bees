/**
 * Sync System Types
 * أنواع نظام المزامنة
 */

/**
 * Operation Type
 * نوع العملية
 */
export type OperationType = 'create' | 'update' | 'delete';

/**
 * Entity Type
 * نوع الكيان
 */
export type EntityType =
  | 'disease'
  | 'treatment'
  | 'diagnosis'
  | 'schedule'
  | 'alert'
  | 'hive_record'
  | 'inspection'
  | 'harvest';

/**
 * Operation Status
 * حالة العملية
 */
export type OperationStatus = 'pending' | 'syncing' | 'completed' | 'failed';

/**
 * Operation
 * عملية معلقة للمزامنة
 */
export interface Operation {
  /** معرف فريد للعملية */
  id: string;

  /** نوع العملية */
  type: OperationType;

  /** نوع الكيان */
  entityType: EntityType;

  /** معرف الكيان */
  entityId: string;

  /** البيانات */
  data: any;

  /** الحالة */
  status: OperationStatus;

  /** تاريخ الإنشاء */
  createdAt: Date;

  /** تاريخ آخر محاولة */
  lastAttemptAt?: Date;

  /** عدد المحاولات */
  attempts: number;

  /** رسالة الخطأ (إن وجدت) */
  error?: string;

  /** معلومات إضافية */
  metadata?: Record<string, any>;
}

/**
 * Operation Input
 * بيانات إنشاء عملية جديدة
 */
export interface OperationInput {
  type: OperationType;
  entityType: EntityType;
  entityId: string;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Sync Status
 * حالة المزامنة
 */
export type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * Sync Result
 * نتيجة المزامنة
 */
export interface SyncResult {
  /** نجحت المزامنة؟ */
  success: boolean;

  /** عدد العمليات المزامنة */
  syncedCount: number;

  /** عدد العمليات الفاشلة */
  failedCount: number;

  /** العمليات الفاشلة */
  failedOperations: Operation[];

  /** رسالة */
  message?: string;
}

/**
 * Conflict Resolution Strategy
 * استراتيجية حل التعارضات
 */
export type ConflictResolutionStrategy =
  | 'local_wins' // النسخة المحلية تفوز
  | 'remote_wins' // النسخة البعيدة تفوز
  | 'latest_wins' // آخر تحديث يفوز
  | 'manual'; // يدوي (يتطلب تدخل المستخدم)

/**
 * Conflict
 * تعارض في البيانات
 */
export interface Conflict {
  /** معرف فريد للتعارض */
  id: string;

  /** نوع الكيان */
  entityType: EntityType;

  /** معرف الكيان */
  entityId: string;

  /** البيانات المحلية */
  localData: any;

  /** البيانات البعيدة */
  remoteData: any;

  /** تاريخ التعديل المحلي */
  localModifiedAt: Date;

  /** تاريخ التعديل البعيد */
  remoteModifiedAt: Date;

  /** تاريخ اكتشاف التعارض */
  detectedAt: Date;

  /** الاستراتيجية المستخدمة */
  strategy?: ConflictResolutionStrategy;

  /** تم الحل؟ */
  resolved: boolean;

  /** البيانات المحلولة */
  resolvedData?: any;
}

/**
 * Sync Configuration
 * تكوين المزامنة
 */
export interface SyncConfig {
  /** تفعيل المزامنة التلقائية */
  autoSync: boolean;

  /** فترة المزامنة التلقائية (بالدقائق) */
  autoSyncInterval: number;

  /** الحد الأقصى لعدد المحاولات */
  maxRetries: number;

  /** فترة الانتظار بين المحاولات (بالثواني) */
  retryDelay: number;

  /** استراتيجية حل التعارضات الافتراضية */
  defaultConflictStrategy: ConflictResolutionStrategy;

  /** المزامنة فقط عند الاتصال بالواي فاي */
  syncOnWifiOnly: boolean;
}

/**
 * Sync Statistics
 * إحصائيات المزامنة
 */
export interface SyncStatistics {
  /** آخر مزامنة ناجحة */
  lastSuccessfulSync?: Date;

  /** آخر محاولة مزامنة */
  lastSyncAttempt?: Date;

  /** إجمالي العمليات المزامنة */
  totalSynced: number;

  /** إجمالي العمليات الفاشلة */
  totalFailed: number;

  /** العمليات المعلقة */
  pendingOperations: number;

  /** التعارضات غير المحلولة */
  unresolvedConflicts: number;
}
