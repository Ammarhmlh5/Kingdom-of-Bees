/**
 * Sync Service
 * خدمة المزامنة الشاملة
 */

import type { DatabaseAdapter } from '../database/types';
import type {
  Operation,
  OperationInput,
  SyncResult,
  SyncStatus,
  SyncConfig,
  SyncStatistics,
  Conflict,
  ConflictResolutionStrategy,
} from '../types/sync';
import { SyncManager } from '../core/SyncManager';
import { OfflineQueue } from '../core/OfflineQueue';

/**
 * Sync Service
 * خدمة شاملة لإدارة المزامنة
 */
export class SyncService {
  private syncManager: SyncManager;
  private queue: OfflineQueue;

  /**
   * Constructor
   */
  constructor(
    localDatabase?: DatabaseAdapter,
    remoteDatabase?: DatabaseAdapter,
    config?: Partial<SyncConfig>
  ) {
    this.syncManager = new SyncManager(localDatabase, remoteDatabase, config);
    this.queue = this.syncManager.getQueue();
  }

  /**
   * Initialize
   * تهيئة الخدمة
   */
  async initialize(): Promise<void> {
    await this.syncManager.initialize();
  }

  // ==================== Sync Operations ====================

  /**
   * Sync
   * مزامنة العمليات المعلقة
   */
  async sync(): Promise<SyncResult> {
    return this.syncManager.sync();
  }

  /**
   * Sync Now
   * مزامنة فورية
   */
  async syncNow(): Promise<SyncResult> {
    return this.sync();
  }

  /**
   * Enable Auto Sync
   * تفعيل المزامنة التلقائية
   */
  enableAutoSync(): void {
    this.syncManager.enableAutoSync();
  }

  /**
   * Disable Auto Sync
   * تعطيل المزامنة التلقائية
   */
  disableAutoSync(): void {
    this.syncManager.disableAutoSync();
  }

  /**
   * Is Auto Sync Enabled
   * هل المزامنة التلقائية مفعلة؟
   */
  isAutoSyncEnabled(): boolean {
    return this.syncManager.getConfig().autoSync;
  }

  // ==================== Queue Operations ====================

  /**
   * Add Operation
   * إضافة عملية إلى القائمة
   */
  async addOperation(input: OperationInput): Promise<Operation> {
    return this.queue.addOperation(input);
  }

  /**
   * Get Pending Operations
   * الحصول على العمليات المعلقة
   */
  getPendingOperations(): Operation[] {
    return this.queue.getPendingOperations();
  }

  /**
   * Get Failed Operations
   * الحصول على العمليات الفاشلة
   */
  getFailedOperations(): Operation[] {
    return this.queue.getFailedOperations();
  }

  /**
   * Retry Failed Operations
   * إعادة محاولة العمليات الفاشلة
   */
  async retryFailedOperations(): Promise<SyncResult> {
    return this.syncManager.retryFailedOperations();
  }

  /**
   * Clear Completed Operations
   * مسح العمليات المكتملة
   */
  async clearCompletedOperations(): Promise<number> {
    return this.syncManager.clearCompletedOperations();
  }

  /**
   * Has Pending Operations
   * هل توجد عمليات معلقة؟
   */
  hasPendingOperations(): boolean {
    return this.queue.hasPendingOperations();
  }

  /**
   * Get Queue Size
   * الحصول على حجم القائمة
   */
  getQueueSize(): number {
    return this.queue.getQueueSize();
  }

  // ==================== Conflict Resolution ====================

  /**
   * Get Conflicts
   * الحصول على التعارضات
   */
  getConflicts(): Conflict[] {
    return this.syncManager.getConflicts();
  }

  /**
   * Get Unresolved Conflicts
   * الحصول على التعارضات غير المحلولة
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.syncManager.getUnresolvedConflicts();
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
    return this.syncManager.resolveConflict(conflictId, strategy, customData);
  }

  /**
   * Resolve All Conflicts
   * حل جميع التعارضات
   */
  async resolveAllConflicts(
    strategy: ConflictResolutionStrategy
  ): Promise<void> {
    const conflicts = this.getUnresolvedConflicts();

    for (const conflict of conflicts) {
      await this.resolveConflict(conflict.id, strategy);
    }
  }

  /**
   * Has Unresolved Conflicts
   * هل توجد تعارضات غير محلولة؟
   */
  hasUnresolvedConflicts(): boolean {
    return this.getUnresolvedConflicts().length > 0;
  }

  // ==================== Status & Statistics ====================

  /**
   * Get Status
   * الحصول على حالة المزامنة
   */
  getStatus(): SyncStatus {
    return this.syncManager.getStatus();
  }

  /**
   * Get Statistics
   * الحصول على الإحصائيات
   */
  getStatistics(): SyncStatistics {
    return this.syncManager.getStatistics();
  }

  /**
   * Is Syncing
   * هل المزامنة جارية؟
   */
  isSyncing(): boolean {
    return this.getStatus() === 'syncing';
  }

  /**
   * Is Idle
   * هل المزامنة في وضع الخمول؟
   */
  isIdle(): boolean {
    return this.getStatus() === 'idle';
  }

  /**
   * Has Error
   * هل حدث خطأ؟
   */
  hasError(): boolean {
    return this.getStatus() === 'error';
  }

  // ==================== Configuration ====================

  /**
   * Get Config
   * الحصول على التكوين
   */
  getConfig(): SyncConfig {
    return this.syncManager.getConfig();
  }

  /**
   * Update Config
   * تحديث التكوين
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.syncManager.updateConfig(config);
  }

  /**
   * Set Auto Sync Interval
   * تعيين فترة المزامنة التلقائية
   */
  setAutoSyncInterval(minutes: number): void {
    this.updateConfig({ autoSyncInterval: minutes });
  }

  /**
   * Set Max Retries
   * تعيين الحد الأقصى لعدد المحاولات
   */
  setMaxRetries(retries: number): void {
    this.updateConfig({ maxRetries: retries });
  }

  /**
   * Set Default Conflict Strategy
   * تعيين استراتيجية حل التعارضات الافتراضية
   */
  setDefaultConflictStrategy(strategy: ConflictResolutionStrategy): void {
    this.updateConfig({ defaultConflictStrategy: strategy });
  }

  // ==================== Helper Methods ====================

  /**
   * Get Last Sync Time
   * الحصول على وقت آخر مزامنة
   */
  getLastSyncTime(): Date | undefined {
    return this.getStatistics().lastSuccessfulSync;
  }

  /**
   * Get Time Since Last Sync
   * الحصول على الوقت منذ آخر مزامنة (بالدقائق)
   */
  getTimeSinceLastSync(): number | null {
    const lastSync = this.getLastSyncTime();
    if (!lastSync) {
      return null;
    }

    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    return Math.floor(diff / 60000); // تحويل إلى دقائق
  }

  /**
   * Should Sync
   * هل يجب المزامنة؟
   */
  shouldSync(): boolean {
    // إذا كانت المزامنة جارية، لا نحتاج للمزامنة
    if (this.isSyncing()) {
      return false;
    }

    // إذا لم توجد عمليات معلقة، لا نحتاج للمزامنة
    if (!this.hasPendingOperations()) {
      return false;
    }

    return true;
  }

  /**
   * Get Sync Summary
   * الحصول على ملخص المزامنة
   */
  getSyncSummary(): {
    status: SyncStatus;
    pendingOperations: number;
    failedOperations: number;
    unresolvedConflicts: number;
    lastSync?: Date;
    timeSinceLastSync?: number;
    autoSyncEnabled: boolean;
  } {
    const stats = this.getStatistics();
    const config = this.getConfig();

    return {
      status: this.getStatus(),
      pendingOperations: stats.pendingOperations,
      failedOperations: this.getFailedOperations().length,
      unresolvedConflicts: stats.unresolvedConflicts,
      lastSync: stats.lastSuccessfulSync,
      timeSinceLastSync: this.getTimeSinceLastSync() || undefined,
      autoSyncEnabled: config.autoSync,
    };
  }
}
