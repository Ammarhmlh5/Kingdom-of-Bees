/**
 * Supabase Database Adapter
 * محول قاعدة بيانات Supabase السحابية
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  DatabaseAdapter,
  DatabaseConfig,
  QueryFilter,
  Transaction,
  BatchUpdate,
  WhereClause,
} from './types';

/**
 * محول Supabase
 */
export class SupabaseDatabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    if (!config.connection.url || !config.connection.apiKey) {
      throw new Error('Supabase URL and API key are required');
    }

    this.client = createClient(config.connection.url, config.connection.apiKey);
  }

  async disconnect(): Promise<void> {
    // Supabase client doesn't need explicit disconnect
    this.client = null;
  }

  async create<T>(table: string, data: T & { id?: string }): Promise<string> {
    if (!this.client) throw new Error('Database not connected');

    const id = data.id || crypto.randomUUID();
    const record = { ...data, id };

    const { error } = await this.client.from(table).insert(record);

    if (error) throw new Error(`Failed to create record: ${error.message}`);

    return id;
  }

  async read<T>(table: string, id: string): Promise<T | null> {
    if (!this.client) throw new Error('Database not connected');

    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to read record: ${error.message}`);
    }

    return data as T;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.client) throw new Error('Database not connected');

    const { error } = await this.client
      .from(table)
      .update(data)
      .eq('id', id);

    if (error) throw new Error(`Failed to update record: ${error.message}`);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.client) throw new Error('Database not connected');

    const { error } = await this.client.from(table).delete().eq('id', id);

    if (error) throw new Error(`Failed to delete record: ${error.message}`);
  }

  async query<T>(table: string, filter: QueryFilter): Promise<T[]> {
    if (!this.client) throw new Error('Database not connected');

    let query = this.client.from(table).select('*');

    // تطبيق Where clauses
    if (filter.where && filter.where.length > 0) {
      query = this.applyWhereClause(query, filter.where);
    }

    // تطبيق الترتيب
    if (filter.orderBy && filter.orderBy.length > 0) {
      for (const order of filter.orderBy) {
        query = query.order(order.field, { ascending: order.direction === 'asc' });
      }
    }

    // تطبيق Limit و Offset
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 1000) - 1);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to query records: ${error.message}`);

    return (data || []) as T[];
  }

  private applyWhereClause(query: any, whereClauses: WhereClause[]): any {
    for (const clause of whereClauses) {
      switch (clause.operator) {
        case 'eq':
          query = query.eq(clause.field, clause.value);
          break;
        case 'ne':
          query = query.neq(clause.field, clause.value);
          break;
        case 'gt':
          query = query.gt(clause.field, clause.value);
          break;
        case 'gte':
          query = query.gte(clause.field, clause.value);
          break;
        case 'lt':
          query = query.lt(clause.field, clause.value);
          break;
        case 'lte':
          query = query.lte(clause.field, clause.value);
          break;
        case 'in':
          query = query.in(clause.field, clause.value);
          break;
        case 'like':
          query = query.like(clause.field, `%${clause.value}%`);
          break;
        case 'ilike':
          query = query.ilike(clause.field, `%${clause.value}%`);
          break;
        case 'is_null':
          query = query.is(clause.field, null);
          break;
        case 'is_not_null':
          query = query.not(clause.field, 'is', null);
          break;
      }
    }
    return query;
  }

  async count(table: string, filter?: QueryFilter): Promise<number> {
    if (!this.client) throw new Error('Database not connected');

    let query = this.client.from(table).select('*', { count: 'exact', head: true });

    if (filter?.where && filter.where.length > 0) {
      query = this.applyWhereClause(query, filter.where);
    }

    const { count, error } = await query;

    if (error) throw new Error(`Failed to count records: ${error.message}`);

    return count || 0;
  }

  async beginTransaction(): Promise<Transaction> {
    if (!this.client) throw new Error('Database not connected');

    // Supabase doesn't support explicit transactions in the client
    // We'll simulate it by collecting operations and executing them
    const operations: Array<() => Promise<void>> = [];
    let committed = false;

    return {
      create: async <T extends Record<string, any>>(table: string, data: T) => {
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
        committed = true;
      },
      rollback: async () => {
        if (!committed) {
          console.warn('Rollback not fully supported in Supabase client');
        }
      },
    };
  }

  async batchCreate<T>(table: string, items: T[]): Promise<string[]> {
    if (!this.client) throw new Error('Database not connected');

    const records = items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));

    const { error } = await this.client.from(table).insert(records);

    if (error) throw new Error(`Failed to batch create: ${error.message}`);

    return records.map((r) => r.id);
  }

  async batchUpdate<T>(table: string, updates: BatchUpdate<T>[]): Promise<void> {
    if (!this.client) throw new Error('Database not connected');

    // Supabase doesn't support batch updates directly
    // Execute updates sequentially
    for (const update of updates) {
      await this.update(table, update.id, update.data);
    }
  }

  async batchDelete(table: string, ids: string[]): Promise<void> {
    if (!this.client) throw new Error('Database not connected');

    const { error } = await this.client.from(table).delete().in('id', ids);

    if (error) throw new Error(`Failed to batch delete: ${error.message}`);
  }
}
