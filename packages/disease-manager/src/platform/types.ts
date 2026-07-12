/**
 * Platform Adapter Types
 * تعريفات الأنواع لمحولات المنصات
 */

/**
 * أنواع المنصات المدعومة
 */
export type PlatformType = 'web' | 'react-native' | 'electron';

/**
 * واجهة محول التخزين
 */
export interface StorageAdapter {
  /**
   * حفظ قيمة
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * استرجاع قيمة
   */
  getItem(key: string): Promise<string | null>;

  /**
   * حذف قيمة
   */
  removeItem(key: string): Promise<void>;

  /**
   * مسح جميع القيم
   */
  clear(): Promise<void>;

  /**
   * الحصول على جميع المفاتيح
   */
  getAllKeys(): Promise<string[]>;
}

/**
 * تكوين الإشعار
 */
export interface NotificationConfig {
  /**
   * عنوان الإشعار
   */
  title: string;

  /**
   * محتوى الإشعار
   */
  body: string;

  /**
   * وقت الجدولة (اختياري)
   */
  scheduledTime?: Date;

  /**
   * بيانات إضافية
   */
  data?: Record<string, any>;

  /**
   * أولوية الإشعار
   */
  priority?: 'low' | 'default' | 'high';
}

/**
 * إشعار مجدول
 */
export interface ScheduledNotification {
  /**
   * معرف الإشعار
   */
  id: string;

  /**
   * تكوين الإشعار
   */
  config: NotificationConfig;

  /**
   * وقت الجدولة
   */
  scheduledTime: Date;
}

/**
 * واجهة محول الإشعارات
 */
export interface NotificationAdapter {
  /**
   * طلب إذن الإشعارات
   */
  requestPermission(): Promise<boolean>;

  /**
   * جدولة إشعار
   */
  scheduleNotification(notification: NotificationConfig): Promise<string>;

  /**
   * إلغاء إشعار
   */
  cancelNotification(id: string): Promise<void>;

  /**
   * الحصول على الإشعارات المجدولة
   */
  getScheduledNotifications(): Promise<ScheduledNotification[]>;
}

/**
 * خيارات الكاميرا
 */
export interface CameraOptions {
  /**
   * جودة الصورة (0-1)
   */
  quality?: number;

  /**
   * أقصى عرض
   */
  maxWidth?: number;

  /**
   * أقصى ارتفاع
   */
  maxHeight?: number;
}

/**
 * خيارات اختيار الصورة
 */
export interface PickerOptions extends CameraOptions {
  /**
   * السماح باختيار متعدد
   */
  allowMultiple?: boolean;

  /**
   * نوع الوسائط
   */
  mediaType?: 'photo' | 'video' | 'mixed';
}

/**
 * بيانات الصورة
 */
export interface ImageData {
  /**
   * البيانات (Blob, Buffer, أو Base64)
   */
  data: Blob | Buffer | string;

  /**
   * صيغة الصورة
   */
  format: 'jpeg' | 'png' | 'webp';

  /**
   * العرض
   */
  width: number;

  /**
   * الارتفاع
   */
  height: number;

  /**
   * بيانات وصفية
   */
  metadata?: ImageMetadata;
}

/**
 * البيانات الوصفية للصورة
 */
export interface ImageMetadata {
  /**
   * تاريخ الالتقاط
   */
  captureDate?: Date;

  /**
   * الموقع الجغرافي
   */
  location?: GeoLocation;

  /**
   * معلومات الجهاز
   */
  deviceInfo?: string;
}

/**
 * الموقع الجغرافي
 */
export interface GeoLocation {
  /**
   * خط العرض
   */
  latitude: number;

  /**
   * خط الطول
   */
  longitude: number;

  /**
   * الدقة (بالأمتار)
   */
  accuracy?: number;
}

/**
 * واجهة محول الكاميرا
 */
export interface CameraAdapter {
  /**
   * التحقق من توفر الكاميرا
   */
  isAvailable(): boolean;

  /**
   * طلب إذن الكاميرا
   */
  requestPermission(): Promise<boolean>;

  /**
   * التقاط صورة
   */
  captureImage(options?: CameraOptions): Promise<ImageData>;

  /**
   * اختيار صورة من المعرض
   */
  pickImage(options?: PickerOptions): Promise<ImageData>;
}

/**
 * واجهة محول نظام الملفات
 */
export interface FileSystemAdapter {
  /**
   * قراءة ملف
   */
  readFile(path: string): Promise<Buffer | string>;

  /**
   * كتابة ملف
   */
  writeFile(path: string, data: Buffer | string): Promise<void>;

  /**
   * حذف ملف
   */
  deleteFile(path: string): Promise<void>;

  /**
   * التحقق من وجود ملف
   */
  exists(path: string): Promise<boolean>;

  /**
   * إنشاء مجلد
   */
  createDirectory(path: string): Promise<void>;

  /**
   * قائمة محتويات مجلد
   */
  listDirectory(path: string): Promise<string[]>;
}

/**
 * واجهة محول المنصة الرئيسية
 */
export interface PlatformAdapter {
  /**
   * الحصول على نوع المنصة
   */
  getPlatformType(): PlatformType;

  /**
   * الحصول على محول التخزين
   */
  getStorageAdapter(): StorageAdapter;

  /**
   * الحصول على محول الإشعارات
   */
  getNotificationAdapter(): NotificationAdapter;

  /**
   * الحصول على محول الكاميرا
   */
  getCameraAdapter(): CameraAdapter;

  /**
   * الحصول على محول نظام الملفات
   */
  getFileSystemAdapter(): FileSystemAdapter;
}
