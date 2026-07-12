/**
 * Alert Manager
 * مدير التنبيهات الأساسي
 */

import {
  Alert,
  AlertInput,
  AlertFilter,
  AlertSettings,
  AlertStatistics,
  AlertStatus,
  AlertType,
  AlertPriority,
  RecurringAlertConfig,
  SimpleSchedule,
} from '../types/alert';
import { DatabaseAdapter } from '../database/types';

/**
 * Alert Manager
 * يدير جميع عمليات التنبيهات
 */
export class AlertManager {
  private database?: DatabaseAdapter;
  private settings: AlertSettings;
  private recurringAlerts: Map<string, RecurringAlertConfig>;
  private checkInterval?: NodeJS.Timeout;

  constructor(database?: DatabaseAdapter) {
    this.database = database;
    this.settings = this.getDefaultSettings();
    this.recurringAlerts = new Map();
  }

  /**
   * Get default alert settings
   * الحصول على الإعدادات الافتراضية
   */
  private getDefaultSettings(): AlertSettings {
    return {
      enabledTypes: [
        'inspection_reminder',
        'treatment_reminder',
        'disease_outbreak',
        'weather_warning',
        'emergency',
        'inventory_low',
        'expiry_warning',
        'safety_period',
        'harvest_ready',
      ],
      notificationChannels: ['in_app', 'push'],
      priorityThreshold: 'low',
      autoExpireAfterDays: 30,
    };
  }

  /**
   * Create a new alert
   * إنشاء تنبيه جديد
   */
  async createAlert(input: AlertInput): Promise<string> {
    // Check if alert type is enabled
    if (!this.settings.enabledTypes.includes(input.type)) {
      throw new Error(`Alert type ${input.type} is disabled`);
    }

    // Check priority threshold
    if (!this.isPriorityAboveThreshold(input.priority)) {
      throw new Error(`Alert priority ${input.priority} is below threshold`);
    }

    // Check quiet hours
    if (this.isInQuietHours() && input.priority !== 'critical') {
      // Reschedule for after quiet hours
      input.scheduledFor = this.getNextAvailableTime();
    }

    const alert: Alert = {
      id: this.generateId(),
      ...input,
      createdAt: new Date(),
      status: input.scheduledFor ? 'pending' : 'sent',
    };

    // Save to database if available
    if (this.database) {
      await this.database.create('alerts', alert);
    }

    return alert.id;
  }

  /**
   * Get alerts with optional filtering
   * الحصول على التنبيهات مع فلترة اختيارية
   */
  async getAlerts(filter?: AlertFilter): Promise<Alert[]> {
    if (!this.database) {
      return [];
    }

    let alerts = await this.database.query<Alert>('alerts', {});

    // Apply filters
    if (filter) {
      alerts = this.applyFilters(alerts, filter);
    }

    // Sort by priority and date
    alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return alerts;
  }

  /**
   * Get alert by ID
   * الحصول على تنبيه بالمعرف
   */
  async getAlertById(id: string): Promise<Alert | null> {
    if (!this.database) {
      return null;
    }

    return await this.database.read<Alert>('alerts', id);
  }

  /**
   * Dismiss an alert
   * إلغاء تنبيه
   */
  async dismissAlert(alertId: string): Promise<void> {
    if (!this.database) {
      return;
    }

    await this.database.update<Alert>('alerts', alertId, {
      status: 'dismissed',
    });
  }

  /**
   * Dismiss multiple alerts
   * إلغاء عدة تنبيهات
   */
  async dismissAlerts(alertIds: string[]): Promise<void> {
    if (!this.database) {
      return;
    }

    const updates = alertIds.map((id) => ({
      id,
      data: { status: 'dismissed' as AlertStatus },
    }));

    await this.database.batchUpdate('alerts', updates);
  }

  /**
   * Delete an alert
   * حذف تنبيه
   */
  async deleteAlert(alertId: string): Promise<void> {
    if (!this.database) {
      return;
    }

    await this.database.delete('alerts', alertId);
  }

  /**
   * Update alert settings
   * تحديث إعدادات التنبيهات
   */
  updateSettings(settings: Partial<AlertSettings>): void {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  /**
   * Get current alert settings
   * الحصول على إعدادات التنبيهات الحالية
   */
  getSettings(): AlertSettings {
    return { ...this.settings };
  }

  /**
   * Schedule a recurring alert
   * جدولة تنبيه متكرر
   */
  scheduleRecurringAlert(config: RecurringAlertConfig): void {
    this.recurringAlerts.set(config.id, config);
  }

  /**
   * Cancel a recurring alert
   * إلغاء تنبيه متكرر
   */
  cancelRecurringAlert(configId: string): void {
    this.recurringAlerts.delete(configId);
  }

  /**
   * Get all recurring alerts
   * الحصول على جميع التنبيهات المتكررة
   */
  getRecurringAlerts(): RecurringAlertConfig[] {
    return Array.from(this.recurringAlerts.values());
  }

  /**
   * Start checking for scheduled and recurring alerts
   * بدء فحص التنبيهات المجدولة والمتكررة
   */
  startAlertChecker(intervalMinutes: number = 5): void {
    if (this.checkInterval) {
      return; // Already running
    }

    this.checkInterval = setInterval(async () => {
      await this.checkScheduledAlerts();
      await this.checkRecurringAlerts();
      await this.expireOldAlerts();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the alert checker
   * إيقاف فاحص التنبيهات
   */
  stopAlertChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Get alert statistics
   * الحصول على إحصائيات التنبيهات
   */
  async getStatistics(): Promise<AlertStatistics> {
    const alerts = await this.getAlerts();

    const stats: AlertStatistics = {
      total: alerts.length,
      pending: 0,
      sent: 0,
      dismissed: 0,
      expired: 0,
      byType: {} as Record<AlertType, number>,
      byPriority: {} as Record<AlertPriority, number>,
    };

    alerts.forEach((alert) => {
      // Count by status
      stats[alert.status]++;

      // Count by type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;

      // Count by priority
      stats.byPriority[alert.priority] =
        (stats.byPriority[alert.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Check and send scheduled alerts
   * فحص وإرسال التنبيهات المجدولة
   */
  private async checkScheduledAlerts(): Promise<void> {
    if (!this.database) {
      return;
    }

    const now = new Date();
    const alerts = await this.database.query<Alert>('alerts', {
      where: [{ field: 'status', operator: 'eq', value: 'pending' }],
    });

    for (const alert of alerts) {
      if (alert.scheduledFor && alert.scheduledFor <= now) {
        await this.database.update<Alert>('alerts', alert.id, {
          status: 'sent',
        });
      }
    }
  }

  /**
   * Check and create recurring alerts
   * فحص وإنشاء التنبيهات المتكررة
   */
  private async checkRecurringAlerts(): Promise<void> {
    const now = new Date();

    for (const config of this.recurringAlerts.values()) {
      if (!config.enabled) {
        continue;
      }

      if (this.shouldCreateRecurringAlert(config.schedule, now)) {
        await this.createAlert({
          type: config.type,
          priority: config.template.priority,
          title: config.template.title,
          message: config.template.message,
          actions: config.template.actions,
          relatedEntity: config.relatedEntity,
        });
      }
    }
  }

  /**
   * Expire old alerts
   * إنهاء صلاحية التنبيهات القديمة
   */
  private async expireOldAlerts(): Promise<void> {
    if (!this.database || !this.settings.autoExpireAfterDays) {
      return;
    }

    const now = new Date();
    const alerts = await this.database.query<Alert>('alerts', {
      where: [
        { field: 'status', operator: 'in', value: ['sent', 'pending'] },
      ],
    });

    for (const alert of alerts) {
      // Check explicit expiry date
      if (alert.expiresAt && alert.expiresAt <= now) {
        await this.database.update<Alert>('alerts', alert.id, {
          status: 'expired',
        });
        continue;
      }

      // Check auto-expire
      const daysSinceCreated =
        (now.getTime() - alert.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated >= this.settings.autoExpireAfterDays) {
        await this.database.update<Alert>('alerts', alert.id, {
          status: 'expired',
        });
      }
    }
  }

  /**
   * Apply filters to alerts
   * تطبيق الفلاتر على التنبيهات
   */
  private applyFilters(alerts: Alert[], filter: AlertFilter): Alert[] {
    let filtered = alerts;

    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter((a) => filter.types!.includes(a.type));
    }

    if (filter.priorities && filter.priorities.length > 0) {
      filtered = filtered.filter((a) =>
        filter.priorities!.includes(a.priority)
      );
    }

    if (filter.statuses && filter.statuses.length > 0) {
      filtered = filtered.filter((a) => filter.statuses!.includes(a.status));
    }

    if (filter.fromDate) {
      filtered = filtered.filter((a) => a.createdAt >= filter.fromDate!);
    }

    if (filter.toDate) {
      filtered = filtered.filter((a) => a.createdAt <= filter.toDate!);
    }

    if (filter.relatedEntityType) {
      filtered = filtered.filter(
        (a) => a.relatedEntity?.type === filter.relatedEntityType
      );
    }

    if (filter.relatedEntityId) {
      filtered = filtered.filter(
        (a) => a.relatedEntity?.id === filter.relatedEntityId
      );
    }

    return filtered;
  }

  /**
   * Check if current time is in quiet hours
   * التحقق من الوقت الهادئ
   */
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { start, end } = this.settings.quietHours;

    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
  }

  /**
   * Get next available time after quiet hours
   * الحصول على الوقت التالي المتاح بعد الساعات الهادئة
   */
  private getNextAvailableTime(): Date {
    if (!this.settings.quietHours) {
      return new Date();
    }

    const now = new Date();
    const [endHour, endMinute] = this.settings.quietHours.end
      .split(':')
      .map(Number);

    const nextTime = new Date(now);
    nextTime.setHours(endHour, endMinute, 0, 0);

    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }

    return nextTime;
  }

  /**
   * Check if priority is above threshold
   * التحقق من أن الأولوية أعلى من الحد الأدنى
   */
  private isPriorityAboveThreshold(priority: AlertPriority): boolean {
    if (!this.settings.priorityThreshold) {
      return true;
    }

    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return (
      priorityOrder[priority] >=
      priorityOrder[this.settings.priorityThreshold]
    );
  }

  /**
   * Check if recurring alert should be created
   * التحقق من ضرورة إنشاء تنبيه متكرر
   */
  private shouldCreateRecurringAlert(
    schedule: SimpleSchedule,
    now: Date
  ): boolean {
    const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's the right time (within 5 minutes)
    if (
      currentHour !== scheduleHour ||
      Math.abs(currentMinute - scheduleMinute) > 5
    ) {
      return false;
    }

    switch (schedule.frequency) {
      case 'daily':
        return true;

      case 'weekly':
        return schedule.dayOfWeek === now.getDay();

      case 'monthly':
        return schedule.dayOfMonth === now.getDate();

      default:
        return false;
    }
  }

  /**
   * Generate unique ID
   * توليد معرف فريد
   */
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
