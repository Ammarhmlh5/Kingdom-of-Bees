/**
 * محول قاعدة بيانات PostgreSQL
 * 
 * يوفر تكامل مع قواعد بيانات PostgreSQL
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
 * واجهة PostgreSQL Client (متوافقة مع pg و node-postgres)
 */
export interface PostgreSQLClient {
  query(sql: string, params?: unknown[]): Promise<PostgreSQLResult>;
  end(): Promise<void>;
}

export interface PostgreSQLResult {
  rows: unknown[];
  rowCount: number;
}

/**
 * محول PostgreSQL
 */
export class PostgreSQLDatabaseAdapter implements DatabaseAdapter {
  private client: PostgreSQLClient;
  private tableName: string;

  constructor(client: PostgreSQLClient, tableName: string = 'frame_evaluations') {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * إنشاء الجدول إذا لم يكن موجوداً
   */
  async initializeTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        "hiveId" TEXT,
        "frameId" TEXT,
        "userId" TEXT,
        side TEXT NOT NULL CHECK(side IN ('A', 'B')),
        "honeyPercentage" DECIMAL(5,2) NOT NULL CHECK("honeyPercentage" >= 0 AND "honeyPercentage" <= 100),
        "broodPercentage" DECIMAL(5,2) NOT NULL CHECK("broodPercentage" >= 0 AND "broodPercentage" <= 100),
        "beeBreadPercentage" DECIMAL(5,2) NOT NULL CHECK("beeBreadPercentage" >= 0 AND "beeBreadPercentage" <= 100),
        "emptyPercentage" DECIMAL(5,2) NOT NULL CHECK("emptyPercentage" >= 0 AND "emptyPercentage" <= 100),
        "broodAge" TEXT NOT NULL,
        "isValid" BOOLEAN NOT NULL DEFAULT true,
        notes TEXT,
        images JSONB,
        metadata JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_hiveId ON ${this.tableName}("hiveId");
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_frameId ON ${this.tableName}("frameId");
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_userId ON ${this.tableName}("userId");
      CREATE INDEX IF NOT EXISTS idx_${this.tableName}_createdAt ON ${this.tableName}("createdAt");
      
      -- Trigger لتحديث updatedAt تلقائياً
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_${this.tableName}_updated_at ON ${this.tableName};
      CREATE TRIGGER update_${this.tableName}_updated_at
        BEFORE UPDATE ON ${this.tableName}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await this.client.query(sql);
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
    const now = new Date();

    const sql = `
      INSERT INTO ${this.tableName} (
        id, "hiveId", "frameId", "userId", side,
        "honeyPercentage", "broodPercentage", "beeBreadPercentage", "emptyPercentage",
        "broodAge", "isValid", notes, images, metadata, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const result = await this.client.query(sql, [
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
      record.isValid,
      record.notes || null,
      record.images ? JSON.stringify(record.images) : null,
      record.metadata ? JSON.stringify(record.metadata) : null,
      now,
      now,
    ]);

    return this.rowToRecord(result.rows[0]);
  }

  /**
   * الحصول على تقييم بالمعرف
   */
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.client.query(sql, [id]);

    return result.rows.length > 0 ? this.rowToRecord(result.rows[0]) : null;
  }

  /**
   * الحصول على آخر تقييم
   */
  async getLatestEvaluation(filters?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
  }): Promise<FrameEvaluationRecord | null> {
    const { clause, params } = DatabaseHelpers.buildWhereClause(filters as Partial<FrameEvaluationRecord>, '$');
    const sql = `
      SELECT * FROM ${this.tableName}
      ${clause}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const result = await this.client.query(sql, params);
    return result.rows.length > 0 ? this.rowToRecord(result.rows[0]) : null;
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
    const { clause, params } = DatabaseHelpers.buildWhereClause(filters as Partial<FrameEvaluationRecord>, '$');
    const orderBy = DatabaseHelpers.buildOrderByClause(options?.orderBy);
    const limitOffset = DatabaseHelpers.buildLimitOffsetClause(options);

    // الحصول على العدد الإجمالي
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${clause}`;
    const countResult = await this.client.query(countSql, params);
    const total = parseInt(String((countResult.rows[0] as { total: number }).total), 10);

    // الحصول على البيانات
    const dataSql = `
      SELECT * FROM ${this.tableName}
      ${clause}
      ${orderBy}
      ${limitOffset}
    `;
    const dataResult = await this.client.query(dataSql, params);

    const data = dataResult.rows.map(row => this.rowToRecord(row));
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
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.side !== undefined) {
      updates.push(`side = $${paramIndex++}`);
      params.push(data.side);
    }
    if (data.honeyPercentage !== undefined) {
      updates.push(`"honeyPercentage" = $${paramIndex++}`);
      params.push(data.honeyPercentage);
    }
    if (data.broodPercentage !== undefined) {
      updates.push(`"broodPercentage" = $${paramIndex++}`);
      params.push(data.broodPercentage);
    }
    if (data.beeBreadPercentage !== undefined) {
      updates.push(`"beeBreadPercentage" = $${paramIndex++}`);
      params.push(data.beeBreadPercentage);
    }
    if (data.emptyPercentage !== undefined) {
      updates.push(`"emptyPercentage" = $${paramIndex++}`);
      params.push(data.emptyPercentage);
    }
    if (data.broodAge !== undefined) {
      updates.push(`"broodAge" = $${paramIndex++}`);
      params.push(data.broodAge);
    }
    if (data.isValid !== undefined) {
      updates.push(`"isValid" = $${paramIndex++}`);
      params.push(data.isValid);
    }
    if (metadata?.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(metadata.notes);
    }
    if (metadata?.images !== undefined) {
      updates.push(`images = $${paramIndex++}`);
      params.push(JSON.stringify(metadata.images));
    }

    params.push(id);

    const sql = `
      UPDATE ${this.tableName}
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.client.query(sql, params);

    if (result.rows.length === 0) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    return this.rowToRecord(result.rows[0]);
  }

  /**
   * حذف تقييم
   */
  async deleteEvaluation(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.client.query(sql, [id]);

    return result.rowCount > 0;
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
      WHERE notes ILIKE $1 OR id ILIKE $1 OR "hiveId" ILIKE $1 OR "frameId" ILIKE $1
    `;
    const countResult = await this.client.query(countSql, [searchPattern]);
    const total = parseInt(String((countResult.rows[0] as { total: number }).total), 10);

    // الحصول على البيانات
    const dataSql = `
      SELECT * FROM ${this.tableName}
      WHERE notes ILIKE $1 OR id ILIKE $1 OR "hiveId" ILIKE $1 OR "frameId" ILIKE $1
      ${orderBy}
      ${limitOffset}
    `;
    const dataResult = await this.client.query(dataSql, [searchPattern]);

    const data = dataResult.rows.map(row => this.rowToRecord(row));
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
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.hiveId) {
      conditions.push(`"hiveId" = $${paramIndex++}`);
      params.push(filters.hiveId);
    }
    if (filters?.frameId) {
      conditions.push(`"frameId" = $${paramIndex++}`);
      params.push(filters.frameId);
    }
    if (filters?.userId) {
      conditions.push(`"userId" = $${paramIndex++}`);
      params.push(filters.userId);
    }
    if (filters?.startDate) {
      conditions.push(`"createdAt" >= $${paramIndex++}`);
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      conditions.push(`"createdAt" <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        COUNT(*) as "totalEvaluations",
        AVG("honeyPercentage") as "averageHoney",
        AVG("broodPercentage") as "averageBrood",
        AVG("beeBreadPercentage") as "averageBeeBread",
        MODE() WITHIN GROUP (ORDER BY "broodAge") as "mostCommonBroodAge"
      FROM ${this.tableName}
      ${whereClause}
    `;

    const result = await this.client.query(sql, params);
    const row = result.rows[0] as {
      totalEvaluations: number;
      averageHoney: number;
      averageBrood: number;
      averageBeeBread: number;
      mostCommonBroodAge: string;
    };

    return {
      totalEvaluations: parseInt(String(row.totalEvaluations || 0), 10),
      averageHoney: parseFloat(String(row.averageHoney || 0)),
      averageBrood: parseFloat(String(row.averageBrood || 0)),
      averageBeeBread: parseFloat(String(row.averageBeeBread || 0)),
      mostCommonBroodAge: row.mostCommonBroodAge || 'MIXED',
    };
  }

  /**
   * تحويل صف قاعدة البيانات إلى سجل
   */
  private rowToRecord(row: unknown): FrameEvaluationRecord {
    const r = row as {
      id: string;
      hiveId?: string;
      frameId?: string;
      userId?: string;
      side: 'A' | 'B';
      honeyPercentage: number;
      broodPercentage: number;
      beeBreadPercentage: number;
      emptyPercentage: number;
      broodAge: string;
      isValid: boolean;
      notes?: string;
      images?: string;
      metadata?: string;
      createdAt: Date;
      updatedAt: Date;
    };

    return {
      id: r.id,
      hiveId: r.hiveId,
      frameId: r.frameId,
      userId: r.userId,
      side: r.side,
      honeyPercentage: r.honeyPercentage,
      broodPercentage: r.broodPercentage,
      beeBreadPercentage: r.beeBreadPercentage,
      emptyPercentage: r.emptyPercentage,
      broodAge: r.broodAge,
      isValid: r.isValid,
      notes: r.notes,
      images: r.images ? JSON.parse(r.images) : undefined,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    };
  }
}
