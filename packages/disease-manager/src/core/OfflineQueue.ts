/**
 * Offline Queue System
 * نظام قائمة العمليات المعلقة
 */

import type { DatabaseAdapter } from '../database/types';
import type {
  Operation,
  OperationInput,
  OperationStatus,
  EntityType,
  OperationType,
} from '../types/sync';

/**
 * Offline Queue
 * قائمة العمليات المعلقة للمزامنة
 */
export class OfflineQueue {
  private operations: Map<string, Operation> = new Map();
  private database?: DatabaseAdapter;
  private tableName = 'offline_operations';

  /**
   * Constructor
   */
  constructor(database?: DatabaseAdapter) {
    this.database = database;
  }

  /**
   * Initialize
   * تهيئة القائمة من قاعدة البيانات
   */
  async initialize(): Promise<void> {
    if (!this.database) {
      return;
    }

    try {
      // تحميل العمليات المعلقة من قاعدة البيانات
      const operations = await this.database.query<Operation>(this.tableName, {
        where: [
          { field: 'status', operator: '=', value: 'pending' },
          { field: 'status', operator: '=', value: 'failed' },
        ],
        orderBy: [{ field: 'createdAt', direction: 'asc' }],
      });

      // تحويل التواريخ من strings إلى Date objects
      operations.forEach((op) => {
        op.createdAt = new Date(op.createdAt);
        if (op.lastAttemptAt) {
          op.lastAttemptAt = new Date(op.lastAttemptAt);
        }
        this.operations.set(op.id, op);
      });
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
    }
  }

  /**
   * Add Operation
   * إضافة عملية جديدة إلى القائمة
   */
  async addOperation(input: OperationInput): Promise<Operation> {
    const operation: Operation = {
      id: this.generateId(),
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      data: input.data,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      metadata: input.metadata,
    };

    // إضافة إلى الذاكرة
    this.operations.set(operation.id, operation);

    // حفظ في قاعدة البيانات
    if (this.database) {
      try {
        await this.database.create(this.tableName, operation);
      } catch (error) {
        console.error('Failed to save operation to database:', error);
      }
    }

    return operation;
  }

  /**
   * Get Operation
   * الحصول على عملية بالمعرف
   */
  getOperation(id: string): Operation | undefined {
    return this.operations.get(id);
  }

  /**
   * Get All Operations
   * الحصول على جميع العمليات
   */
  getAllOperations(): Operation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Get Pending Operations
   * الحصول على العمليات المعلقة
   */
  getPendingOperations(): Operation[] {
    return this.getAllOperations().filter((op) => op.status === 'pending');
  }

  /**
   * Get Failed Operations
   * الحصول على العمليات الفاشلة
   */
  getFailedOperations(): Operation[] {
    return this.getAllOperations().filter((op) => op.status === 'failed');
  }

  /**
   * Get Operations by Entity
   * الحصول على العمليات حسب الكيان
   */
  getOperationsByEntity(
    entityType: EntityType,
    entityId: string
  ): Operation[] {
    return this.getAllOperations().filter(
      (op) => op.entityType === entityType && op.entityId === entityId
    );
  }

  /**
   * Get Operations by Type
   * الحصول على العمليات حسب النوع
   */
  getOperationsByType(type: OperationType): Operation[] {
    return this.getAllOperations().filter((op) => op.type === type);
  }

  /**
   * Update Operation Status
   * تحديث حالة العملية
   */
  async updateOperationStatus(
    id: string,
    status: OperationStatus,
    error?: string
  ): Promise<void> {
    const operation = this.operations.get(id);
    if (!operation) {
      throw new Error(`Operation not found: ${id}`);
    }

    operation.status = status;
    operation.lastAttemptAt = new Date();
    if (status === 'syncing' || status === 'failed') {
      operation.attempts += 1;
    }
    if (error) {
      operation.error = error;
    }

    // تحديث في قاعدة البيانات
    if (this.database) {
      try {
        await this.database.update(this.tableName, id, operation);
      } catch (error) {
        console.error('Failed to update operation in database:', error);
      }
    }
  }

  /**
   * Remove Operation
   * إزالة عملية من القائمة
   */
  async removeOperation(id: string): Promise<void> {
    const operation = this.operations.get(id);
    if (!operation) {
      return;
    }

    // إزالة من الذاكرة
    this.operations.delete(id);

    // حذف من قاعدة البيانات
    if (this.database) {
      try {
        await this.database.delete(this.tableName, id);
      } catch (error) {
        console.error('Failed to delete operation from database:', error);
      }
    }
  }

  /**
   * Clear Completed Operations
   * مسح العمليات المكتملة
   */
  async clearCompletedOperations(): Promise<number> {
    const completedOps = this.getAllOperations().filter(
      (op) => op.status === 'completed'
    );

    for (const op of completedOps) {
      await this.removeOperation(op.id);
    }

    return completedOps.length;
  }

  /**
   * Clear All Operations
   * مسح جميع العمليات
   */
  async clearAllOperations(): Promise<void> {
    const allIds = Array.from(this.operations.keys());

    for (const id of allIds) {
      await this.removeOperation(id);
    }
  }

  /**
   * Get Queue Size
   * الحصول على حجم القائمة
   */
  getQueueSize(): number {
    return this.operations.size;
  }

  /**
   * Get Pending Count
   * الحصول على عدد العمليات المعلقة
   */
  getPendingCount(): number {
    return this.getPendingOperations().length;
  }

  /**
   * Get Failed Count
   * الحصول على عدد العمليات الفاشلة
   */
  getFailedCount(): number {
    return this.getFailedOperations().length;
  }

  /**
   * Has Pending Operations
   * هل توجد عمليات معلقة؟
   */
  hasPendingOperations(): boolean {
    return this.getPendingCount() > 0;
  }

  /**
   * Retry Failed Operations
   * إعادة محاولة العمليات الفاشلة
   */
  async retryFailedOperations(): Promise<void> {
    const failedOps = this.getFailedOperations();

    for (const op of failedOps) {
      op.status = 'pending';
      op.error = undefined;

      if (this.database) {
        try {
          await this.database.update(this.tableName, op.id, op);
        } catch (error) {
          console.error('Failed to retry operation:', error);
        }
      }
    }
  }

  /**
   * Get Statistics
   * الحصول على الإحصائيات
   */
  getStatistics(): {
    total: number;
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
  } {
    const operations = this.getAllOperations();

    return {
      total: operations.length,
      pending: operations.filter((op) => op.status === 'pending').length,
      syncing: operations.filter((op) => op.status === 'syncing').length,
      completed: operations.filter((op) => op.status === 'completed').length,
      failed: operations.filter((op) => op.status === 'failed').length,
    };
  }

  /**
   * Generate ID
   * توليد معرف فريد
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
