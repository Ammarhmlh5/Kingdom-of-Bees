/**
 * Database Adapter Types
 * تعريفات الأنواع لمحولات قواعد البيانات
 */

/**
 * أنواع قواعد البيانات المدعومة
 */
export type DatabaseType = 'supabase' | 'postgresql' | 'sqlite' | 'indexeddb';

/**
 * تكوين الاتصال
 */
export interface ConnectionConfig {
  // Supabase
  url?: string;
  apiKey?: string;

  // PostgreSQL
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;

  // SQLite/IndexedDB
  dbName?: string;
  version?: number;
}

/**
 * خيارات قاعدة البيانات
 */
export interface DatabaseOptions {
  poolSize?: number;
  timeout?: number;
  ssl?: boolean;
  cache?: boolean;
}

/**
 * تكوين قاعدة البيانات
 */
export interface DatabaseConfig {
  type: DatabaseType;
  connection: ConnectionConfig;
  options?: DatabaseOptions;
}

/**
 * عوامل المقارنة
 */
export type ComparisonOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not_in'
  | 'like'
  | 'ilike'
  | 'is_null'
  | 'is_not_null';

/**
 * شرط Where
 */
export interface WhereClause {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

/**
 * شرط الترتيب
 */
export interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * فلتر الاستعلام
 */
export interface QueryFilter {
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
  offset?: number;
}

/**
 * تحديث دفعي
 */
export interface BatchUpdate<T> {
  id: string;
  data: Partial<T>;
}

/**
 * واجهة المعاملة
 */
export interface Transaction {
  create<T>(table: string, data: T): Promise<string>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * واجهة محول قاعدة البيانات الرئيسية
 */
export interface DatabaseAdapter {
  /**
   * الاتصال بقاعدة البيانات
   */
  connect(config: DatabaseConfig): Promise<void>;

  /**
   * قطع الاتصال
   */
  disconnect(): Promise<void>;

  /**
   * إنشاء سجل جديد
   */
  create<T>(table: string, data: T): Promise<string>;

  /**
   * قراءة سجل
   */
  read<T>(table: string, id: string): Promise<T | null>;

  /**
   * تحديث سجل
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<void>;

  /**
   * حذف سجل
   */
  delete(table: string, id: string): Promise<void>;

  /**
   * استعلام متقدم
   */
  query<T>(table: string, filter: QueryFilter): Promise<T[]>;

  /**
   * عد السجلات
   */
  count(table: string, filter?: QueryFilter): Promise<number>;

  /**
   * بدء معاملة
   */
  beginTransaction(): Promise<Transaction>;

  /**
   * إنشاء دفعي
   */
  batchCreate<T>(table: string, items: T[]): Promise<string[]>;

  /**
   * تحديث دفعي
   */
  batchUpdate<T>(table: string, updates: BatchUpdate<T>[]): Promise<void>;

  /**
   * حذف دفعي
   */
  batchDelete(table: string, ids: string[]): Promise<void>;
}
