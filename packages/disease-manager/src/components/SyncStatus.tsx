/**
 * Sync Status Component
 * مكون حالة المزامنة
 */

import React from 'react';
import { useSync } from '../hooks/useSync';
import { useI18n } from '../i18n/I18nContext';
import './SyncStatus.css';

/**
 * Sync Status Props
 */
export interface SyncStatusProps {
  /** عرض مفصل */
  detailed?: boolean;
  /** عرض زر المزامنة */
  showSyncButton?: boolean;
  /** عرض إعدادات المزامنة التلقائية */
  showAutoSyncToggle?: boolean;
  /** عرض التعارضات */
  showConflicts?: boolean;
  /** دالة عند نجاح المزامنة */
  onSyncSuccess?: () => void;
  /** دالة عند فشل المزامنة */
  onSyncError?: (error: string) => void;
  /** CSS class إضافي */
  className?: string;
}

/**
 * Sync Status Component
 * مكون لعرض حالة المزامنة مع زر للمزامنة اليدوية
 */
export const SyncStatus: React.FC<SyncStatusProps> = ({
  detailed = false,
  showSyncButton = true,
  showAutoSyncToggle = false,
  showConflicts = true,
  onSyncSuccess,
  onSyncError,
  className = '',
}) => {
  const { t, locale, direction } = useI18n();
  const dir = direction;
  
  const {
    status,
    lastSync,
    pendingCount,
    conflictsCount,
    isSyncing,
    isAutoSyncEnabled,
    error,
    sync,
    enableAutoSync,
    disableAutoSync,
  } = useSync();

  /**
   * معالج المزامنة
   */
  const handleSync = async () => {
    try {
      await sync();
      onSyncSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      onSyncError?.(errorMessage);
    }
  };

  /**
   * معالج تبديل المزامنة التلقائية
   */
  const handleAutoSyncToggle = () => {
    if (isAutoSyncEnabled) {
      disableAutoSync();
    } else {
      enableAutoSync();
    }
  };

  /**
   * تنسيق التاريخ
   */
  const formatLastSync = (): string => {
    if (!lastSync) {
      return t('sync.never');
    }

    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('sync.justNow');
    if (minutes < 60) return t('sync.minutesAgo', { count: minutes.toString() });
    if (hours < 24) return t('sync.hoursAgo', { count: hours.toString() });
    if (days < 7) return t('sync.daysAgo', { count: days.toString() });

    return lastSync.toLocaleDateString(locale);
  };

  /**
   * الحصول على أيقونة الحالة
   */
  const getStatusIcon = (): string => {
    if (isSyncing) return '🔄';
    if (status === 'error') return '⚠️';
    if (pendingCount > 0) return '⏳';
    return '✓';
  };

  /**
   * الحصول على نص الحالة
   */
  const getStatusText = (): string => {
    if (isSyncing) return t('sync.syncing');
    if (status === 'error') return t('sync.error');
    if (pendingCount > 0) return t('sync.pending');
    return t('sync.synced');
  };

  /**
   * الحصول على لون الحالة
   */
  const getStatusColor = (): string => {
    if (isSyncing) return '#2196f3';
    if (status === 'error') return '#f44336';
    if (pendingCount > 0) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div className={`sync-status ${detailed ? 'detailed' : 'compact'} ${className}`} dir={dir}>
      {/* الحالة الأساسية */}
      <div className="sync-status-main">
        <div className="sync-status-indicator">
          <span 
            className="status-icon" 
            style={{ color: getStatusColor() }}
            role="img"
            aria-label={getStatusText()}
          >
            {getStatusIcon()}
          </span>
          <span className="status-text">{getStatusText()}</span>
        </div>

        {/* زر المزامنة */}
        {showSyncButton && (
          <button
            className="sync-button"
            onClick={handleSync}
            disabled={isSyncing}
            aria-label={t('sync.syncNow')}
            title={t('sync.syncNow')}
          >
            {isSyncing ? (
              <>
                <span className="sync-spinner">⟳</span>
                <span>{t('sync.syncing')}</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>{t('sync.syncNow')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* التفاصيل */}
      {detailed && (
        <div className="sync-status-details">
          {/* آخر مزامنة */}
          <div className="sync-detail-item">
            <span className="detail-label">{t('sync.lastSync')}:</span>
            <span className="detail-value">{formatLastSync()}</span>
          </div>

          {/* العمليات المعلقة */}
          {pendingCount > 0 && (
            <div className="sync-detail-item pending">
              <span className="detail-label">{t('sync.pendingOperations')}:</span>
              <span className="detail-value">{pendingCount}</span>
            </div>
          )}

          {/* التعارضات */}
          {showConflicts && conflictsCount > 0 && (
            <div className="sync-detail-item conflicts">
              <span className="detail-label">{t('sync.conflicts')}:</span>
              <span className="detail-value">{conflictsCount}</span>
            </div>
          )}

          {/* المزامنة التلقائية */}
          {showAutoSyncToggle && (
            <div className="sync-detail-item auto-sync">
              <label className="auto-sync-toggle">
                <input
                  type="checkbox"
                  checked={isAutoSyncEnabled}
                  onChange={handleAutoSyncToggle}
                  aria-label={t('sync.autoSync')}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">{t('sync.autoSync')}</span>
              </label>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="sync-error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* مؤشر التقدم */}
      {isSyncing && (
        <div className="sync-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
