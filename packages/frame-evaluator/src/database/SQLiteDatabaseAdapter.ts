/**
 * محول قاعدة بيانات SQLite
 * 
 * يوفر تكامل مع قواعد بيانات SQLite
 */

import {
  DatabaseAdapter,
  FrameEvaluationRecord,
  QueryOptions,
  QueryResult,
  DatabaseHelpers,
} from './DatabaseAdapter';
import { FrameData } from '../types';

/**
 * واجهة SQLite Database (متوافقة مع better-sqlite3 و expo-sqlite)
 */
export interface SQLiteDatabase {
  prepare(sql: string): SQLiteStatement;
  exec(sql: string): void;
  close(): void;
}

export interface SQLiteStatement {
  run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: any[]): any;
  all(...params: any[]): any[];
  finalize(): void;
}

/**
 * محول SQLite
 */
export class SQLiteDatabaseAdapter implements DatabaseAdapter {
  private db: SQLiteDatabase;
  private tableName: string;

  constructor(db: SQLiteDatabase, tableName: string = 'frame_evaluations') {
    this.db = db;
    this.tableName = tableName;
    this.initializeTable();
  }

  /**
   * إنشاء الجدول إذا لم يكن موجوداً
   */
  private initializeTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        hiveId TEXT,
        frameId TEXT,
        userId TEXT,
        side TEXT NOT NULL CHECK(side IN ('A', 'B')),
        honeyPercentage REAL NOT NULL CHECK(honeyPercentage >= 0 AND honeyPercentage <= 100),
        broodPercentage REAL NOT NULL CHECK(broodPercentage >= 0 AND broodPercentage <= 100),
        beeBreadPercentage REAL NOT NULL CHECK(beeBreadPercentage >= 0 AND beeBreadPercentage <= 100),
        emptyPercentage REAL NOT NULL CHECK(emptyPercentage >= 0 AND emptyPercentage <= 100),
        broodAge TEXT NOT NULL,
        isValid INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        images TEXT,
        metadata TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_hiveId ON ${this.tableName}(hiveId);
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_frameId ON ${this.tableName}(frameId);
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_userId ON ${this.tableName}(userId);
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_createdAt ON ${this.tableName}(createdAt);
    `;

    this.db.exec(sql);
  }

  /**
   * حفظ تقييم جديد
   */
  async saveEvaluation(
    data: FrameData,
    metadata?: {
      hiveId?: string;
      frameId?: string;
      userId?: string;
      notes?: string;
      images?: string[];
    }
  ): Promise<FrameEvaluationRecord> {
    const record = DatabaseHelpers.frameDataToRecord(data, metadata);
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO ${this.tableName} (
        id, hiveId, frameId, userId, side,
        honeyPercentage, broodPercentage, beeBreadPercentage, emptyPercentage,
        broodAge, isValid, notes, images, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(
      record.id,
      record.hiveId || null,
      record.frameId || null,
      record.userId || null,
      record.side,
      record.honeyPercentage,
      record.broodPercentage,
      record.beeBreadPercentage,
      record.emptyPercentage,
      record.broodAge,
      record.isValid ? 1 : 0,
      record.notes || null,
      record.images ? JSON.stringify(record.images) : null,
      record.metadata ? JSON.stringify(record.metadata) : null,
      now,
      now
    );

    return {
      ...record,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * الحصول على تقييم بالمعرف
   */
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const row = stmt.get(id);

    return row ? this.rowToRecord(row) : null;
  }

  /**
   * الحصول على آخر تقييم
   */
  async getLatestEvaluation(filters?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
  }): Promise<FrameEvaluationRecord | null> {
    const { clause, params } = DatabaseHelpers.buildWhereClause(filters as any, '?');
    const sql = `
      SELECT * FROM ${this.tableName}
      ${clause}
      ORDER BY createdAt DESC
      LIMIT 1
    `;

    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params);

    return row ? this.rowToRecord(row) : null;
  }

  /**
   * الحصول على تاريخ التقييمات
   */
  async getEvaluationHistory(
    filters?: {
      hiveId?: string;
      frameId?: string;
      userId?: string;
    },
    options?: QueryOptions
  ): Promise<QueryResult<FrameEvaluationRecord>> {
    const { clause, params } = DatabaseHelpers.buildWhereClause(filters as any, '?');
    const orderBy = DatabaseHelpers.buildOrderByClause(options?.orderBy);
    const limitOffset = DatabaseHelpers.buildLimitOffsetClause(options);

    // الحصول على العدد الإجمالي
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${clause}`;
    const countStmt = this.db.prepare(countSql);
    const { total } = countStmt.get(...params);

    // الحصول على البيانات
    const dataSql = `
      SELECT * FROM ${this.tableName}
      ${clause}
      ${orderBy}
      ${limitOffset}
    `;
    const dataStmt = this.db.prepare(dataSql);
    const rows = dataStmt.all(...params);

    const data = rows.map(row => this.rowToRecord(row));
    const hasMore = options?.limit ? (options.offset || 0) + data.length < total : false;

    return { data, total, hasMore };
  }

  /**
   * تحديث تقييم موجود
   */
  async updateEvaluation(
    id: string,
    data: Partial<FrameData>,
    metadata?: {
      notes?: string;
      images?: string[];
    }
  ): Promise<FrameEvaluationRecord> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.side !== undefined) {
      updates.push('side = ?');
      params.push(data.side);
    }
    if (data.honeyPercentage !== undefined) {
      updates.push('honeyPercentage = ?');
      params.push(data.honeyPercentage);
    }
    if (data.broodPercentage !== undefined) {
      updates.push('broodPercentage = ?');
      params.push(data.broodPercentage);
    }
    if (data.beeBreadPercentage !== undefined) {
      updates.push('beeBreadPercentage = ?');
      params.push(data.beeBreadPercentage);
    }
    if (data.emptyPercentage !== undefined) {
      updates.push('emptyPercentage = ?');
      params.push(data.emptyPercentage);
    }
    if (data.broodAge !== undefined) {
      updates.push('broodAge = ?');
      params.push(data.broodAge);
    }
    if (data.isValid !== undefined) {
      updates.push('isValid = ?');
      params.push(data.isValid ? 1 : 0);
    }
    if (metadata?.notes !== undefined) {
      updates.push('notes = ?');
      params.push(metadata.notes);
    }
    if (metadata?.images !== undefined) {
      updates.push('images = ?');
      params.push(JSON.stringify(metadata.images));
    }

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());

    params.push(id);

    const sql = `
      UPDATE ${this.tableName}
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(...params);

    const updated = await this.getEvaluation(id);
    if (!updated) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    return updated;
  }

  /**
   * حذف تقييم
   */
  async deleteEvaluation(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * البحث في التقييمات
   */
  async searchEvaluations(
    query: string,
    options?: QueryOptions
  ): Promise<QueryResult<FrameEvaluationRecord>> {
    const searchPattern = `%${query}%`;
    const orderBy = DatabaseHelpers.buildOrderByClause(options?.orderBy);
    const limitOffset = DatabaseHelpers.buildLimitOffsetClause(options);

    // الحصول على العدد الإجمالي
    const countSql = `
      SELECT COUNT(*) as total FROM ${this.tableName}
      WHERE notes LIKE ? OR id LIKE ? OR hiveId LIKE ? OR frameId LIKE ?
    `;
    const countStmt = this.db.prepare(countSql);
    const { total } = countStmt.get(searchPattern, searchPattern, searchPattern, searchPattern);

    // الحصول على البيانات
    const dataSql = `
      SELECT * FROM ${this.tableName}
      WHERE notes LIKE ? OR id LIKE ? OR hiveId LIKE ? OR frameId LIKE ?
      ${orderBy}
      ${limitOffset}
    `;
    const dataStmt = this.db.prepare(dataSql);
    const rows = dataStmt.all(searchPattern, searchPattern, searchPattern, searchPattern);

    const data = rows.map(row => this.rowToRecord(row));
    const hasMore = options?.limit ? (options.offset || 0) + data.length < total : false;

    return { data, total, hasMore };
  }

  /**
   * الحصول على إحصائيات
   */
  async getStatistics(filters?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalEvaluations: number;
    averageHoney: number;
    averageBrood: number;
    averageBeeBread: number;
    mostCommonBroodAge: string;
  }> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.hiveId) {
      conditions.push('hiveId = ?');
      params.push(filters.hiveId);
    }
    if (filters?.frameId) {
      conditions.push('frameId = ?');
      params.push(filters.frameId);
    }
    if (filters?.userId) {
      conditions.push('userId = ?');
      params.push(filters.userId);
    }
    if (filters?.startDate) {
      conditions.push('createdAt >= ?');
      params.push(filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      conditions.push('createdAt <= ?');
      params.push(filters.endDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        COUNT(*) as totalEvaluations,
        AVG(honeyPercentage) as averageHoney,
        AVG(broodPercentage) as averageBrood,
        AVG(beeBreadPercentage) as averageBeeBread,
        broodAge as mostCommonBroodAge
      FROM ${this.tableName}
      ${whereClause}
      GROUP BY broodAge
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `;

    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params);

    return {
      totalEvaluations: result?.totalEvaluations || 0,
      averageHoney: result?.averageHoney || 0,
      averageBrood: result?.averageBrood || 0,
      averageBeeBread: result?.averageBeeBread || 0,
      mostCommonBroodAge: result?.mostCommonBroodAge || 'MIXED',
    };
  }

  /**
   * تحويل صف قاعدة البيانات إلى سجل
   */
  private rowToRecord(row: any): FrameEvaluationRecord {
    return {
      id: row.id,
      hiveId: row.hiveId,
      frameId: row.frameId,
      userId: row.userId,
      side: row.side,
      honeyPercentage: row.honeyPercentage,
      broodPercentage: row.broodPercentage,
      beeBreadPercentage: row.beeBreadPercentage,
      emptyPercentage: row.emptyPercentage,
      broodAge: row.broodAge,
      isValid: row.isValid === 1,
      notes: row.notes,
      images: row.images ? JSON.parse(row.images) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
