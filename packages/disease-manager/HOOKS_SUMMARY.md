# ملخص React Context و Hooks

## ✅ ما تم إنجازه

تم إنشاء نظام كامل من React Context و Hooks لتسهيل استخدام المكتبة في تطبيقات React.

### الملفات المنشأة (6 ملفات)

1. **`src/context/DiseaseManagerContext.tsx`** - Context رئيسي
2. **`src/context/index.ts`** - تصدير Context
3. **`src/hooks/useDiseaseManager.ts`** - Hook رئيسي
4. **`src/hooks/useDiseases.ts`** - Hook للأمراض
5. **`src/hooks/useTreatments.ts`** - Hook للعلاجات
6. **`src/hooks/useDiagnosis.ts`** - Hook للتشخيص
7. **`src/hooks/index.ts`** - تصدير Hooks

### الميزات الرئيسية

#### 1. DiseaseManagerContext
- ✅ إدارة حالة المكتبة بشكل مركزي
- ✅ توفير الوصول لجميع الخدمات
- ✅ دوال التحكم (initialize, toggleOfflineMode, setUserId, clearError)
- ✅ حالات مفيدة (initialized, isOffline, userId, error)

#### 2. useDiseaseManager Hook
- ✅ الوصول الكامل إلى config و state
- ✅ الوصول إلى جميع الخدمات (diseaseService, treatmentService, diagnosisService)
- ✅ دوال التحكم في المكتبة
- ✅ حالات مختصرة (isInitialized, isOffline, error)

#### 3. useDiseases Hook
- ✅ فلترة الأمراض (category, minSeverity, searchQuery)
- ✅ دوال مساعدة (search, getDiseaseById, filterByCategory, filterBySeverity)
- ✅ دوال متقدمة (getMostPrevalent, getMostDangerous)
- ✅ دعم كامل للترجمة

#### 4. useTreatments Hook
- ✅ فلترة العلاجات (type, applicationMethod, diseaseId, searchQuery)
- ✅ دوال مساعدة (search, getTreatmentById, filterByType, filterByApplicationMethod)
- ✅ دوال متخصصة (getChemical, getOrganic, getBiological, getMechanical, getHoneySafe)
- ✅ دالة مقارنة العلاجات
- ✅ دعم كامل للترجمة

#### 5. useDiagnosis Hook
- ✅ إدارة جلسات التشخيص (startSession, endSession)
- ✅ إدارة الأعراض (addSymptom, removeSymptom, updateSymptom)
- ✅ إدارة الصور (addImage, removeImage)
- ✅ تحليل الأعراض (analyze)
- ✅ حفظ النتائج (saveResults)
- ✅ حالات مفيدة (isActive, symptomCount, imageCount, canAnalyze)

## 🎯 الفوائد

### 1. سهولة الاستخدام
```tsx
// بدلاً من
const diseases = DiseaseService.getDiseases();

// يمكنك استخدام
const { diseases } = useDiseases();
```

### 2. إدارة الحالة التلقائية
```tsx
// الـ Hook يدير الحالة تلقائياً
const { diseases, loading, error } = useDiseases();
```

### 3. فلترة ذكية
```tsx
// فلترة تلقائية حسب الخيارات
const { diseases } = useDiseases({
  category: 'brood',
  minSeverity: 3,
  searchQuery: 'تعفن',
});
```

### 4. دعم I18n تلقائي
```tsx
// الترجمة تلقائية حسب اللغة المختارة
const { diseases } = useDiseases(); // يستخدم اللغة من I18nContext
```

### 5. Type Safety كامل
```tsx
// TypeScript كامل مع أنواع قوية
const { diseases }: { diseases: Disease[] } = useDiseases();
```

## 📖 مثال كامل

```tsx
import React from 'react';
import {
  DiseaseManagerProvider,
  useDiseaseManager,
  useDiseases,
  useTreatments,
  useDiagnosis,
  IndexedDBAdapter,
  WebPlatformAdapter,
} from '@kingdom-of-bees/disease-manager';

// 1. في المكون الجذر
function App() {
  return (
    <DiseaseManagerProvider
      config={{
        database: new IndexedDBAdapter(),
        platform: new WebPlatformAdapter(),
        userId: 'user-123',
      }}
    >
      <MyApp />
    </DiseaseManagerProvider>
  );
}

// 2. في المكونات الفرعية
function MyApp() {
  const { isInitialized, isOffline } = useDiseaseManager();
  
  const { diseases, search } = useDiseases({
    category: 'brood',
    minSeverity: 3,
  });
  
  const { treatments, getOrganic } = useTreatments({
    type: 'organic',
  });
  
  const {
    startSession,
    addSymptom,
    analyze,
    isActive,
    canAnalyze,
  } = useDiagnosis();

  if (!isInitialized) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1>مكتبة إدارة أمراض النحل</h1>
      <p>الوضع: {isOffline ? 'أوفلاين' : 'أونلاين'}</p>
      
      <section>
        <h2>الأمراض ({diseases.length})</h2>
        {diseases.map(disease => (
          <div key={disease.id}>
            <h3>{disease.name.ar}</h3>
            <p>{disease.description.ar}</p>
          </div>
        ))}
      </section>
      
      <section>
        <h2>العلاجات العضوية</h2>
        {getOrganic().map(treatment => (
          <div key={treatment.id}>
            <h3>{treatment.name.ar}</h3>
            <p>{treatment.description.ar}</p>
          </div>
        ))}
      </section>
      
      <section>
        <h2>التشخيص</h2>
        {!isActive ? (
          <button onClick={() => startSession({ hiveId: 'hive-1' })}>
            بدء التشخيص
          </button>
        ) : (
          <div>
            <button onClick={() => addSymptom({ symptomId: 'symptom-1', severity: 4 })}>
              إضافة عرض
            </button>
            <button onClick={analyze} disabled={!canAnalyze}>
              تحليل
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
```

## 📚 التوثيق الكامل

راجع [CONTEXT_AND_HOOKS.md](./CONTEXT_AND_HOOKS.md) للتوثيق الكامل مع أمثلة مفصلة.

## 🎉 الخلاصة

تم إنشاء نظام كامل من React Context و Hooks يجعل استخدام المكتبة في تطبيقات React سهلاً وبديهياً. جميع الـ Hooks تدعم:

- ✅ TypeScript كامل
- ✅ ترجمة تلقائية
- ✅ دعم الأوفلاين
- ✅ معالجة الأخطاء
- ✅ حالات التحميل
- ✅ فلترة ذكية
- ✅ إدارة الحالة التلقائية

المكتبة الآن جاهزة للاستخدام في تطبيقات React بشكل كامل! 🚀
