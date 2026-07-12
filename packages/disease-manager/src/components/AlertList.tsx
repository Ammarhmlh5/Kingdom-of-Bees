/**
 * Alert List Component
 * مكون قائمة التنبيهات
 */

import React, { useMemo } from 'react';
import { Alert, AlertType, AlertPriority, AlertStatus } from '../types/alert';
import { useI18n } from '../i18n/I18nContext';
import './AlertList.css';

/**
 * Alert List Props
 */
export interface AlertListProps {
  /** قائمة التنبيهات */
  alerts: Alert[];
  /** فلترة حسب النوع */
  filterType?: AlertType;
  /** فلترة حسب الأولوية */
  filterPriority?: AlertPriority;
  /** فلترة حسب الحالة */
  filterStatus?: AlertStatus;
  /** عرض الفلاتر */
  showFilters?: boolean;
  /** عرض الإحصائيات */
  showStats?: boolean;
  /** دالة عند النقر على تنبيه */
  onAlertClick?: (alert: Alert) => void;
  /** دالة عند إلغاء تنبيه */
  onDismiss?: (alertId: string) => void;
  /** دالة عند حذف تنبيه */
  onDelete?: (alertId: string) => void;
  /** رسالة عند عدم وجود تنبيهات */
  emptyMessage?: string;
  /** CSS class إضافي */
  className?: string;
}

/**
 * Alert List Component
 * مكون لعرض قائمة التنبيهات مع فلترة وإحصائيات
 */
export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  filterType,
  filterPriority,
  filterStatus,
  showStats = true,
  onAlertClick,
  onDismiss,
  onDelete,
  emptyMessage,
  className = '',
}) => {
  const { t, locale, direction } = useI18n();
  const dir = direction;

  // فلترة التنبيهات
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (filterType) {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    if (filterPriority) {
      filtered = filtered.filter((a) => a.priority === filterPriority);
    }

    if (filterStatus) {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // ترتيب حسب الأولوية والتاريخ
    filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return filtered;
  }, [alerts, filterType, filterPriority, filterStatus]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    return {
      total: filteredAlerts.length,
      pending: filteredAlerts.filter((a) => a.status === 'pending').length,
      sent: filteredAlerts.filter((a) => a.status === 'sent').length,
      dismissed: filteredAlerts.filter((a) => a.status === 'dismissed').length,
      critical: filteredAlerts.filter((a) => a.priority === 'critical').length,
      high: filteredAlerts.filter((a) => a.priority === 'high').length,
    };
  }, [filteredAlerts]);

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: AlertType): string => {
    const icons: Record<AlertType, string> = {
      inspection_reminder: '🔍',
      treatment_reminder: '💊',
      disease_outbreak: '⚠️',
      weather_warning: '🌦️',
      emergency: '🚨',
      inventory_low: '📦',
      expiry_warning: '⏰',
      safety_period: '🛡️',
      harvest_ready: '🍯',
      custom: '📌',
    };
    return icons[type] || '📌';
  };

  // الحصول على لون الأولوية
  const getPriorityColor = (priority: AlertPriority): string => {
    const colors: Record<AlertPriority, string> = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#ff5722',
      critical: '#f44336',
    };
    return colors[priority];
  };

  // تنسيق التاريخ
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('alerts.justNow');
    if (minutes < 60)
      return t('alerts.minutesAgo', { count: minutes.toString() });
    if (hours < 24) return t('alerts.hoursAgo', { count: hours.toString() });
    if (days < 7) return t('alerts.daysAgo', { count: days.toString() });

    return date.toLocaleDateString(locale);
  };

  return (
    <div className={`alert-list ${className}`} dir={dir}>
      {/* الإحصائيات */}
      {showStats && (
        <div className="alert-list-stats">
          <div className="stat-item">
            <span className="stat-label">{t('alerts.total')}</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('alerts.pending')}</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('alerts.sent')}</span>
            <span className="stat-value">{stats.sent}</span>
          </div>
          <div className="stat-item critical">
            <span className="stat-label">{t('alerts.critical')}</span>
            <span className="stat-value">{stats.critical}</span>
          </div>
        </div>
      )}

      {/* قائمة التنبيهات */}
      <div className="alert-list-container">
        {filteredAlerts.length === 0 ? (
          <div className="alert-list-empty">
            <span className="empty-icon">📭</span>
            <p className="empty-message">
              {emptyMessage || t('alerts.noAlerts')}
            </p>
          </div>
        ) : (
          <div className="alert-items">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-item alert-${alert.priority} alert-${alert.status}`}
                onClick={() => onAlertClick?.(alert)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onAlertClick?.(alert);
                  }
                }}
                aria-label={`${t(`alerts.types.${alert.type}`)} - ${alert.title[locale]}`}
              >
                {/* شريط الأولوية */}
                <div
                  className="alert-priority-bar"
                  style={{ backgroundColor: getPriorityColor(alert.priority) }}
                />

                {/* المحتوى */}
                <div className="alert-content">
                  {/* الرأس */}
                  <div className="alert-header">
                    <div className="alert-type">
                      <span className="type-icon">
                        {getTypeIcon(alert.type)}
                      </span>
                      <span className="type-label">
                        {t(`alerts.types.${alert.type}`)}
                      </span>
                    </div>
                    <div className="alert-badges">
                      <span
                        className={`priority-badge priority-${alert.priority}`}
                      >
                        {t(`alerts.priorities.${alert.priority}`)}
                      </span>
                      <span className={`status-badge status-${alert.status}`}>
                        {t(`alerts.statuses.${alert.status}`)}
                      </span>
                    </div>
                  </div>

                  {/* العنوان */}
                  <h3 className="alert-title">{alert.title[locale]}</h3>

                  {/* الرسالة */}
                  <p className="alert-message">{alert.message[locale]}</p>

                  {/* الكيان المرتبط */}
                  {alert.relatedEntity && (
                    <div className="alert-entity">
                      <span className="entity-icon">🔗</span>
                      <span className="entity-label">
                        {t(`alerts.entities.${alert.relatedEntity.type}`)}:{' '}
                        {alert.relatedEntity.id}
                      </span>
                    </div>
                  )}

                  {/* التاريخ */}
                  <div className="alert-footer">
                    <span className="alert-date">
                      {formatDate(alert.createdAt)}
                    </span>
                    {alert.scheduledFor && alert.status === 'pending' && (
                      <span className="alert-scheduled">
                        {t('alerts.scheduledFor')}:{' '}
                        {alert.scheduledFor.toLocaleString(locale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* الإجراءات */}
                <div className="alert-actions">
                  {alert.status === 'sent' && onDismiss && (
                    <button
                      className="action-button dismiss-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(alert.id);
                      }}
                      aria-label={t('alerts.dismiss')}
                      title={t('alerts.dismiss')}
                    >
                      ✓
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="action-button delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(alert.id);
                      }}
                      aria-label={t('alerts.delete')}
                      title={t('alerts.delete')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertList;
