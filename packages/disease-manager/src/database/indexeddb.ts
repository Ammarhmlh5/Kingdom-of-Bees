/**
 * IndexedDB Database Adapter
 * محول قاعدة بيانات IndexedDB للويب
 */

import { openDB, IDBPDatabase } from 'idb';
import type {
  DatabaseAdapter,
  DatabaseConfig,
  QueryFilter,
  Transaction,
  BatchUpdate,
  WhereClause,
} from './types';

/**
 * محول IndexedDB
 */
export class IndexedDBAdapter implements DatabaseAdapter {
  private db: IDBPDatabase | null = null;
  private dbName: string = 'disease-manager';
  private version: number = 1;

  async connect(config: DatabaseConfig): Promise<void> {
    this.dbName = config.connection.dbName || this.dbName;
    this.version = config.connection.version || this.version;

    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        // إنشاء الجداول الأساسية
        if (!db.objectStoreNames.contains('diseases')) {
          db.createObjectStore('diseases', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('treatments')) {
          db.createObjectStore('treatments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('hives')) {
          db.createObjectStore('hives', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('disease_records')) {
          db.createObjectStore('disease_records', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('treatment_schedules')) {
          db.createObjectStore('treatment_schedules', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('alerts')) {
          db.createObjectStore('alerts', { keyPath: 'id' });
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async create<T>(table: string, data: T & { id?: string }): Promise<string> {
    if (!this.db) throw new Error('Database not connected');

    const id = data.id || `${Date.now()}-${Math.random()}`;
    const record = { ...data, id };

    await this.db.put(table, record);
    return id;
  }

  async read<T>(table: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not connected');

    const result = await this.db.get(table, id);
    return result || null;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const existing = await this.db.get(table, id);
    if (!existing) throw new Error(`Record not found: ${id}`);

    const updated = { ...existing, ...data, id };
    await this.db.put(table, updated);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    await this.db.delete(table, id);
  }

  async query<T>(table: string, filter: QueryFilter): Promise<T[]> {
    if (!this.db) throw new Error('Database not connected');

    let results = await this.db.getAll(table);

    // تطبيق Where clauses
    if (filter.where && filter.where.length > 0) {
      results = results.filter((item) => this.matchesFilter(item, filter.where!));
    }

    // تطبيق الترتيب
    if (filter.orderBy && filter.orderBy.length > 0) {
      results.sort((a, b) => {
        for (const order of filter.orderBy!) {
          const aVal = (a as any)[order.field];
          const bVal = (b as any)[order.field];
          if (aVal < bVal) return order.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return order.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // تطبيق Offset و Limit
    if (filter.offset) {
      results = results.slice(filter.offset);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results as T[];
  }

  private matchesFilter(item: any, whereClauses: WhereClause[]): boolean {
    return whereClauses.every((clause) => {
      const value = item[clause.field];
      switch (clause.operator) {
        case 'eq':
          return value === clause.value;
        case 'ne':
          return value !== clause.value;
        case 'gt':
          return value > clause.value;
        case 'gte':
          return value >= clause.value;
        case 'lt':
          return value < clause.value;
        case 'lte':
          return value <= clause.value;
        case 'in':
          return Array.isArray(clause.value) && clause.value.includes(value);
        case 'not_in':
          return Array.isArray(clause.value) && !clause.value.includes(value);
        case 'like':
          return typeof value === 'string' && value.includes(clause.value);
        case 'is_null':
          return value === null || value === undefined;
        case 'is_not_null':
          return value !== null && value !== undefined;
        default:
          return true;
      }
    });
  }

  async count(table: string, filter?: QueryFilter): Promise<number> {
    if (!this.db) throw new Error('Database not connected');

    if (!filter || !filter.where) {
      return await this.db.count(table);
    }

    const results = await this.query(table, filter);
    return results.length;
  }

  async beginTransaction(): Promise<Transaction> {
    if (!this.db) throw new Error('Database not connected');

    const operations: Array<() => Promise<void>> = [];

    return {
      create: async <T>(table: string, data: T) => {
        const id = await this.create(table, data);
        return id;
      },
      update: async <T>(table: string, id: string, data: Partial<T>) => {
        operations.push(() => this.update(table, id, data));
      },
      delete: async (table: string, id: string) => {
        operations.push(() => this.delete(table, id));
      },
      commit: async () => {
        for (const op of operations) {
          await op();
        }
      },
      rollback: async () => {
        // IndexedDB لا يدعم rollback بشكل مباشر
        console.warn('Rollback not fully supported in IndexedDB');
      },
    };
  }

  async batchCreate<T>(table: string, items: T[]): Promise<string[]> {
    const ids: string[] = [];
    for (const item of items) {
      const id = await this.create(table, item);
      ids.push(id);
    }
    return ids;
  }

  async batchUpdate<T>(table: string, updates: BatchUpdate<T>[]): Promise<void> {
    for (const update of updates) {
      await this.update(table, update.id, update.data);
    }
  }

  async batchDelete(table: string, ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(table, id);
    }
  }
}
