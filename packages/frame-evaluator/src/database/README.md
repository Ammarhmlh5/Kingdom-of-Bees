# محولات قاعدة البيانات - Database Adapters

هذا المجلد يحتوي على محولات قاعدة البيانات لحفظ واسترجاع تقييمات الإطارات.

## المحولات المتاحة

### 1. SQLiteDatabaseAdapter
محول لقواعد بيانات SQLite (متوافق مع better-sqlite3 و expo-sqlite)

```typescript
import { SQLiteDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';
import Database from 'better-sqlite3';

const db = new Database('evaluations.db');
const adapter = new SQLiteDatabaseAdapter(db);

// حفظ تقييم
const evaluation = await adapter.saveEvaluation(frameData, {
  hiveId: 'hive_1',
  frameId: 'frame_1',
  userId: 'user_1',
  notes: 'تقييم جيد',
  images: ['image1.jpg'],
});

// الحصول على تقييم
const retrieved = await adapter.getEvaluation(evaluation.id);

// الحصول على آخر تقييم
const latest = await adapter.getLatestEvaluation({ hiveId: 'hive_1' });

// الحصول على تاريخ التقييمات
const history = await adapter.getEvaluationHistory(
  { hiveId: 'hive_1' },
  { limit: 10, offset: 0 }
);

// البحث
const results = await adapter.searchEvaluations('تقييم');

// الإحصائيات
const stats = await adapter.getStatistics({ hiveId: 'hive_1' });
```

### 2. PostgreSQLDatabaseAdapter
محول لقواعد بيانات PostgreSQL (متوافق مع pg و node-postgres)

```typescript
import { PostgreSQLDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'beekeeping',
  user: 'postgres',
  password: 'password',
});

await client.connect();

const adapter = new PostgreSQLDatabaseAdapter(client);
await adapter.initializeTable(); // إنشاء الجدول إذا لم يكن موجوداً

// استخدام نفس API كـ SQLite
const evaluation = await adapter.saveEvaluation(frameData, metadata);
```

### 3. SupabaseDatabaseAdapter
محول لـ Supabase (PostgreSQL مع ميزات إضافية)

```typescript
import { SupabaseDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

const adapter = new SupabaseDatabaseAdapter(supabase);

// استخدام نفس API
const evaluation = await adapter.saveEvaluation(frameData, metadata);
```

## مخططات قاعدة البيانات

يمكنك استخدام ملفات SQL الجاهزة لإنشاء الجداول:

- `schemas/sqlite.sql` - مخطط SQLite
- `schemas/postgresql.sql` - مخطط PostgreSQL
- `schemas/supabase.sql` - مخطط Supabase مع Row Level Security

## واجهة DatabaseAdapter

جميع المحولات تنفذ نفس الواجهة:

```typescript
interface DatabaseAdapter {
  saveEvaluation(data: FrameData, metadata?: {...}): Promise<FrameEvaluationRecord>;
  getEvaluation(id: string): Promise<FrameEvaluationRecord | null>;
  getLatestEvaluation(filters?: {...}): Promise<FrameEvaluationRecord | null>;
  getEvaluationHistory(filters?: {...}, options?: QueryOptions): Promise<QueryResult<FrameEvaluationRecord>>;
  updateEvaluation(id: string, data: Partial<FrameData>, metadata?: {...}): Promise<FrameEvaluationRecord>;
  deleteEvaluation(id: string): Promise<boolean>;
  searchEvaluations(query: string, options?: QueryOptions): Promise<QueryResult<FrameEvaluationRecord>>;
  getStatistics(filters?: {...}): Promise<{...}>;
}
```

## DatabaseHelpers

دوال مساعدة للتحويل بين الأنواع:

```typescript
import { DatabaseHelpers } from '@kingdom-of-bees/frame-evaluator';

// تحويل FrameData إلى سجل قاعدة بيانات
const record = DatabaseHelpers.frameDataToRecord(frameData, metadata);

// تحويل سجل قاعدة بيانات إلى FrameData
const frameData = DatabaseHelpers.recordToFrameData(record);

// توليد معرف فريد
const id = DatabaseHelpers.generateId();

// بناء جمل SQL
const { clause, params } = DatabaseHelpers.buildWhereClause(filters, '$');
const orderBy = DatabaseHelpers.buildOrderByClause({ field: 'createdAt', direction: 'desc' });
const limitOffset = DatabaseHelpers.buildLimitOffsetClause({ limit: 10, offset: 0 });
```

## أمثلة متقدمة

### استخدام مع React

```typescript
import { useState, useEffect } from 'react';
import { SQLiteDatabaseAdapter, FrameData } from '@kingdom-of-bees/frame-evaluator';

function useFrameEvaluations(adapter: SQLiteDatabaseAdapter, hiveId: string) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvaluations() {
      const result = await adapter.getEvaluationHistory(
        { hiveId },
        { limit: 20, offset: 0 }
      );
      setEvaluations(result.data);
      setLoading(false);
    }
    loadEvaluations();
  }, [adapter, hiveId]);

  const saveEvaluation = async (data: FrameData) => {
    const saved = await adapter.saveEvaluation(data, { hiveId });
    setEvaluations([saved, ...evaluations]);
    return saved;
  };

  return { evaluations, loading, saveEvaluation };
}
```

### استخدام مع React Native

```typescript
import * as SQLite from 'expo-sqlite';
import { SQLiteDatabaseAdapter } from '@kingdom-of-bees/frame-evaluator';

// فتح قاعدة البيانات
const db = SQLite.openDatabase('evaluations.db');

// إنشاء المحول
const adapter = new SQLiteDatabaseAdapter(db);

// استخدام المحول
const evaluation = await adapter.saveEvaluation(frameData, metadata);
```

## الأمان

### Supabase Row Level Security (RLS)

عند استخدام Supabase، يتم تطبيق Row Level Security تلقائياً:

- المستخدمون يمكنهم قراءة تقييماتهم فقط
- المستخدمون يمكنهم إدراج تقييماتهم فقط
- المستخدمون يمكنهم تحديث تقييماتهم فقط
- المستخدمون يمكنهم حذف تقييماتهم فقط

راجع `schemas/supabase.sql` للمزيد من التفاصيل.

## الاختبارات

جميع المحولات مختبرة بشكل شامل:

```bash
npm test -- --testPathPattern="database"
```

## الترخيص

MIT
