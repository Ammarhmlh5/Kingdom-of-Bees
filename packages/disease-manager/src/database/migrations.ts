/**
 * Database Migration System
 * نظام إدارة ترحيل قواعد البيانات
 * 
 * يوفر آلية لإدارة schema versions وترحيل البيانات بين قواعد البيانات
 */

import { DatabaseAdapter } from './types';

/**
 * إصدار Schema
 */
export interface SchemaVersion {
  /** رقم الإصدار */
  version: number;
  
  /** اسم الإصدار */
  name: string;
  
  /** وصف التغييرات */
  description: string;
  
  /** تاريخ الإنشاء */
  createdAt: Date;
  
  /** دالة الترقية */
  up: (db: DatabaseAdapter) => Promise<void>;
  
  /** دالة التراجع */
  down: (db: DatabaseAdapter) => Promise<void>;
}

/**
 * حالة الترحيل
 */
export interface MigrationStatus {
  /** الإصدار الحالي */
  currentVersion: number;
  
  /** آخر ترحيل */
  lastMigration?: {
    version: number;
    name: string;
    migratedAt: Date;
  };
  
  /** الترحيلات المعلقة */
  pendingMigrations: number[];
  
  /** الترحيلات المطبقة */
  appliedMigrations: number[];
}

/**
 * خيارات الترحيل
 */
export interface MigrationOptions {
  /** الإصدار المستهدف (undefined = أحدث إصدار) */
  targetVersion?: number;
  
  /** تخطي التحقق من البيانات */
  skipValidation?: boolean;
  
  /** إنشاء نسخة احتياطية قبل الترحيل */
  createBackup?: boolean;
  
  /** دالة callback للتقدم */
  onProgress?: (version: number, total: number) => void;
}

/**
 * نتيجة الترحيل
 */
export interface MigrationResult {
  /** نجح الترحيل */
  success: boolean;
  
  /** الإصدار السابق */
  fromVersion: number;
  
  /** الإصدار الجديد */
  toVersion: number;
  
  /** الترحيلات المطبقة */
  appliedMigrations: number[];
  
  /** الأخطاء */
  errors?: string[];
  
  /** الوقت المستغرق (بالميلي ثانية) */
  duration: number;
}

/**
 * مدير الترحيل
 */
export class MigrationManager {
  private migrations: Map<number, SchemaVersion> = new Map();
  private database: DatabaseAdapter;
  
  constructor(database: DatabaseAdapter) {
    this.database = database;
  }
  
  /**
   * تسجيل ترحيل
   */
  registerMigration(migration: SchemaVersion): void {
    if (this.migrations.has(migration.version)) {
      throw new Error(`Migration version ${migration.version} already registered`);
    }
    
    this.migrations.set(migration.version, migration);
  }
  
  /**
   * تسجيل عدة ترحيلات
   */
  registerMigrations(migrations: SchemaVersion[]): void {
    migrations.forEach(migration => this.registerMigration(migration));
  }
  
  /**
   * الحصول على حالة الترحيل
   */
  async getStatus(): Promise<MigrationStatus> {
    const currentVersion = await this.getCurrentVersion();
    const appliedMigrations = await this.getAppliedMigrations();
    const allVersions = Array.from(this.migrations.keys()).sort((a, b) => a - b);
    const pendingMigrations = allVersions.filter(v => v > currentVersion);
    
    const lastMigration = appliedMigrations.length > 0
      ? appliedMigrations[appliedMigrations.length - 1]
      : undefined;
    
    return {
      currentVersion,
      lastMigration,
      pendingMigrations,
      appliedMigrations: appliedMigrations.map(m => m.version),
    };
  }
  
  /**
   * تطبيق الترحيلات
   */
  async migrate(options: MigrationOptions = {}): Promise<MigrationResult> {
    const startTime = Date.now();
    const currentVersion = await this.getCurrentVersion();
    const targetVersion = options.targetVersion ?? this.getLatestVersion();
    
    if (currentVersion === targetVersion) {
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        appliedMigrations: [],
        duration: Date.now() - startTime,
      };
    }
    
    const isUpgrade = targetVersion > currentVersion;
    const migrations = this.getMigrationsToApply(currentVersion, targetVersion, isUpgrade);
    
    if (migrations.length === 0) {
      throw new Error(`No migrations found between version ${currentVersion} and ${targetVersion}`);
    }
    
    // إنشاء نسخة احتياطية إذا طلب ذلك
    if (options.createBackup) {
      await this.createBackup();
    }
    
    const appliedMigrations: number[] = [];
    const errors: string[] = [];
    
    try {
      // تطبيق الترحيلات
      for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i];
        
        try {
          if (isUpgrade) {
            await migration.up(this.database);
          } else {
            await migration.down(this.database);
          }
          
          await this.recordMigration(migration, isUpgrade);
          appliedMigrations.push(migration.version);
          
          if (options.onProgress) {
            options.onProgress(i + 1, migrations.length);
          }
        } catch (error) {
          const errorMessage = `Failed to apply migration ${migration.version}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        appliedMigrations,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: currentVersion + appliedMigrations.length * (isUpgrade ? 1 : -1),
        appliedMigrations,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }
  
  /**
   * التراجع عن آخر ترحيل
   */
  async rollback(): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion === 0) {
      throw new Error('No migrations to rollback');
    }
    
    return this.migrate({ targetVersion: currentVersion - 1 });
  }
  
  /**
   * إعادة تعيين قاعدة البيانات
   */
  async reset(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion === 0) {
      return;
    }
    
    await this.migrate({ targetVersion: 0 });
  }
  
  /**
   * الحصول على الإصدار الحالي
   */
  private async getCurrentVersion(): Promise<number> {
    try {
      const result = await this.database.query('schema_versions', {
        orderBy: { field: 'version', direction: 'desc' },
        limit: 1,
      });
      
      return result.length > 0 ? (result[0] as any).version : 0;
    } catch (error) {
      // الجدول غير موجود، نفترض الإصدار 0
      return 0;
    }
  }
  
  /**
   * الحصول على الترحيلات المطبقة
   */
  private async getAppliedMigrations(): Promise<Array<{ version: number; name: string; migratedAt: Date }>> {
    try {
      const result = await this.database.query('schema_versions', {
        orderBy: { field: 'version', direction: 'asc' },
      });
      
      return result.map((r: any) => ({
        version: r.version,
        name: r.name,
        migratedAt: new Date(r.migratedAt),
      }));
    } catch (error) {
      return [];
    }
  }
  
  /**
   * الحصول على أحدث إصدار
   */
  private getLatestVersion(): number {
    const versions = Array.from(this.migrations.keys());
    return versions.length > 0 ? Math.max(...versions) : 0;
  }
  
  /**
   * الحصول على الترحيلات المطلوب تطبيقها
   */
  private getMigrationsToApply(
    fromVersion: number,
    toVersion: number,
    isUpgrade: boolean
  ): SchemaVersion[] {
    const allVersions = Array.from(this.migrations.keys()).sort((a, b) => a - b);
    
    let versions: number[];
    if (isUpgrade) {
      versions = allVersions.filter(v => v > fromVersion && v <= toVersion);
    } else {
      versions = allVersions.filter(v => v > toVersion && v <= fromVersion).reverse();
    }
    
    return versions.map(v => this.migrations.get(v)!);
  }
  
  /**
   * تسجيل ترحيل مطبق
   */
  private async recordMigration(migration: SchemaVersion, isUpgrade: boolean): Promise<void> {
    if (isUpgrade) {
      await this.database.create('schema_versions', {
        version: migration.version,
        name: migration.name,
        description: migration.description,
        migratedAt: new Date(),
      });
    } else {
      await this.database.delete('schema_versions', migration.version.toString());
    }
  }
  
  /**
   * إنشاء نسخة احتياطية
   */
  private async createBackup(): Promise<void> {
    // TODO: تنفيذ نظام النسخ الاحتياطي
    console.log('Creating backup...');
  }
}

/**
 * الترحيلات المعرفة مسبقاً
 */
export const migrations: SchemaVersion[] = [
  {
    version: 1,
    name: 'initial_schema',
    description: 'إنشاء الجداول الأساسية',
    createdAt: new Date('2026-01-01'),
    up: async (db: DatabaseAdapter) => {
      // إنشاء جدول schema_versions
      await db.create('schema_versions', {
        version: 0,
        name: 'initial',
        description: 'Initial schema',
        migratedAt: new Date(),
      });
      
      // إنشاء الجداول الأساسية
      // (في التطبيق الفعلي، سيتم إنشاء جميع الجداول هنا)
    },
    down: async (db: DatabaseAdapter) => {
      // حذف الجداول
    },
  },
  
  {
    version: 2,
    name: 'add_hive_records',
    description: 'إضافة جداول سجلات الخلايا',
    createdAt: new Date('2026-01-15'),
    up: async (db: DatabaseAdapter) => {
      // إنشاء جداول سجلات الخلايا
    },
    down: async (db: DatabaseAdapter) => {
      // حذف جداول سجلات الخلايا
    },
  },
  
  {
    version: 3,
    name: 'add_alerts',
    description: 'إضافة جداول التنبيهات',
    createdAt: new Date('2026-02-01'),
    up: async (db: DatabaseAdapter) => {
      // إنشاء جداول التنبيهات
    },
    down: async (db: DatabaseAdapter) => {
      // حذف جداول التنبيهات
    },
  },
];

/**
 * إنشاء مدير ترحيل مع الترحيلات المعرفة مسبقاً
 */
export function createMigrationManager(database: DatabaseAdapter): MigrationManager {
  const manager = new MigrationManager(database);
  manager.registerMigrations(migrations);
  return manager;
}
