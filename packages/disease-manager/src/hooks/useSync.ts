/**
 * useSync Hook
 * Hook للعمل مع نظام المزامنة
 */

import { useState, useEffect, useCallback } from 'react';
import { useDiseaseManager } from './useDiseaseManager';
import type { SyncStatus, SyncResult, SyncStatistics } from '../types/sync';

/**
 * Hook للعمل مع نظام المزامنة
 * 
 * @example
 * ```tsx
 * const { status, sync, pendingCount, lastSync } = useSync();
 * ```
 */
export const useSync = () => {
  const { } = useDiseaseManager();
  const syncService: any = null; // Sync service not yet implemented in context

  const [status, setStatus] = useState<SyncStatus>('idle');
  const [statistics, setStatistics] = useState<SyncStatistics>({
    totalSynced: 0,
    totalFailed: 0,
    pendingOperations: 0,
    unresolvedConflicts: 0,
  });
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * تحديث الحالة والإحصائيات
   */
  const updateState = useCallback(() => {
    if (!syncService) return;

    try {
      setStatus(syncService.getStatus());
      setStatistics(syncService.getStatistics());
    } catch (err) {
      console.error('Failed to update sync state:', err);
    }
  }, [syncService]);

  /**
   * مزامنة فورية
   */
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!syncService) {
      throw new Error('Sync service not available');
    }

    setError(null);

    try {
      const result = await syncService.sync();
      setLastSyncResult(result);
      updateState();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      throw err;
    }
  }, [syncService, updateState]);

  /**
   * تفعيل المزامنة التلقائية
   */
  const enableAutoSync = useCallback(() => {
    if (!syncService) return;
    syncService.enableAutoSync();
    updateState();
  }, [syncService, updateState]);

  /**
   * تعطيل المزامنة التلقائية
   */
  const disableAutoSync = useCallback(() => {
    if (!syncService) return;
    syncService.disableAutoSync();
    updateState();
  }, [syncService, updateState]);

  /**
   * إعادة محاولة العمليات الفاشلة
   */
  const retryFailed = useCallback(async (): Promise<SyncResult> => {
    if (!syncService) {
      throw new Error('Sync service not available');
    }

    setError(null);

    try {
      const result = await syncService.retryFailedOperations();
      setLastSyncResult(result);
      updateState();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Retry failed';
      setError(errorMessage);
      throw err;
    }
  }, [syncService, updateState]);

  /**
   * حل جميع التعارضات
   */
  const resolveAllConflicts = useCallback(async (strategy: 'local_wins' | 'remote_wins' | 'latest_wins') => {
    if (!syncService) {
      throw new Error('Sync service not available');
    }

    setError(null);

    try {
      await syncService.resolveAllConflicts(strategy);
      updateState();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conflict resolution failed';
      setError(errorMessage);
      throw err;
    }
  }, [syncService, updateState]);

  // تحديث الحالة عند التحميل وبشكل دوري
  useEffect(() => {
    if (!syncService) return;

    updateState();

    // تحديث كل 5 ثواني
    const interval = setInterval(updateState, 5000);

    return () => clearInterval(interval);
  }, [syncService, updateState]);

  return {
    /** حالة المزامنة */
    status,

    /** الإحصائيات */
    statistics,

    /** آخر مزامنة ناجحة */
    lastSync: statistics.lastSuccessfulSync,

    /** آخر محاولة مزامنة */
    lastAttempt: statistics.lastSyncAttempt,

    /** عدد العمليات المعلقة */
    pendingCount: statistics.pendingOperations,

    /** عدد التعارضات غير المحلولة */
    conflictsCount: statistics.unresolvedConflicts,

    /** هل المزامنة جارية؟ */
    isSyncing: status === 'syncing',

    /** هل المزامنة التلقائية مفعلة؟ */
    isAutoSyncEnabled: syncService?.isAutoSyncEnabled() ?? false,

    /** نتيجة آخر مزامنة */
    lastSyncResult,

    /** رسالة الخطأ */
    error,

    /** مزامنة فورية */
    sync,

    /** تفعيل المزامنة التلقائية */
    enableAutoSync,

    /** تعطيل المزامنة التلقائية */
    disableAutoSync,

    /** إعادة محاولة العمليات الفاشلة */
    retryFailed,

    /** حل جميع التعارضات */
    resolveAllConflicts,
  };
};
