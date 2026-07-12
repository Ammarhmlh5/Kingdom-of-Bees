/**
 * SQLite Database Adapter
 * محول قاعدة بيانات SQLite للتطبيقات الأصلية والأوفلاين
 * يتطلب Node.js environment أو React Native
 */

import Database from 'better-sqlite3';
import type {
  DatabaseAdapter,
  DatabaseConfig,
  QueryFilter,
  Transaction,
  BatchUpdate,
  WhereClause,
} from './types';

/**
 * محول SQLite
 */
export class SQLiteDatabaseAdapter implements DatabaseAdapter {
  private db: Database.Database | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    const dbName = config.connection.dbName || 'disease-manager.db';

    this.db = new Database(dbName);

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables if they don't exist
    this.createTables();
  }

  private createTables(): void {
    if (!this.db) return;

    // Diseases table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS diseases (
        id TEXT PRIMARY KEY,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_fr TEXT,
        scientific_name TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        causes TEXT NOT NULL,
        seasonality TEXT NOT NULL,
        regions TEXT NOT NULL,
        images TEXT NOT NULL,
        treatments TEXT NOT NULL,
        prevention_measures TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Treatments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS treatments (
        id TEXT PRIMARY KEY,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_fr TEXT,
        type TEXT NOT NULL,
        target_diseases TEXT NOT NULL,
        dosage TEXT NOT NULL,
        duration TEXT NOT NULL,
        safety_period INTEGER NOT NULL,
        cost TEXT NOT NULL,
        instructions_ar TEXT NOT NULL,
        instructions_en TEXT NOT NULL,
        instructions_fr TEXT,
        side_effects TEXT,
        contraindications TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hives table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hives (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Disease records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS disease_records (
        id TEXT PRIMARY KEY,
        hive_id TEXT NOT NULL,
        disease_id TEXT NOT NULL,
        diagnosis_date TEXT NOT NULL,
        severity TEXT NOT NULL,
        diagnosis_method TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        status TEXT NOT NULL,
        resolved_date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE
      )
    `);

    // Treatment schedules table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS treatment_schedules (
        id TEXT PRIMARY KEY,
        hive_id TEXT NOT NULL,
        treatment_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE
      )
    `);

    // Alerts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        scheduled_for TEXT,
        expires_at TEXT,
        related_entity TEXT,
        actions TEXT,
        status TEXT NOT NULL
      )
    `);
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async create<T>(table: string, data: T & { id?: string }): Promise<string> {
    if (!this.db) throw new Error('Database not connected');

    const id = data.id || crypto.randomUUID();
    const record = { ...data, id };

    const keys = Object.keys(record);
    const values = Object.values(record).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    const placeholders = keys.map(() => '?').join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;

    this.db.prepare(query).run(...values);
    return id;
  }

  async read<T>(table: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not connected');

    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const row = this.db.prepare(query).get(id);

    if (!row) return null;

    return this.deserializeRow(row) as T;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const keys = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = ?
    `;

    this.db.prepare(query).run(...values, id);
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const query = `DELETE FROM ${table} WHERE id = ?`;
    this.db.prepare(query).run(id);
  }

  async query<T>(table: string, filter: QueryFilter): Promise<T[]> {
    if (!this.db) throw new Error('Database not connected');

    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];

    // تطبيق Where clauses
    if (filter.where && filter.where.length > 0) {
      const whereClauses: string[] = [];
      for (const clause of filter.where) {
        const { sql, value } = this.buildWhereClause(clause);
        whereClauses.push(sql);
        if (value !== undefined) {
          params.push(value);
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
      query += ` LIMIT ?`;
      params.push(filter.limit);
    }
    if (filter.offset) {
      query += ` OFFSET ?`;
      params.push(filter.offset);
    }

    const rows = this.db.prepare(query).all(...params);
    return rows.map((row) => this.deserializeRow(row)) as T[];
  }

  private buildWhereClause(clause: WhereClause): { sql: string; value?: any } {
    const field = clause.field;

    switch (clause.operator) {
      case 'eq':
        return { sql: `${field} = ?`, value: clause.value };
      case 'ne':
        return { sql: `${field} != ?`, value: clause.value };
      case 'gt':
        return { sql: `${field} > ?`, value: clause.value };
      case 'gte':
        return { sql: `${field} >= ?`, value: clause.value };
      case 'lt':
        return { sql: `${field} < ?`, value: clause.value };
      case 'lte':
        return { sql: `${field} <= ?`, value: clause.value };
      case 'in':
        const inPlaceholders = clause.value.map(() => '?').join(', ');
        return { sql: `${field} IN (${inPlaceholders})`, value: clause.value };
      case 'not_in':
        const notInPlaceholders = clause.value.map(() => '?').join(', ');
        return { sql: `${field} NOT IN (${notInPlaceholders})`, value: clause.value };
      case 'like':
        return { sql: `${field} LIKE ?`, value: `%${clause.value}%` };
      case 'ilike':
        // SQLite doesn't have ILIKE, use LIKE with COLLATE NOCASE
        return { sql: `${field} LIKE ? COLLATE NOCASE`, value: `%${clause.value}%` };
      case 'is_null':
        return { sql: `${field} IS NULL` };
      case 'is_not_null':
        return { sql: `${field} IS NOT NULL` };
      default:
        return { sql: `${field} = ?`, value: clause.value };
    }
  }

  private deserializeRow(row: Record<string, any>): any {
    const result: any = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  async count(table: string, filter?: QueryFilter): Promise<number> {
    if (!this.db) throw new Error('Database not connected');

    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const params: any[] = [];

    if (filter?.where && filter.where.length > 0) {
      const whereClauses: string[] = [];
      for (const clause of filter.where) {
        const { sql, value } = this.buildWhereClause(clause);
        whereClauses.push(sql);
        if (value !== undefined) {
          params.push(value);
        }
      }
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const result = this.db.prepare(query).get(...params) as { count: number };
    return result.count;
  }

  async beginTransaction(): Promise<Transaction> {
    if (!this.db) throw new Error('Database not connected');

    this.db.prepare('BEGIN').run();

    return {
      create: async <T extends Record<string, any>>(table: string, data: T) => {
        return await this.create(table, data);
      },
      update: async <T>(table: string, id: string, data: Partial<T>) => {
        await this.update(table, id, data);
      },
      delete: async (table: string, id: string) => {
        await this.delete(table, id);
      },
      commit: async () => {
        if (this.db) {
          this.db.prepare('COMMIT').run();
        }
      },
      rollback: async () => {
        if (this.db) {
          this.db.prepare('ROLLBACK').run();
        }
      },
    };
  }

  async batchCreate<T>(table: string, items: T[]): Promise<string[]> {
    if (!this.db) throw new Error('Database not connected');

    const records = items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));

    if (records.length === 0) return [];

    const keys = Object.keys(records[0]);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;

    const stmt = this.db.prepare(query);
    const transaction = this.db.transaction((records: any[]) => {
      for (const record of records) {
        const values = Object.values(record).map((v) =>
          typeof v === 'object' ? JSON.stringify(v) : v
        );
        stmt.run(...values);
      }
    });

    transaction(records);

    return records.map((r) => r.id);
  }

  async batchUpdate<T>(table: string, updates: BatchUpdate<T>[]): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const transaction = this.db.transaction(() => {
      for (const update of updates) {
        const keys = Object.keys(update.data);
        const values = Object.values(update.data).map((v) =>
          typeof v === 'object' ? JSON.stringify(v) : v
        );
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `
          UPDATE ${table}
          SET ${setClause}
          WHERE id = ?
        `;

        this.db!.prepare(query).run(...values, update.id);
      }
    });

    transaction();
  }

  async batchDelete(table: string, ids: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const placeholders = ids.map(() => '?').join(', ');
    const query = `DELETE FROM ${table} WHERE id IN (${placeholders})`;

    this.db.prepare(query).run(...ids);
  }
}
