/**
 * واجهة محول قاعدة البيانات
 * 
 * توفر واجهة موحدة للتعامل مع قواعد بيانات مختلفة
 * (SQLite, PostgreSQL, Supabase, إلخ)
 */

import { FrameData } from '../types';

/**
 * سجل التقييم في قاعدة البيانات
 */
export interface FrameEvaluationRecord {
  /** معرف فريد */
  id: string;
  /** معرف الخلية */
  hiveId?: string;
  /** معرف الإطار */
  frameId?: string;
  /** معرف المستخدم */
  userId?: string;
  /** جانب الإطار */
  side: 'A' | 'B';
  /** نسبة العسل */
  honeyPercentage: number;
  /** نسبة الحضنة */
  broodPercentage: number;
  /** نسبة خبز النحل */
  beeBreadPercentage: number;
  /** نسبة الفراغ */
  emptyPercentage: number;
  /** عمر الحضنة */
  broodAge: string;
  /** هل البيانات صحيحة */
  isValid: boolean;
  /** ملاحظات */
  notes?: string;
  /** صور */
  images?: string[];
  /** بيانات إضافية (JSON) */
  metadata?: Record<string, any>;
  /** تاريخ الإنشاء */
  createdAt: Date;
  /** تاريخ التحديث */
  updatedAt: Date;
}

/**
 * خيارات الاستعلام
 */
export interface QueryOptions {
  /** الحد الأقصى لعدد النتائج */
  limit?: number;
  /** الإزاحة */
  offset?: number;
  /** الترتيب */
  orderBy?: {
    field: keyof FrameEvaluationRecord;
    direction: 'asc' | 'desc';
  };
  /** الفلترة */
  where?: Partial<FrameEvaluationRecord>;
}

/**
 * نتيجة الاستعلام مع pagination
 */
export interface QueryResult<T> {
  /** البيانات */
  data: T[];
  /** العدد الإجمالي */
  total: number;
  /** هل هناك صفحة تالية */
  hasMore: boolean;
}

/**
 * واجهة محول قاعدة البيانات
 */
export interface DatabaseAdapter {
  /**
   * حفظ تقييم جديد
   */
  saveEvaluation(data: FrameData, metadata?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
    notes?: string;
    images?: string[];
  }): Promise<FrameEvaluationRecord>;

  /**
   * الحصول على تقييم بالمعرف
   */
  getEvaluation(id: string): Promise<FrameEvaluationRecord | null>;

  /**
   * الحصول على آخر تقييم
   */
  getLatestEvaluation(filters?: {
    hiveId?: string;
    frameId?: string;
    userId?: string;
  }): Promise<FrameEvaluationRecord | null>;

  /**
   * الحصول على تاريخ التقييمات
   */
  getEvaluationHistory(
    filters?: {
      hiveId?: string;
      frameId?: string;
      userId?: string;
    },
    options?: QueryOptions
  ): Promise<QueryResult<FrameEvaluationRecord>>;

  /**
   * تحديث تقييم موجود
   */
  updateEvaluation(
    id: string,
    data: Partial<FrameData>,
    metadata?: {
      notes?: string;
      images?: string[];
    }
  ): Promise<FrameEvaluationRecord>;

  /**
   * حذف تقييم
   */
  deleteEvaluation(id: string): Promise<boolean>;

  /**
   * البحث في التقييمات
   */
  searchEvaluations(
    query: string,
    options?: QueryOptions
  ): Promise<QueryResult<FrameEvaluationRecord>>;

  /**
   * الحصول على إحصائيات
   */
  getStatistics(filters?: {
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
  }>;
}

/**
 * دوال مساعدة للتحويل
 */
export class DatabaseHelpers {
  /**
   * تحويل FrameData إلى سجل قاعدة بيانات
   */
  static frameDataToRecord(
    data: FrameData,
    metadata?: {
      id?: string;
      hiveId?: string;
      frameId?: string;
      userId?: string;
      notes?: string;
      images?: string[];
    }
  ): Omit<FrameEvaluationRecord, 'createdAt' | 'updatedAt'> {
    return {
      id: metadata?.id || this.generateId(),
      hiveId: metadata?.hiveId,
      frameId: metadata?.frameId,
      userId: metadata?.userId,
      side: data.side,
      honeyPercentage: data.honeyPercentage,
      broodPercentage: data.broodPercentage,
      beeBreadPercentage: data.beeBreadPercentage,
      emptyPercentage: data.emptyPercentage,
      broodAge: String(data.broodAge),
      isValid: data.isValid,
      notes: metadata?.notes,
      images: metadata?.images,
      metadata: {},
    };
  }

  /**
   * تحويل سجل قاعدة بيانات إلى FrameData
   */
  static recordToFrameData(record: FrameEvaluationRecord): FrameData {
    return {
      side: record.side,
      honeyPercentage: record.honeyPercentage,
      broodPercentage: record.broodPercentage,
      beeBreadPercentage: record.beeBreadPercentage,
      emptyPercentage: record.emptyPercentage,
      broodAge: record.broodAge as any,
      isValid: record.isValid,
    };
  }

  /**
   * توليد معرف فريد
   */
  static generateId(): string {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * بناء جملة WHERE SQL
   */
  static buildWhereClause(
    filters?: Partial<FrameEvaluationRecord>,
    paramPrefix: string = '$'
  ): { clause: string; params: any[] } {
    if (!filters || Object.keys(filters).length === 0) {
      return { clause: '', params: [] };
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ${paramPrefix}${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  /**
   * بناء جملة ORDER BY SQL
   */
  static buildOrderByClause(
    orderBy?: {
      field: keyof FrameEvaluationRecord;
      direction: 'asc' | 'desc';
    }
  ): string {
    if (!orderBy) {
      return 'ORDER BY createdAt DESC';
    }

    return `ORDER BY ${orderBy.field} ${orderBy.direction.toUpperCase()}`;
  }

  /**
   * بناء جملة LIMIT/OFFSET SQL
   */
  static buildLimitOffsetClause(options?: QueryOptions): string {
    const parts: string[] = [];

    if (options?.limit) {
      parts.push(`LIMIT ${options.limit}`);
    }

    if (options?.offset) {
      parts.push(`OFFSET ${options.offset}`);
    }

    return parts.join(' ');
  }
}
