/**
 * PostgreSQL Database Adapter
 * محول قاعدة بيانات PostgreSQL للاستضافة الذاتية
 * يتطلب Node.js environment
 */

import { Pool, PoolClient } from 'pg';
import type {
  DatabaseAdapter,
  DatabaseConfig,
  QueryFilter,
  Transaction,
  BatchUpdate,
  WhereClause,
} from './types';

/**
 * محول PostgreSQL
 */
export class PostgreSQLDatabaseAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const { host, port, database, username, password } = config.connection;

    if (!host || !database || !username) {
      throw new Error('PostgreSQL host, database, and username are required');
    }

    this.pool = new Pool({
      host,
      port: port || 5432,
      database,
      user: username,
      password,
      max: config.options?.poolSize || 10,
      connectionTimeoutMillis: config.options?.timeout || 30000,
      ssl: config.options?.ssl ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async create<T>(table: string, data: T & { id?: string }): Promise<string> {
    if (!this.pool) throw new Error('Database not connected');

    const id = data.id || crypto.randomUUID();
    const record = { ...data, id };

    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING id
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  async read<T>(table: string, id: string): Promise<T | null> {
    if (!this.pool) throw new Error('Database not connected');

    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    return result.rows.length > 0 ? (result.rows[0] as T) : null;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');

    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
    `;

    await this.pool.query(query, [...values, id]);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');

    const query = `DELETE FROM ${table} WHERE id = $1`;
    await this.pool.query(query, [id]);
  }

  async query<T>(table: string, filter: QueryFilter): Promise<T[]> {
    if (!this.pool) throw new Error('Database not connected');

    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];
    let paramIndex = 1;

    // تطبيق Where clauses
    if (filter.where && filter.where.length > 0) {
      const whereClauses: string[] = [];
      for (const clause of filter.where) {
        const { sql, value } = this.buildWhereClause(clause, paramIndex);
        whereClauses.push(sql);
        if (value !== undefined) {
          params.push(value);
          paramIndex++;
        }
      }
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // تطبيق الترتيب
    if (filter.orderBy && filter.orderBy.length > 0) {
      const orderClauses = filter.orderBy.map(
        (order) => `${order.field} ${order.direction.toUpperCase()}`
      );
      query += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // تطبيق Limit و Offset
    if (filter.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filter.limit);
      paramIndex++;
    }
    if (filter.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filter.offset);
    }

    const result = await this.pool.query(query, params);
    return result.rows as T[];
  }

  private buildWhereClause(
    clause: WhereClause,
    paramIndex: number
  ): { sql: string; value?: any } {
    const field = clause.field;

    switch (clause.operator) {
      case 'eq':
        return { sql: `${field} = $${paramIndex}`, value: clause.value };
      case 'ne':
        return { sql: `${field} != $${paramIndex}`, value: clause.value };
      case 'gt':
        return { sql: `${field} > $${paramIndex}`, value: clause.value };
      case 'gte':
        return { sql: `${field} >= $${paramIndex}`, value: clause.value };
      case 'lt':
        return { sql: `${field} < $${paramIndex}`, value: clause.value };
      case 'lte':
        return { sql: `${field} <= $${paramIndex}`, value: clause.value };
      case 'in':
        return { sql: `${field} = ANY($${paramIndex})`, value: clause.value };
      case 'not_in':
        return { sql: `${field} != ALL($${paramIndex})`, value: clause.value };
      case 'like':
        return { sql: `${field} LIKE $${paramIndex}`, value: `%${clause.value}%` };
      case 'ilike':
        return { sql: `${field} ILIKE $${paramIndex}`, value: `%${clause.value}%` };
      case 'is_null':
        return { sql: `${field} IS NULL` };
      case 'is_not_null':
        return { sql: `${field} IS NOT NULL` };
      default:
        return { sql: `${field} = $${paramIndex}`, value: clause.value };
    }
  }

  async count(table: string, filter?: QueryFilter): Promise<number> {
    if (!this.pool) throw new Error('Database not connected');

    let query = `SELECT COUNT(*) FROM ${table}`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filter?.where && filter.where.length > 0) {
      const whereClauses: string[] = [];
      for (const clause of filter.where) {
        const { sql, value } = this.buildWhereClause(clause, paramIndex);
        whereClauses.push(sql);
        if (value !== undefined) {
          params.push(value);
          paramIndex++;
        }
      }
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async beginTransaction(): Promise<Transaction> {
    if (!this.pool) throw new Error('Database not connected');

    const client = await this.pool.connect();
    await client.query('BEGIN');

    return {
      create: async <T>(table: string, data: T & { id?: string }) => {
        const id = data.id || crypto.randomUUID();
        const record = { ...data, id };

        const keys = Object.keys(record);
        const values = Object.values(record);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
          INSERT INTO ${table} (${keys.join(', ')})
          VALUES (${placeholders})
          RETURNING id
        `;

        const result = await client.query(query, values);
        return result.rows[0].id;
      },
      update: async <T>(table: string, id: string, data: Partial<T>) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const query = `
          UPDATE ${table}
          SET ${setClause}
          WHERE id = $${keys.length + 1}
        `;

        await client.query(query, [...values, id]);
      },
      delete: async (table: string, id: string) => {
        const query = `DELETE FROM ${table} WHERE id = $1`;
        await client.query(query, [id]);
      },
      commit: async () => {
        await client.query('COMMIT');
        client.release();
      },
      rollback: async () => {
        await client.query('ROLLBACK');
        client.release();
      },
    };
  }

  async batchCreate<T>(table: string, items: T[]): Promise<string[]> {
    if (!this.pool) throw new Error('Database not connected');

    const records = items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));

    if (records.length === 0) return [];

    const keys = Object.keys(records[0]);
    const values: any[] = [];
    const valuePlaceholders: string[] = [];

    records.forEach((record, recordIndex) => {
      const recordValues = keys.map((key) => (record as any)[key]);
      values.push(...recordValues);

      const placeholders = keys
        .map((_, keyIndex) => `$${recordIndex * keys.length + keyIndex + 1}`)
        .join(', ');
      valuePlaceholders.push(`(${placeholders})`);
    });

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES ${valuePlaceholders.join(', ')}
      RETURNING id
    `;

    const result = await this.pool.query(query, values);
    return result.rows.map((row) => row.id);
  }

  async batchUpdate<T>(table: string, updates: BatchUpdate<T>[]): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const update of updates) {
        const keys = Object.keys(update.data);
        const values = Object.values(update.data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

        const query = `
          UPDATE ${table}
          SET ${setClause}
          WHERE id = $${keys.length + 1}
        `;

        await client.query(query, [...values, update.id]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async batchDelete(table: string, ids: string[]): Promise<void> {
    if (!this.pool) throw new Error('Database not connected');

    const query = `DELETE FROM ${table} WHERE id = ANY($1)`;
    await this.pool.query(query, [ids]);
  }
}
