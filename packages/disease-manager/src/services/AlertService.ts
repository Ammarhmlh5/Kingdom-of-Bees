/**
 * Alert Service
 * خدمة التنبيهات الشاملة
 */

import { AlertManager } from '../core/AlertManager';
import {
  Alert,
  AlertInput,
  AlertFilter,
  AlertSettings,
  AlertStatistics,
  RecurringAlertConfig,
  AlertType,
  AlertPriority,
  LocalizedString,
  EntityReference,
} from '../types/alert';
import { DatabaseAdapter } from '../database/types';

/**
 * Alert Service
 * خدمة شاملة لإدارة التنبيهات
 */
export class AlertService {
  private alertManager: AlertManager;

  constructor(database?: DatabaseAdapter) {
    this.alertManager = new AlertManager(database);
  }

  /**
   * Create a new alert
   * إنشاء تنبيه جديد
   */
  async createAlert(input: AlertInput): Promise<string> {
    return await this.alertManager.createAlert(input);
  }

  /**
   * Get all alerts
   * الحصول على جميع التنبيهات
   */
  async getAllAlerts(): Promise<Alert[]> {
    return await this.alertManager.getAlerts();
  }

  /**
   * Get alerts with filter
   * الحصول على التنبيهات مع فلتر
   */
  async getAlerts(filter: AlertFilter): Promise<Alert[]> {
    return await this.alertManager.getAlerts(filter);
  }

  /**
   * Get alert by ID
   * الحصول على تنبيه بالمعرف
   */
  async getAlertById(id: string): Promise<Alert | null> {
    return await this.alertManager.getAlertById(id);
  }

  /**
   * Get pending alerts
   * الحصول على التنبيهات المعلقة
   */
  async getPendingAlerts(): Promise<Alert[]> {
    return await this.alertManager.getAlerts({
      statuses: ['pending'],
    });
  }

  /**
   * Get sent alerts
   * الحصول على التنبيهات المرسلة
   */
  async getSentAlerts(): Promise<Alert[]> {
    return await this.alertManager.getAlerts({
      statuses: ['sent'],
    });
  }

  /**
   * Get alerts by type
   * الحصول على التنبيهات حسب النوع
   */
  async getAlertsByType(type: AlertType): Promise<Alert[]> {
    return await this.alertManager.getAlerts({
      types: [type],
    });
  }

  /**
   * Get alerts by priority
   * الحصول على التنبيهات حسب الأولوية
   */
  async getAlertsByPriority(priority: AlertPriority): Promise<Alert[]> {
    return await this.alertManager.getAlerts({
      priorities: [priority],
    });
  }

  /**
   * Get critical alerts
   * الحصول على التنبيهات الحرجة
   */
  async getCriticalAlerts(): Promise<Alert[]> {
    return await this.getAlertsByPriority('critical');
  }

  /**
   * Get alerts for a specific entity
   * الحصول على التنبيهات لكيان محدد
   */
  async getAlertsForEntity(
    entityType: EntityReference['type'],
    entityId: string
  ): Promise<Alert[]> {
    return await this.alertManager.getAlerts({
      relatedEntityType: entityType,
      relatedEntityId: entityId,
    });
  }

  /**
   * Get alerts for a hive
   * الحصول على التنبيهات لخلية
   */
  async getAlertsForHive(hiveId: string): Promise<Alert[]> {
    return await this.getAlertsForEntity('hive', hiveId);
  }

  /**
   * Get alerts for a treatment
   * الحصول على التنبيهات لعلاج
   */
  async getAlertsForTreatment(treatmentId: string): Promise<Alert[]> {
    return await this.getAlertsForEntity('treatment', treatmentId);
  }

  /**
   * Dismiss an alert
   * إلغاء تنبيه
   */
  async dismissAlert(alertId: string): Promise<void> {
    await this.alertManager.dismissAlert(alertId);
  }

  /**
   * Dismiss multiple alerts
   * إلغاء عدة تنبيهات
   */
  async dismissAlerts(alertIds: string[]): Promise<void> {
    await this.alertManager.dismissAlerts(alertIds);
  }

  /**
   * Dismiss all alerts
   * إلغاء جميع التنبيهات
   */
  async dismissAllAlerts(): Promise<void> {
    const alerts = await this.getSentAlerts();
    const alertIds = alerts.map((a) => a.id);
    await this.dismissAlerts(alertIds);
  }

  /**
   * Delete an alert
   * حذف تنبيه
   */
  async deleteAlert(alertId: string): Promise<void> {
    await this.alertManager.deleteAlert(alertId);
  }

  /**
   * Update alert settings
   * تحديث إعدادات التنبيهات
   */
  updateSettings(settings: Partial<AlertSettings>): void {
    this.alertManager.updateSettings(settings);
  }

  /**
   * Get alert settings
   * الحصول على إعدادات التنبيهات
   */
  getSettings(): AlertSettings {
    return this.alertManager.getSettings();
  }

  /**
   * Enable alert type
   * تفعيل نوع تنبيه
   */
  enableAlertType(type: AlertType): void {
    const settings = this.alertManager.getSettings();
    if (!settings.enabledTypes.includes(type)) {
      settings.enabledTypes.push(type);
      this.alertManager.updateSettings(settings);
    }
  }

  /**
   * Disable alert type
   * تعطيل نوع تنبيه
   */
  disableAlertType(type: AlertType): void {
    const settings = this.alertManager.getSettings();
    settings.enabledTypes = settings.enabledTypes.filter((t) => t !== type);
    this.alertManager.updateSettings(settings);
  }

  /**
   * Schedule a recurring alert
   * جدولة تنبيه متكرر
   */
  scheduleRecurringAlert(config: RecurringAlertConfig): void {
    this.alertManager.scheduleRecurringAlert(config);
  }

  /**
   * Cancel a recurring alert
   * إلغاء تنبيه متكرر
   */
  cancelRecurringAlert(configId: string): void {
    this.alertManager.cancelRecurringAlert(configId);
  }

  /**
   * Get all recurring alerts
   * الحصول على جميع التنبيهات المتكررة
   */
  getRecurringAlerts(): RecurringAlertConfig[] {
    return this.alertManager.getRecurringAlerts();
  }

  /**
   * Start alert checker
   * بدء فاحص التنبيهات
   */
  startAlertChecker(intervalMinutes?: number): void {
    this.alertManager.startAlertChecker(intervalMinutes);
  }

  /**
   * Stop alert checker
   * إيقاف فاحص التنبيهات
   */
  stopAlertChecker(): void {
    this.alertManager.stopAlertChecker();
  }

  /**
   * Get alert statistics
   * الحصول على إحصائيات التنبيهات
   */
  async getStatistics(): Promise<AlertStatistics> {
    return await this.alertManager.getStatistics();
  }

  // ========== Helper Methods for Creating Specific Alert Types ==========

  /**
   * Create inspection reminder
   * إنشاء تذكير بالفحص
   */
  async createInspectionReminder(
    hiveId: string,
    scheduledFor: Date,
    title: LocalizedString,
    message: LocalizedString
  ): Promise<string> {
    return await this.createAlert({
      type: 'inspection_reminder',
      priority: 'medium',
      title,
      message,
      scheduledFor,
      relatedEntity: { type: 'hive', id: hiveId },
    });
  }

  /**
   * Create treatment reminder
   * إنشاء تذكير بالعلاج
   */
  async createTreatmentReminder(
    treatmentId: string,
    scheduledFor: Date,
    title: LocalizedString,
    message: LocalizedString
  ): Promise<string> {
    return await this.createAlert({
      type: 'treatment_reminder',
      priority: 'high',
      title,
      message,
      scheduledFor,
      relatedEntity: { type: 'treatment', id: treatmentId },
    });
  }

  /**
   * Create disease outbreak alert
   * إنشاء تنبيه تفشي مرض
   */
  async createDiseaseOutbreakAlert(
    diseaseId: string,
    title: LocalizedString,
    message: LocalizedString
  ): Promise<string> {
    return await this.createAlert({
      type: 'disease_outbreak',
      priority: 'critical',
      title,
      message,
      relatedEntity: { type: 'disease', id: diseaseId },
    });
  }

  /**
   * Create weather warning
   * إنشاء تحذير طقس
   */
  async createWeatherWarning(
    title: LocalizedString,
    message: LocalizedString,
    priority: AlertPriority = 'high'
  ): Promise<string> {
    return await this.createAlert({
      type: 'weather_warning',
      priority,
      title,
      message,
    });
  }

  /**
   * Create emergency alert
   * إنشاء تنبيه طوارئ
   */
  async createEmergencyAlert(
    title: LocalizedString,
    message: LocalizedString,
    relatedEntity?: EntityReference
  ): Promise<string> {
    return await this.createAlert({
      type: 'emergency',
      priority: 'critical',
      title,
      message,
      relatedEntity,
    });
  }

  /**
   * Create inventory low alert
   * إنشاء تنبيه مخزون منخفض
   */
  async createInventoryLowAlert(
    inventoryId: string,
    title: LocalizedString,
    message: LocalizedString
  ): Promise<string> {
    return await this.createAlert({
      type: 'inventory_low',
      priority: 'medium',
      title,
      message,
      relatedEntity: { type: 'inventory', id: inventoryId },
    });
  }

  /**
   * Create expiry warning
   * إنشاء تحذير انتهاء صلاحية
   */
  async createExpiryWarning(
    inventoryId: string,
    title: LocalizedString,
    message: LocalizedString,
    expiryDate: Date
  ): Promise<string> {
    return await this.createAlert({
      type: 'expiry_warning',
      priority: 'high',
      title,
      message,
      expiresAt: expiryDate,
      relatedEntity: { type: 'inventory', id: inventoryId },
    });
  }

  /**
   * Create safety period alert
   * إنشاء تنبيه فترة أمان
   */
  async createSafetyPeriodAlert(
    hiveId: string,
    title: LocalizedString,
    message: LocalizedString,
    endDate: Date
  ): Promise<string> {
    return await this.createAlert({
      type: 'safety_period',
      priority: 'high',
      title,
      message,
      expiresAt: endDate,
      relatedEntity: { type: 'hive', id: hiveId },
    });
  }

  /**
   * Create harvest ready alert
   * إنشاء تنبيه جاهز للحصاد
   */
  async createHarvestReadyAlert(
    hiveId: string,
    title: LocalizedString,
    message: LocalizedString
  ): Promise<string> {
    return await this.createAlert({
      type: 'harvest_ready',
      priority: 'medium',
      title,
      message,
      relatedEntity: { type: 'hive', id: hiveId },
    });
  }
}
