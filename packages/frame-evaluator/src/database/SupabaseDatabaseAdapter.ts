/**
 * محول قاعدة بيانات Supabase
 * 
 * يوفر تكامل مع Supabase (PostgreSQL مع ميزات إضافية)
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
 * واجهة Supabase Client
 */
export interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder;
}

export interface SupabaseQueryBuilder {
  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated' }): SupabaseQueryBuilder;
  insert(data: unknown): SupabaseQueryBuilder;
  update(data: unknown): SupabaseQueryBuilder;
  delete(): SupabaseQueryBuilder;
  eq(column: string, value: unknown): SupabaseQueryBuilder;
  ilike(column: string, pattern: string): SupabaseQueryBuilder;
  or(query: string): SupabaseQueryBuilder;
  gte(column: string, value: unknown): SupabaseQueryBuilder;
  lte(column: string, value: unknown): SupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): SupabaseQueryBuilder;
  limit(count: number): SupabaseQueryBuilder;
  range(from: number, to: number): SupabaseQueryBuilder;
  single(): Promise<SupabaseResponse>;
  then(
    onfulfilled?: (value: SupabaseResponse) => unknown,
    onrejected?: (reason: unknown) => unknown
  ): Promise<unknown>;
}

export interface SupabaseResponse {
  data: unknown;
  error: { message: string } | null;
  count?: number;
}

/**
 * محول Supabase
 */
export class SupabaseDatabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient;
  private tableName: string;

  constructor(client: SupabaseClient, tableName: string = 'frame_evaluations') {
    this.client = client;
    this.tableName = tableName;
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

    const insertData = {
      id: record.id,
      hiveId: record.hiveId || null,
      frameId: record.frameId || null,
      userId: record.userId || null,
      side: record.side,
      honeyPercentage: record.honeyPercentage,
      broodPercentage: record.broodPercentage,
      beeBreadPercentage: record.beeBreadPercentage,
      emptyPercentage: record.emptyPercentage,
      broodAge: record.broodAge,
      isValid: record.isValid,
      notes: record.notes || null,
      images: record.images || null,
      metadata: record.metadata || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const response = await this.client
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single();

    if (response.error) {
      throw new Error(`Failed to save evaluation: ${response.error.message}`);
    }

    return this.rowToRecord(response.data);
  }

  /**
   * الحصول على تقييم بالمعرف
   */
  async getEvaluation(id: string): Promise<FrameEvaluationRecord | null> {
    const response = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (response.error) {
      if (response.error.message.includes('not found')) {
        return null;
      }
      throw new Error(`Failed to get evaluation: ${response.error.message}`);
    }

    return this.rowToRecord(response.data);
  }

  /**
   * الحصول على آخر تقييم
   */
  async getLatestEvaluation(filters?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
  }): Promise<FrameEvaluationRecord | null> {
    let query = this.client.from(this.tableName).select('*');

    if (filters?.hiveId) {
      query = query.eq('hiveId', filters.hiveId);
    }
    if (filters?.frameId) {
      query = query.eq('frameId', filters.frameId);
    }
    if (filters?.userId) {
      query = query.eq('userId', filters.userId);
    }

    const response = await query
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (response.error) {
      if (response.error.message.includes('not found')) {
        return null;
      }
      throw new Error(`Failed to get latest evaluation: ${response.error.message}`);
    }

    return this.rowToRecord(response.data);
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
    let query = this.client.from(this.tableName).select('*', { count: 'exact' });

    // تطبيق الفلاتر
    if (filters?.hiveId) {
      query = query.eq('hiveId', filters.hiveId);
    }
    if (filters?.frameId) {
      query = query.eq('frameId', filters.frameId);
    }
    if (filters?.userId) {
      query = query.eq('userId', filters.userId);
    }

    // تطبيق الترتيب
    if (options?.orderBy) {
      query = query.order(options.orderBy.field, {
        ascending: options.orderBy.direction === 'asc',
      });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    // تطبيق pagination
    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const response = await query;

    if (response.error) {
      throw new Error(`Failed to get evaluation history: ${response.error.message}`);
    }

    const data = (response.data as unknown[]).map(row => this.rowToRecord(row));
    const total = response.count || 0;
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
    const updateData: Record<string, unknown> = {};

    if (data.side !== undefined) updateData.side = data.side;
    if (data.honeyPercentage !== undefined) updateData.honeyPercentage = data.honeyPercentage;
    if (data.broodPercentage !== undefined) updateData.broodPercentage = data.broodPercentage;
    if (data.beeBreadPercentage !== undefined) updateData.beeBreadPercentage = data.beeBreadPercentage;
    if (data.emptyPercentage !== undefined) updateData.emptyPercentage = data.emptyPercentage;
    if (data.broodAge !== undefined) updateData.broodAge = data.broodAge;
    if (data.isValid !== undefined) updateData.isValid = data.isValid;
    if (metadata?.notes !== undefined) updateData.notes = metadata.notes;
    if (metadata?.images !== undefined) updateData.images = metadata.images;

    const response = await this.client
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (response.error) {
      throw new Error(`Failed to update evaluation: ${response.error.message}`);
    }

    return this.rowToRecord(response.data);
  }

  /**
   * حذف تقييم
   */
  async deleteEvaluation(id: string): Promise<boolean> {
    const response = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (response.error) {
      throw new Error(`Failed to delete evaluation: ${response.error.message}`);
    }

    return true;
  }

  /**
   * البحث في التقييمات
   */
  async searchEvaluations(
    query: string,
    options?: QueryOptions
  ): Promise<QueryResult<FrameEvaluationRecord>> {
    const searchPattern = `%${query}%`;

    let supabaseQuery = this.client
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .or(`notes.ilike.${searchPattern},id.ilike.${searchPattern},hiveId.ilike.${searchPattern},frameId.ilike.${searchPattern}`);

    // تطبيق الترتيب
    if (options?.orderBy) {
      supabaseQuery = supabaseQuery.order(options.orderBy.field, {
        ascending: options.orderBy.direction === 'asc',
      });
    } else {
      supabaseQuery = supabaseQuery.order('createdAt', { ascending: false });
    }

    // تطبيق pagination
    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      supabaseQuery = supabaseQuery.range(from, to);
    }

    const response = await supabaseQuery;

    if (response.error) {
      throw new Error(`Failed to search evaluations: ${response.error.message}`);
    }

    const data = (response.data as unknown[]).map(row => this.rowToRecord(row));
    const total = response.count || 0;
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
    let query = this.client.from(this.tableName).select('*');

    // تطبيق الفلاتر
    if (filters?.hiveId) {
      query = query.eq('hiveId', filters.hiveId);
    }
    if (filters?.frameId) {
      query = query.eq('frameId', filters.frameId);
    }
    if (filters?.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte('createdAt', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('createdAt', filters.endDate.toISOString());
    }

    const response = await query;

    if (response.error) {
      throw new Error(`Failed to get statistics: ${response.error.message}`);
    }

    const records = (response.data as unknown[]).map(row => this.rowToRecord(row));

    // حساب الإحصائيات
    const totalEvaluations = records.length;
    const averageHoney = records.reduce((sum, r) => sum + r.honeyPercentage, 0) / totalEvaluations || 0;
    const averageBrood = records.reduce((sum, r) => sum + r.broodPercentage, 0) / totalEvaluations || 0;
    const averageBeeBread = records.reduce((sum, r) => sum + r.beeBreadPercentage, 0) / totalEvaluations || 0;

    // إيجاد أكثر عمر حضنة شيوعاً
    const broodAgeCounts: Record<string, number> = {};
    records.forEach(r => {
      broodAgeCounts[r.broodAge] = (broodAgeCounts[r.broodAge] || 0) + 1;
    });
    const mostCommonBroodAge = Object.entries(broodAgeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'MIXED';

    return {
      totalEvaluations,
      averageHoney,
      averageBrood,
      averageBeeBread,
      mostCommonBroodAge,
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
      images?: string[];
      metadata?: Record<string, unknown>;
      createdAt: string;
      updatedAt: string;
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
      images: r.images,
      metadata: r.metadata,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    };
  }
}
