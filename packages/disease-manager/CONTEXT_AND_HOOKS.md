# React Context و Hooks

دليل استخدام React Context و Hooks في مكتبة `@kingdom-of-bees/disease-manager`.

## المحتويات

- [نظرة عامة](#نظرة-عامة)
- [DiseaseManagerProvider](#diseasemanagerprovider)
- [useDiseaseManager](#usediseasemanager)
- [useDiseases](#usediseases)
- [useTreatments](#usetreatments)
- [useDiagnosis](#usediagnosis)
- [أمثلة كاملة](#أمثلة-كاملة)

## نظرة عامة

المكتبة توفر React Context و Hooks لتسهيل استخدام جميع الوظائف في تطبيقات React.

### الميزات الرئيسية

- ✅ **Context موحد**: إدارة حالة المكتبة بشكل مركزي
- ✅ **Hooks متخصصة**: Hooks لكل مجال (أمراض، علاجات، تشخيص)
- ✅ **Type Safety**: TypeScript كامل مع أنواع قوية
- ✅ **دعم I18n**: ترجمة تلقائية حسب اللغة المختارة
- ✅ **Offline Support**: دعم كامل للعمل أوفلاين

## DiseaseManagerProvider

Context Provider الرئيسي للمكتبة. يجب وضعه في جذر التطبيق.

### الاستخدام الأساسي

```tsx
import { DiseaseManagerProvider } from '@kingdom-of-bees/disease-manager';
import { IndexedDBAdapter } from '@kingdom-of-bees/disease-manager';
import { WebPlatformAdapter } from '@kingdom-of-bees/disease-manager';

function App() {
  return (
    <DiseaseManagerProvider
      config={{
        database: new IndexedDBAdapter(),
        platform: new WebPlatformAdapter(),
        userId: 'user-123',
        offlineMode: false,
      }}
    >
      <MyApp />
    </DiseaseManagerProvider>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | المكونات الفرعية |
| `config` | `DiseaseManagerConfig` | ❌ | التكوين الأولي (يمكن التهيئة لاحقاً) |

### DiseaseManagerConfig

```typescript
interface DiseaseManagerConfig {
  database: DatabaseAdapter;    // محول قاعدة البيانات
  platform: PlatformAdapter;     // محول المنصة
  userId?: string;               // معرف المستخدم
  offlineMode?: boolean;         // تفعيل وضع الأوفلاين
}
```

## useDiseaseManager

Hook رئيسي للوصول إلى جميع وظائف المكتبة.

### الاستخدام

```tsx
import { useDiseaseManager } from '@kingdom-of-bees/disease-manager';

function MyComponent() {
  const {
    config,
    state,
    diseaseService,
    treatmentService,
    diagnosisService,
    initialize,
    toggleOfflineMode,
    setUserId,
    clearError,
    isInitialized,
    isOffline,
    error,
  } = useDiseaseManager();

  // تهيئة المكتبة
  useEffect(() => {
    if (!isInitialized) {
      initialize({
        database: new IndexedDBAdapter(),
        platform: new WebPlatformAdapter(),
      });
    }
  }, [isInitialized, initialize]);

  return (
    <div>
      <p>الحالة: {isInitialized ? 'جاهز' : 'جاري التهيئة...'}</p>
      <p>الوضع: {isOffline ? 'أوفلاين' : 'أونلاين'}</p>
      {error && <p>خطأ: {error}</p>}
    </div>
  );
}
```

### القيم المُرجعة

| Property | Type | Description |
|----------|------|-------------|
| `config` | `DiseaseManagerConfig \| null` | التكوين الحالي |
| `state` | `DiseaseManagerState` | الحالة الحالية |
| `diseaseService` | `typeof DiseaseService` | خدمة الأمراض |
| `treatmentService` | `typeof TreatmentService` | خدمة العلاجات |
| `diagnosisService` | `DiagnosisService \| null` | خدمة التشخيص |
| `initialize` | `Function` | تهيئة المكتبة |
| `toggleOfflineMode` | `Function` | تبديل وضع الأوفلاين |
| `setUserId` | `Function` | تحديث معرف المستخدم |
| `clearError` | `Function` | مسح الخطأ |
| `isInitialized` | `boolean` | هل تم التهيئة |
| `isOffline` | `boolean` | هل في وضع الأوفلاين |
| `error` | `string \| undefined` | رسالة الخطأ |

## useDiseases

Hook متخصص للعمل مع الأمراض.

### الاستخدام

```tsx
import { useDiseases } from '@kingdom-of-bees/disease-manager';

function DiseasesList() {
  const {
    diseases,
    allDiseases,
    loading,
    error,
    search,
    getDiseaseById,
    filterByCategory,
    filterBySeverity,
    getMostPrevalent,
    getMostDangerous,
  } = useDiseases({
    category: 'brood',
    minSeverity: 3,
    searchQuery: 'تعفن',
  });

  return (
    <div>
      <h2>الأمراض ({diseases.length})</h2>
      {diseases.map(disease => (
        <div key={disease.id}>
          <h3>{disease.name.ar}</h3>
          <p>{disease.description.ar}</p>
        </div>
      ))}
    </div>
  );
}
```

### Options

```typescript
interface UseDiseasesOptions {
  category?: DiseaseCategory;     // الفئة
  minSeverity?: number;           // الحد الأدنى لمستوى الخطورة
  searchQuery?: string;           // نص البحث
  locale?: Locale;                // اللغة (افتراضياً من I18n)
}
```

### القيم المُرجعة

| Property | Type | Description |
|----------|------|-------------|
| `diseases` | `Disease[]` | قائمة الأمراض المفلترة |
| `allDiseases` | `Disease[]` | جميع الأمراض |
| `loading` | `boolean` | حالة التحميل |
| `error` | `string \| null` | رسالة الخطأ |
| `search` | `Function` | البحث عن أمراض |
| `getDiseaseById` | `Function` | الحصول على مرض بالمعرف |
| `filterByCategory` | `Function` | فلترة حسب الفئة |
| `filterBySeverity` | `Function` | فلترة حسب مستوى الخطورة |
| `getMostPrevalent` | `Function` | الحصول على الأمراض الأكثر انتشاراً |
| `getMostDangerous` | `Function` | الحصول على الأمراض الأكثر خطورة |

## useTreatments

Hook متخصص للعمل مع العلاجات.

### الاستخدام

```tsx
import { useTreatments } from '@kingdom-of-bees/disease-manager';

function TreatmentsList() {
  const {
    treatments,
    allTreatments,
    loading,
    error,
    search,
    getTreatmentById,
    filterByType,
    getOrganic,
    getHoneySafe,
    compare,
  } = useTreatments({
    type: 'organic',
    diseaseId: 'american-foulbrood',
  });

  return (
    <div>
      <h2>العلاجات ({treatments.length})</h2>
      {treatments.map(treatment => (
        <div key={treatment.id}>
          <h3>{treatment.name.ar}</h3>
          <p>{treatment.description.ar}</p>
        </div>
      ))}
    </div>
  );
}
```

### Options

```typescript
interface UseTreatmentsOptions {
  type?: TreatmentType;                // نوع العلاج
  applicationMethod?: ApplicationMethod; // طريقة التطبيق
  diseaseId?: string;                   // معرف المرض
  searchQuery?: string;                 // نص البحث
  locale?: Locale;                      // اللغة (افتراضياً من I18n)
}
```

### القيم المُرجعة

| Property | Type | Description |
|----------|------|-------------|
| `treatments` | `Treatment[]` | قائمة العلاجات المفلترة |
| `allTreatments` | `Treatment[]` | جميع العلاجات |
| `loading` | `boolean` | حالة التحميل |
| `error` | `string \| null` | رسالة الخطأ |
| `search` | `Function` | البحث عن علاجات |
| `getTreatmentById` | `Function` | الحصول على علاج بالمعرف |
| `filterByType` | `Function` | فلترة حسب النوع |
| `filterByApplicationMethod` | `Function` | فلترة حسب طريقة التطبيق |
| `getForDisease` | `Function` | الحصول على علاجات لمرض معين |
| `getChemical` | `Function` | الحصول على العلاجات الكيميائية |
| `getOrganic` | `Function` | الحصول على العلاجات العضوية |
| `getBiological` | `Function` | الحصول على العلاجات البيولوجية |
| `getMechanical` | `Function` | الحصول على العلاجات الميكانيكية |
| `getHoneySafe` | `Function` | الحصول على العلاجات الآمنة للعسل |
| `compare` | `Function` | مقارنة علاجات |

## useDiagnosis

Hook متخصص للتشخيص.

### الاستخدام

```tsx
import { useDiagnosis } from '@kingdom-of-bees/disease-manager';

function DiagnosisPage() {
  const {
    session,
    loading,
    error,
    startSession,
    addSymptom,
    removeSymptom,
    updateSymptom,
    addImage,
    removeImage,
    analyze,
    saveResults,
    endSession,
    isActive,
    symptomCount,
    imageCount,
    canAnalyze,
  } = useDiagnosis();

  const handleStartDiagnosis = async () => {
    await startSession({
      hiveId: 'hive-123',
      category: 'brood',
    });
  };

  const handleAddSymptom = () => {
    addSymptom({
      symptomId: 'discolored-larvae',
      severity: 4,
    });
  };

  const handleAnalyze = async () => {
    const result = await analyze();
    if (result) {
      console.log('النتائج:', result);
      await saveResults();
    }
  };

  return (
    <div>
      {!isActive ? (
        <button onClick={handleStartDiagnosis}>بدء التشخيص</button>
      ) : (
        <div>
          <p>الأعراض: {symptomCount}</p>
          <p>الصور: {imageCount}</p>
          <button onClick={handleAddSymptom}>إضافة عرض</button>
          <button onClick={handleAnalyze} disabled={!canAnalyze}>
            تحليل
          </button>
          <button onClick={endSession}>إنهاء</button>
        </div>
      )}
    </div>
  );
}
```

### القيم المُرجعة

| Property | Type | Description |
|----------|------|-------------|
| `session` | `DiagnosisSession \| null` | الجلسة الحالية |
| `loading` | `boolean` | حالة التحميل |
| `error` | `string \| null` | رسالة الخطأ |
| `startSession` | `Function` | بدء جلسة تشخيص جديدة |
| `addSymptom` | `Function` | إضافة عرض |
| `removeSymptom` | `Function` | إزالة عرض |
| `updateSymptom` | `Function` | تحديث عرض |
| `addImage` | `Function` | إضافة صورة |
| `removeImage` | `Function` | إزالة صورة |
| `analyze` | `Function` | تحليل الأعراض |
| `saveResults` | `Function` | حفظ النتائج |
| `endSession` | `Function` | إنهاء الجلسة |
| `clearError` | `Function` | مسح الخطأ |
| `isActive` | `boolean` | هل الجلسة نشطة |
| `symptomCount` | `number` | عدد الأعراض |
| `imageCount` | `number` | عدد الصور |
| `canAnalyze` | `boolean` | هل يمكن التحليل |

## أمثلة كاملة

### مثال 1: تطبيق بسيط لعرض الأمراض

```tsx
import React from 'react';
import {
  DiseaseManagerProvider,
  useDiseaseManager,
  useDiseases,
  IndexedDBAdapter,
  WebPlatformAdapter,
} from '@kingdom-of-bees/disease-manager';

function App() {
  return (
    <DiseaseManagerProvider>
      <DiseasesApp />
    </DiseaseManagerProvider>
  );
}

function DiseasesApp() {
  const { initialize, isInitialized } = useDiseaseManager();
  const { diseases, search } = useDiseases();
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (!isInitialized) {
      initialize({
        database: new IndexedDBAdapter(),
        platform: new WebPlatformAdapter(),
      });
    }
  }, [isInitialized, initialize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = search(searchQuery);
    console.log('نتائج البحث:', results);
  };

  if (!isInitialized) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1>أمراض النحل</h1>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مرض..."
        />
        <button type="submit">بحث</button>
      </form>

      <div>
        {diseases.map(disease => (
          <div key={disease.id}>
            <h2>{disease.name.ar}</h2>
            <p>{disease.description.ar}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

### مثال 2: تطبيق تشخيص تفاعلي

```tsx
import React from 'react';
import {
  DiseaseManagerProvider,
  useDiagnosis,
  useDiseases,
} from '@kingdom-of-bees/disease-manager';

function DiagnosisApp() {
  const {
    session,
    startSession,
    addSymptom,
    analyze,
    saveResults,
    endSession,
    isActive,
    canAnalyze,
  } = useDiagnosis();

  const { diseases } = useDiseases();
  const [result, setResult] = React.useState(null);

  const handleStart = async () => {
    await startSession({
      hiveId: 'hive-123',
      category: 'brood',
    });
  };

  const handleAddSymptom = (symptomId: string) => {
    addSymptom({
      symptomId,
      severity: 3,
    });
  };

  const handleAnalyze = async () => {
    const diagnosisResult = await analyze();
    setResult(diagnosisResult);
    if (diagnosisResult) {
      await saveResults();
    }
  };

  const handleEnd = () => {
    endSession();
    setResult(null);
  };

  return (
    <div>
      <h1>تشخيص أمراض النحل</h1>

      {!isActive ? (
        <button onClick={handleStart}>بدء التشخيص</button>
      ) : (
        <div>
          <h2>اختر الأعراض</h2>
          {/* قائمة الأعراض */}
          <button onClick={() => handleAddSymptom('symptom-1')}>
            عرض 1
          </button>
          <button onClick={() => handleAddSymptom('symptom-2')}>
            عرض 2
          </button>

          <button onClick={handleAnalyze} disabled={!canAnalyze}>
            تحليل
          </button>
          <button onClick={handleEnd}>إنهاء</button>
        </div>
      )}

      {result && (
        <div>
          <h2>النتائج</h2>
          <p>الأمراض المحتملة:</p>
          <ul>
            {result.possibleDiseases.map(pd => (
              <li key={pd.disease.id}>
                {pd.disease.name.ar} - احتمالية: {pd.probability}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DiagnosisApp;
```

### مثال 3: مقارنة العلاجات

```tsx
import React from 'react';
import {
  DiseaseManagerProvider,
  useTreatments,
} from '@kingdom-of-bees/disease-manager';

function TreatmentComparison() {
  const {
    treatments,
    getOrganic,
    getChemical,
    compare,
  } = useTreatments();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      const comparison = compare(selectedIds);
      console.log('المقارنة:', comparison);
    }
  };

  return (
    <div>
      <h1>مقارنة العلاجات</h1>

      <div>
        <h2>العلاجات العضوية</h2>
        {getOrganic().map(treatment => (
          <label key={treatment.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(treatment.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds([...selectedIds, treatment.id]);
                } else {
                  setSelectedIds(selectedIds.filter(id => id !== treatment.id));
                }
              }}
            />
            {treatment.name.ar}
          </label>
        ))}
      </div>

      <button 
        onClick={handleCompare}
        disabled={selectedIds.length !== 2}
      >
        قارن
      </button>
    </div>
  );
}

export default TreatmentComparison;
```

## الخلاصة

React Context و Hooks توفر طريقة سهلة وقوية لاستخدام جميع وظائف المكتبة في تطبيقات React. جميع الـ Hooks تدعم:

- ✅ TypeScript كامل
- ✅ ترجمة تلقائية
- ✅ دعم الأوفلاين
- ✅ معالجة الأخطاء
- ✅ حالات التحميل

للمزيد من المعلومات، راجع:
- [README.md](./README.md) - دليل المكتبة الرئيسي
- [QUICK_START.md](./QUICK_START.md) - دليل البدء السريع
- [API Documentation](./docs/api/) - توثيق API الكامل
