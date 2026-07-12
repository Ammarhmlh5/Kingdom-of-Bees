/**
 * Disease Manager Core
 * الفئة الرئيسية لإدارة أمراض النحل
 * 
 * هذه الفئة تربط جميع المكونات معاً وتوفر واجهة موحدة للوصول إلى جميع الوظائف
 */

import { DatabaseAdapter } from '../database/types';
import { PlatformAdapter } from '../platform/types';
import { I18nManager } from '../i18n/I18nManager';
import { DiseaseService } from '../services/DiseaseService';
import { TreatmentService } from '../services/TreatmentService';
import { DiagnosisService } from '../services/DiagnosisService';
import { TreatmentSchedulerService } from '../services/TreatmentSchedulerService';
import { AlertService } from '../services/AlertService';
import { SyncService } from '../services/SyncService';
import { HiveRecordService } from '../services/HiveRecordService';
import { Disease, DiseaseCategory } from '../types/disease';
import { Treatment, TreatmentType } from '../types/treatment';
import { DiagnosisSession, DiagnosisResult } from '../types/diagnosis';
import { TreatmentSchedule, CreateScheduleOptions } from '../types/schedule';
import { Alert, AlertType, AlertPriority } from '../types/alert';
import { HiveRecord } from '../types/hive-record';
import { SyncStatus } from '../types/sync';

/**
 * تكوين Disease Manager
 */
export interface DiseaseManagerConfig {
  /** محول قاعدة البيانات */
  database: DatabaseAdapter;
  
  /** محول المنصة */
  platform: PlatformAdapter;
  
  /** اللغة الافتراضية */
  defaultLocale?: 'ar' | 'en' | 'fr';
  
  /** تفعيل المزامنة التلقائية */
  autoSync?: boolean;
  
  /** فترة المزامنة التلقائية (بالدقائق) */
  syncInterval?: number;
  
  /** تفعيل فاحص التنبيهات التلقائي */
  autoAlerts?: boolean;
  
  /** فترة فحص التنبيهات (بالدقائق) */
  alertCheckInterval?: number;
}

/**
 * حالة Disease Manager
 */
export interface DiseaseManagerState {
  /** هل تم التهيئة */
  initialized: boolean;
  
  /** هل في وضع الأوفلاين */
  isOffline: boolean;
  
  /** معرف المستخدم الحالي */
  userId?: string;
  
  /** اللغة الحالية */
  locale: 'ar' | 'en' | 'fr';
  
  /** حالة المزامنة */
  syncStatus: SyncStatus;
  
  /** آخر خطأ */
  lastError?: Error;
}

/**
 * الفئة الرئيسية لإدارة أمراض النحل
 * 
 * @example
 * ```typescript
 * const manager = new DiseaseManager({
 *   database: indexedDBAdapter,
 *   platform: webPlatformAdapter,
 *   defaultLocale: 'ar',
 *   autoSync: true,
 * });
 * 
 * await manager.initialize();
 * 
 * // استخدام الخدمات
 * const diseases = await manager.getDiseases({ category: 'brood' });
 * const result = await manager.startDiagnosis('hive-123');
 * ```
 */
export class DiseaseManager {
  private config: DiseaseManagerConfig;
  private state: DiseaseManagerState;
  
  // الخدمات
  private diseaseService: DiseaseService;
  private treatmentService: TreatmentService;
  private diagnosisService: DiagnosisService;
  private schedulerService: TreatmentSchedulerService;
  private alertService: AlertService;
  private syncService: SyncService;
  private hiveRecordService: HiveRecordService;
  
  // مدير الترجمة
  private i18nManager: I18nManager;
  
  // مستمعي تغييرات الحالة
  private stateListeners: Set<(state: DiseaseManagerState) => void> = new Set();
  
  constructor(config: DiseaseManagerConfig) {
    this.config = config;
    
    // تهيئة الحالة
    this.state = {
      initialized: false,
      isOffline: false,
      locale: config.defaultLocale || 'ar',
      syncStatus: 'idle',
    };
    
    // تهيئة مدير الترجمة
    this.i18nManager = new I18nManager(this.state.locale);
    
    // تهيئة الخدمات
    this.diseaseService = new DiseaseService();
    this.treatmentService = new TreatmentService();
    this.diagnosisService = new DiagnosisService(config.database);
    this.schedulerService = new TreatmentSchedulerService(config.database);
    this.alertService = new AlertService(config.database);
    this.syncService = new SyncService(config.database);
    this.hiveRecordService = new HiveRecordService(config.database);
  }
  
  /**
   * تهيئة Disease Manager
   */
  async initialize(): Promise<void> {
    try {
      // تهيئة قاعدة البيانات
      await this.config.database.connect();
      
      // تفعيل المزامنة التلقائية إذا كانت مفعلة
      if (this.config.autoSync) {
        this.syncService.enableAutoSync(this.config.syncInterval || 5);
      }
      
      // تفعيل فاحص التنبيهات التلقائي إذا كان مفعلاً
      if (this.config.autoAlerts) {
        this.alertService.startAlertChecker(this.config.alertCheckInterval || 5);
      }
      
      // تحديث الحالة
      this.updateState({ initialized: true });
    } catch (error) {
      this.updateState({ 
        lastError: error instanceof Error ? error : new Error(String(error)) 
      });
      throw error;
    }
  }
  
  /**
   * إيقاف Disease Manager
   */
  async shutdown(): Promise<void> {
    try {
      // إيقاف المزامنة التلقائية
      this.syncService.disableAutoSync();
      
      // إيقاف فاحص التنبيهات
      this.alertService.stopAlertChecker();
      
      // قطع الاتصال بقاعدة البيانات
      await this.config.database.disconnect();
      
      // تحديث الحالة
      this.updateState({ initialized: false });
    } catch (error) {
      this.updateState({ 
        lastError: error instanceof Error ? error : new Error(String(error)) 
      });
      throw error;
    }
  }
  
  // ==================== Disease Operations ====================
  
  /**
   * الحصول على قائمة الأمراض
   */
  async getDiseases(options?: {
    category?: DiseaseCategory;
    minSeverity?: number;
    search?: string;
  }): Promise<Disease[]> {
    return this.diseaseService.getDiseases(options);
  }
  
  /**
   * الحصول على مرض بالمعرف
   */
  async getDiseaseById(id: string): Promise<Disease | undefined> {
    return this.diseaseService.getDiseaseById(id);
  }
  
  /**
   * البحث في الأمراض
   */
  async searchDiseases(query: string, locale?: 'ar' | 'en' | 'fr'): Promise<Disease[]> {
    return this.diseaseService.searchDiseases(query, locale || this.state.locale);
  }
  
  // ==================== Treatment Operations ====================
  
  /**
   * الحصول على قائمة العلاجات
   */
  async getTreatments(options?: {
    type?: TreatmentType;
    diseaseId?: string;
    search?: string;
  }): Promise<Treatment[]> {
    return this.treatmentService.getTreatments(options);
  }
  
  /**
   * الحصول على علاج بالمعرف
   */
  async getTreatmentById(id: string): Promise<Treatment | undefined> {
    return this.treatmentService.getTreatmentById(id);
  }
  
  /**
   * البحث في العلاجات
   */
  async searchTreatments(query: string, locale?: 'ar' | 'en' | 'fr'): Promise<Treatment[]> {
    return this.treatmentService.searchTreatments(query, locale || this.state.locale);
  }
  
  // ==================== Diagnosis Operations ====================
  
  /**
   * بدء جلسة تشخيص جديدة
   */
  async startDiagnosis(hiveId: string, userId: string): Promise<DiagnosisSession> {
    return this.diagnosisService.startSession(hiveId, userId);
  }
  
  /**
   * تحليل الأعراض
   */
  async analyzeSymptoms(sessionId: string): Promise<DiagnosisResult> {
    return this.diagnosisService.analyze(sessionId);
  }
  
  /**
   * تحليل صورة (إذا كان متاحاً)
   */
  async analyzeImage(sessionId: string, imageUrl: string): Promise<void> {
    // TODO: تنفيذ تحليل الصور في Task 8
    throw new Error('Image analysis not yet implemented');
  }
  
  // ==================== Treatment Scheduler Operations ====================
  
  /**
   * جدولة علاج
   */
  async scheduleTreatment(options: CreateScheduleOptions): Promise<TreatmentSchedule> {
    return this.schedulerService.createSchedule(options);
  }
  
  /**
   * تحديث حالة العلاج
   */
  async updateTreatmentStatus(
    scheduleId: string,
    status: 'active' | 'paused' | 'completed' | 'cancelled'
  ): Promise<void> {
    const schedule = await this.schedulerService.getSchedule(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }
    
    switch (status) {
      case 'paused':
        await this.schedulerService.pauseSchedule(scheduleId);
        break;
      case 'active':
        await this.schedulerService.resumeSchedule(scheduleId);
        break;
      case 'completed':
        // يتم تحديث الحالة تلقائياً عند إكمال جميع الجرعات
        break;
      case 'cancelled':
        await this.schedulerService.cancelSchedule(scheduleId);
        break;
    }
  }
  
  // ==================== Hive Record Operations ====================
  
  /**
   * الحصول على سجل خلية
   */
  async getHiveRecord(hiveId: string): Promise<HiveRecord | null> {
    return this.hiveRecordService.getHiveRecord(hiveId);
  }
  
  /**
   * تحديث سجل خلية
   */
  async updateHiveRecord(hiveId: string, updates: Partial<HiveRecord>): Promise<void> {
    const record = await this.hiveRecordService.getHiveRecord(hiveId);
    if (!record) {
      throw new Error(`Hive record not found: ${hiveId}`);
    }
    
    // تحديث السجل في قاعدة البيانات
    await this.config.database.update('hive_records', hiveId, {
      ...record,
      ...updates,
      updatedAt: new Date(),
    });
  }
  
  // ==================== Alert Operations ====================
  
  /**
   * الحصول على التنبيهات
   */
  async getAlerts(options?: {
    type?: AlertType;
    priority?: AlertPriority;
    status?: 'pending' | 'sent' | 'dismissed' | 'expired';
  }): Promise<Alert[]> {
    return this.alertService.getAlerts(options);
  }
  
  /**
   * إلغاء تنبيه
   */
  async dismissAlert(alertId: string): Promise<void> {
    return this.alertService.dismissAlert(alertId);
  }
  
  // ==================== Sync Operations ====================
  
  /**
   * مزامنة البيانات
   */
  async sync(): Promise<void> {
    this.updateState({ syncStatus: 'syncing' });
    
    try {
      await this.syncService.sync();
      this.updateState({ syncStatus: 'synced', isOffline: false });
    } catch (error) {
      this.updateState({ 
        syncStatus: 'error',
        isOffline: true,
        lastError: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }
  
  /**
   * الحصول على حالة المزامنة
   */
  getSyncStatus(): SyncStatus {
    return this.state.syncStatus;
  }
  
  // ==================== State Management ====================
  
  /**
   * الحصول على الحالة الحالية
   */
  getState(): DiseaseManagerState {
    return { ...this.state };
  }
  
  /**
   * تحديث الحالة
   */
  private updateState(updates: Partial<DiseaseManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateListeners();
  }
  
  /**
   * الاستماع لتغييرات الحالة
   */
  onStateChange(listener: (state: DiseaseManagerState) => void): () => void {
    this.stateListeners.add(listener);
    
    // إرجاع دالة لإلغاء الاستماع
    return () => {
      this.stateListeners.delete(listener);
    };
  }
  
  /**
   * إشعار المستمعين بتغيير الحالة
   */
  private notifyStateListeners(): void {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
  
  // ==================== I18n Operations ====================
  
  /**
   * تغيير اللغة
   */
  setLocale(locale: 'ar' | 'en' | 'fr'): void {
    this.i18nManager.setLocale(locale);
    this.updateState({ locale });
  }
  
  /**
   * الحصول على اللغة الحالية
   */
  getLocale(): 'ar' | 'en' | 'fr' {
    return this.state.locale;
  }
  
  /**
   * ترجمة نص
   */
  translate(key: string, params?: Record<string, string | number>): string {
    return this.i18nManager.translate(key, params);
  }
  
  // ==================== User Management ====================
  
  /**
   * تعيين معرف المستخدم الحالي
   */
  setUserId(userId: string): void {
    this.updateState({ userId });
  }
  
  /**
   * الحصول على معرف المستخدم الحالي
   */
  getUserId(): string | undefined {
    return this.state.userId;
  }
  
  // ==================== Offline Mode ====================
  
  /**
   * تبديل وضع الأوفلاين
   */
  toggleOfflineMode(isOffline: boolean): void {
    this.updateState({ isOffline });
    
    if (isOffline) {
      // إيقاف المزامنة التلقائية
      this.syncService.disableAutoSync();
    } else {
      // تفعيل المزامنة التلقائية إذا كانت مفعلة في التكوين
      if (this.config.autoSync) {
        this.syncService.enableAutoSync(this.config.syncInterval || 5);
      }
    }
  }
  
  /**
   * هل في وضع الأوفلاين
   */
  isOffline(): boolean {
    return this.state.isOffline;
  }
  
  // ==================== Service Access ====================
  
  /**
   * الوصول إلى خدمة الأمراض
   */
  get diseases(): DiseaseService {
    return this.diseaseService;
  }
  
  /**
   * الوصول إلى خدمة العلاجات
   */
  get treatments(): TreatmentService {
    return this.treatmentService;
  }
  
  /**
   * الوصول إلى خدمة التشخيص
   */
  get diagnosis(): DiagnosisService {
    return this.diagnosisService;
  }
  
  /**
   * الوصول إلى خدمة جدولة العلاجات
   */
  get scheduler(): TreatmentSchedulerService {
    return this.schedulerService;
  }
  
  /**
   * الوصول إلى خدمة التنبيهات
   */
  get alerts(): AlertService {
    return this.alertService;
  }
  
  /**
   * الوصول إلى خدمة المزامنة
   */
  get sync(): SyncService {
    return this.syncService;
  }
  
  /**
   * الوصول إلى خدمة سجلات الخلايا
   */
  get hiveRecords(): HiveRecordService {
    return this.hiveRecordService;
  }
  
  /**
   * الوصول إلى مدير الترجمة
   */
  get i18n(): I18nManager {
    return this.i18nManager;
  }
}
