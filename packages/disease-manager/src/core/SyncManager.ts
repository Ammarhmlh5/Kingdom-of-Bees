/**
 * Sync Manager Core
 * محرك المزامنة الأساسي
 */

import type { DatabaseAdapter } from '../database/types';
import type {
  Operation,
  SyncResult,
  SyncStatus,
  SyncConfig,
  SyncStatistics,
  Conflict,
  ConflictResolutionStrategy,
} from '../types/sync';
import { OfflineQueue } from './OfflineQueue';

/**
 * Sync Manager
 * مدير المزامنة
 */
export class SyncManager {
  private queue: OfflineQueue;
  private database?: DatabaseAdapter;
  private remoteDatabase?: DatabaseAdapter;
  private status: SyncStatus = 'idle';
  private config: SyncConfig;
  private autoSyncTimer?: NodeJS.Timeout;
  private conflicts: Map<string, Conflict> = new Map();
  private statistics: SyncStatistics = {
    totalSynced: 0,
    totalFailed: 0,
    pendingOperations: 0,
    unresolvedConflicts: 0,
  };

  /**
   * Constructor
   */
  constructor(
    localDatabase?: DatabaseAdapter,
    remoteDatabase?: DatabaseAdapter,
    config?: Partial<SyncConfig>
  ) {
    this.database = localDatabase;
    this.remoteDatabase = remoteDatabase;
    this.queue = new OfflineQueue(localDatabase);

    // التكوين الافتراضي
    this.config = {
      autoSync: false,
      autoSyncInterval: 5, // 5 دقائق
      maxRetries: 3,
      retryDelay: 5, // 5 ثواني
      defaultConflictStrategy: 'latest_wins',
      syncOnWifiOnly: false,
      ...config,
    };
  }

  /**
   * Initialize
   * تهيئة المدير
   */
  async initialize(): Promise<void> {
    await this.queue.initialize();
    this.updateStatistics();

    if (this.config.autoSync) {
      this.enableAutoSync();
    }
  }

  /**
   * Sync
   * مزامنة العمليات المعلقة
   */
  async sync(): Promise<SyncResult> {
    if (this.status === 'syncing') {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        failedOperations: [],
        message: 'Sync already in progress',
      };
    }

    if (!this.remoteDatabase) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        failedOperations: [],
        message: 'Remote database not configured',
      };
    }

    this.status = 'syncing';
    const pendingOps = this.queue.getPendingOperations();
    const failedOps: Operation[] = [];
    let syncedCount = 0;

    try {
      // رفع العمليات المعلقة
      for (const operation of pendingOps) {
        try {
          await this.syncOperation(operation);
          await this.queue.updateOperationStatus(operation.id, 'completed');
          syncedCount++;
          this.statistics.totalSynced++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          await this.queue.updateOperationStatus(
            operation.id,
            'failed',
            errorMessage
          );
          failedOps.push(operation);
          this.statistics.totalFailed++;
        }
      }

      // تنزيل التحديثات من السيرفر
      await this.pullUpdates();

      // تحديث الإحصائيات
      this.updateStatistics();
      this.statistics.lastSuccessfulSync = new Date();

      this.status = 'idle';

      return {
        success: failedOps.length === 0,
        syncedCount,
        failedCount: failedOps.length,
        failedOperations: failedOps,
        message:
          failedOps.length === 0
            ? 'Sync completed successfully'
            : `Sync completed with ${failedOps.length} failures`,
      };
    } catch (error) {
      this.status = 'error';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        syncedCount,
        failedCount: pendingOps.length - syncedCount,
        failedOperations: failedOps,
        message: `Sync failed: ${errorMessage}`,
      };
    } finally {
      this.statistics.lastSyncAttempt = new Date();
    }
  }

  /**
   * Sync Operation
   * مزامنة عملية واحدة
   */
  private async syncOperation(operation: Operation): Promise<void> {
    if (!this.remoteDatabase) {
      throw new Error('Remote database not configured');
    }

    await this.queue.updateOperationStatus(operation.id, 'syncing');

    // تطبيق العملية على قاعدة البيانات البعيدة
    switch (operation.type) {
      case 'create':
        await this.remoteDatabase.create(
          operation.entityType,
          operation.data
        );
        break;

      case 'update':
        await this.remoteDatabase.update(
          operation.entityType,
          operation.entityId,
          operation.data
        );
        break;

      case 'delete':
        await this.remoteDatabase.delete(
          operation.entityType,
          operation.entityId
        );
        break;
    }

    // إعادة المحاولة مع exponential backoff إذا فشلت
    if (operation.attempts < this.config.maxRetries) {
      const delay = this.config.retryDelay * Math.pow(2, operation.attempts);
      await this.sleep(delay * 1000);
    }
  }

  /**
   * Pull Updates
   * تنزيل التحديثات من السيرفر
   */
  private async pullUpdates(): Promise<void> {
    if (!this.remoteDatabase || !this.database) {
      return;
    }

    // هنا يمكن تنفيذ منطق تنزيل التحديثات من السيرفر
    // مثل: الحصول على آخر تحديث، مقارنة التواريخ، تنزيل البيانات الجديدة
    // هذا يعتمد على تصميم API السيرفر
  }

  /**
   * Enable Auto Sync
   * تفعيل المزامنة التلقائية
   */
  enableAutoSync(): void {
    if (this.autoSyncTimer) {
      return;
    }

    this.config.autoSync = true;
    const intervalMs = this.config.autoSyncInterval * 60 * 1000;

    this.autoSyncTimer = setInterval(() => {
      if (this.queue.hasPendingOperations()) {
        this.sync();
      }
    }, intervalMs);
  }

  /**
   * Disable Auto Sync
   * تعطيل المزامنة التلقائية
   */
  disableAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = undefined;
    }
    this.config.autoSync = false;
  }

  /**
   * Get Status
   * الحصول على حالة المزامنة
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Get Statistics
   * الحصول على الإحصائيات
   */
  getStatistics(): SyncStatistics {
    return { ...this.statistics };
  }

  /**
   * Get Config
   * الحصول على التكوين
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Update Config
   * تحديث التكوين
   */
  updateConfig(config: Partial<SyncConfig>): void {
    const wasAutoSync = this.config.autoSync;
    this.config = { ...this.config, ...config };

    // إعادة تفعيل المزامنة التلقائية إذا تغيرت الإعدادات
    if (wasAutoSync && !this.config.autoSync) {
      this.disableAutoSync();
    } else if (!wasAutoSync && this.config.autoSync) {
      this.enableAutoSync();
    } else if (this.config.autoSync && this.autoSyncTimer) {
      // إعادة تشغيل المؤقت بالفترة الجديدة
      this.disableAutoSync();
      this.enableAutoSync();
    }
  }

  /**
   * Get Queue
   * الحصول على القائمة
   */
  getQueue(): OfflineQueue {
    return this.queue;
  }

  /**
   * Retry Failed Operations
   * إعادة محاولة العمليات الفاشلة
   */
  async retryFailedOperations(): Promise<SyncResult> {
    await this.queue.retryFailedOperations();
    return this.sync();
  }

  /**
   * Clear Completed Operations
   * مسح العمليات المكتملة
   */
  async clearCompletedOperations(): Promise<number> {
    return this.queue.clearCompletedOperations();
  }

  /**
   * Update Statistics
   * تحديث الإحصائيات
   */
  private updateStatistics(): void {
    this.statistics.pendingOperations = this.queue.getPendingCount();
    this.statistics.unresolvedConflicts = this.conflicts.size;
  }

  /**
   * Sleep
   * انتظار لفترة محددة
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Detect Conflict
   * كشف التعارض
   */
  async detectConflict(
    operation: Operation,
    remoteData: any
  ): Promise<Conflict | null> {
    if (!remoteData) {
      return null;
    }

    const localModifiedAt = new Date(operation.data.updatedAt || operation.createdAt);
    const remoteModifiedAt = new Date(remoteData.updatedAt);

    // إذا كان التاريخ المحلي أحدث، لا يوجد تعارض
    if (localModifiedAt > remoteModifiedAt) {
      return null;
    }

    // إذا كان التاريخ البعيد أحدث، يوجد تعارض
    const conflict: Conflict = {
      id: this.generateConflictId(),
      entityType: operation.entityType,
      entityId: operation.entityId,
      localData: operation.data,
      remoteData,
      localModifiedAt,
      remoteModifiedAt,
      detectedAt: new Date(),
      resolved: false,
    };

    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  /**
   * Get Conflicts
   * الحصول على التعارضات
   */
  getConflicts(): Conflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get Unresolved Conflicts
   * الحصول على التعارضات غير المحلولة
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.getConflicts().filter((c) => !c.resolved);
  }

  /**
   * Resolve Conflict
   * حل التعارض
   */
  async resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    customData?: any
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    let resolvedData: any;

    switch (strategy) {
      case 'local_wins':
        resolvedData = conflict.localData;
        break;

      case 'remote_wins':
        resolvedData = conflict.remoteData;
        break;

      case 'latest_wins':
        resolvedData =
          conflict.localModifiedAt > conflict.remoteModifiedAt
            ? conflict.localData
            : conflict.remoteData;
        break;

      case 'manual':
        if (!customData) {
          throw new Error('Custom data required for manual resolution');
        }
        resolvedData = customData;
        break;
    }

    conflict.strategy = strategy;
    conflict.resolved = true;
    conflict.resolvedData = resolvedData;

    // تطبيق الحل على قاعدة البيانات
    if (this.database) {
      await this.database.update(
        conflict.entityType,
        conflict.entityId,
        resolvedData
      );
    }

    this.updateStatistics();
  }

  /**
   * Generate Conflict ID
   * توليد معرف تعارض
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
