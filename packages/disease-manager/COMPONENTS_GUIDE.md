# دليل مكونات React
# React Components Guide

<div dir="rtl">

هذا الدليل يشرح كيفية استخدام مكونات React المتوفرة في مكتبة `@kingdom-of-bees/disease-manager`.

</div>

## 📦 المكونات المتاحة

### 1. DiseaseList - قائمة الأمراض

مكون لعرض قائمة الأمراض مع إمكانية البحث والفلترة.

#### الخصائص (Props)

```typescript
interface DiseaseListProps {
  category?: DiseaseCategory;           // فلترة حسب الفئة
  minSeverity?: SeverityLevel;          // فلترة حسب مستوى الخطورة
  searchQuery?: string;                 // نص البحث
  onDiseaseClick?: (disease: Disease) => void;  // دالة عند النقر
  showImages?: boolean;                 // عرض الصور (افتراضي: false)
  showSymptoms?: boolean;               // عرض الأعراض (افتراضي: false)
  className?: string;                   // فئة CSS إضافية
}
```

#### مثال الاستخدام

```typescript
import { DiseaseList } from '@kingdom-of-bees/disease-manager';

function MyComponent() {
  const handleDiseaseClick = (disease) => {
    console.log('تم اختيار المرض:', disease.name.ar);
  };

  return (
    <DiseaseList
      category="brood"
      minSeverity={3}
      showSymptoms={true}
      showImages={true}
      onDiseaseClick={handleDiseaseClick}
    />
  );
}
```

#### الميزات

- ✅ بحث متعدد اللغات (العربية، الإنجليزية، الفرنسية)
- ✅ فلترة حسب الفئة (brood, adult, parasite, virus, queen)
- ✅ فلترة حسب مستوى الخطورة (1-5)
- ✅ عرض اختياري للأعراض والصور
- ✅ إحصائيات (إجمالي، معروض)
- ✅ دعم RTL/LTR
- ✅ Responsive Design
- ✅ Keyboard Navigation

---

### 2. DiseaseDetail - تفاصيل المرض

مكون لعرض تفاصيل مرض واحد بشكل كامل.

#### الخصائص (Props)

```typescript
interface DiseaseDetailProps {
  disease: Disease;                     // المرض المراد عرضه (مطلوب)
  showImages?: boolean;                 // عرض الصور (افتراضي: true)
  showDetailedSymptoms?: boolean;       // عرض الأعراض المفصلة (افتراضي: true)
  showPrevention?: boolean;             // عرض إجراءات الوقاية (افتراضي: true)
  showStatistics?: boolean;             // عرض الإحصائيات (افتراضي: true)
  onClose?: () => void;                 // دالة عند الإغلاق
  className?: string;                   // فئة CSS إضافية
}
```

#### مثال الاستخدام

```typescript
import { DiseaseDetail } from '@kingdom-of-bees/disease-manager';
import { useState } from 'react';

function MyComponent() {
  const [selectedDisease, setSelectedDisease] = useState(null);

  return (
    <>
      {selectedDisease && (
        <DiseaseDetail
          disease={selectedDisease}
          showImages={true}
          showPrevention={true}
          showStatistics={true}
          onClose={() => setSelectedDisease(null)}
        />
      )}
    </>
  );
}
```

#### الميزات

- ✅ عرض شامل لجميع معلومات المرض
- ✅ معرض الصور مع التعليقات
- ✅ الأعراض المفصلة مع مستوى الخطورة
- ✅ الأسباب وإجراءات الوقاية
- ✅ الموسمية والمناطق الجغرافية
- ✅ الإحصائيات (معدل الانتشار، معدل الوفيات، فترة الحضانة)
- ✅ زر إغلاق اختياري
- ✅ دعم RTL/LTR
- ✅ Responsive Design

---

### 3. TreatmentList - قائمة العلاجات

مكون لعرض قائمة العلاجات مع إمكانية البحث والفلترة.

#### الخصائص (Props)

```typescript
interface TreatmentListProps {
  type?: TreatmentType;                 // فلترة حسب النوع
  applicationMethod?: ApplicationMethod; // فلترة حسب طريقة التطبيق
  searchQuery?: string;                 // نص البحث
  onTreatmentClick?: (treatment: Treatment) => void;  // دالة عند النقر
  showDosage?: boolean;                 // عرض الجرعات (افتراضي: false)
  showCost?: boolean;                   // عرض التكلفة (افتراضي: false)
  className?: string;                   // فئة CSS إضافية
}
```

#### مثال الاستخدام

```typescript
import { TreatmentList } from '@kingdom-of-bees/disease-manager';

function MyComponent() {
  const handleTreatmentClick = (treatment) => {
    console.log('تم اختيار العلاج:', treatment.name.ar);
  };

  return (
    <TreatmentList
      type="organic"
      showDosage={true}
      showCost={true}
      onTreatmentClick={handleTreatmentClick}
    />
  );
}
```

#### الميزات

- ✅ بحث متعدد اللغات
- ✅ فلترة حسب النوع (chemical, organic, biological, mechanical)
- ✅ فلترة حسب طريقة التطبيق (strip, spray, fumigation, feed, dusting, manual)
- ✅ عرض اختياري للجرعات والتكلفة
- ✅ عرض فترة الأمان
- ✅ شارة "آمن للعسل"
- ✅ إحصائيات (إجمالي، معروض)
- ✅ دعم RTL/LTR
- ✅ Responsive Design
- ✅ Keyboard Navigation

---

## 🎨 التخصيص

### استخدام CSS مخصص

يمكنك تخصيص مظهر المكونات باستخدام الفئات CSS:

```typescript
<DiseaseList className="my-custom-class" />
```

### تجاوز الأنماط

```css
/* تخصيص ألوان قائمة الأمراض */
.disease-list__item:hover {
  background-color: #your-color;
}

/* تخصيص حجم الخط */
.disease-detail__title {
  font-size: 2.5rem;
}
```

---

## 🌍 دعم اللغات

جميع المكونات تدعم الترجمة التلقائية باستخدام `I18nProvider`:

```typescript
import { I18nProvider } from '@kingdom-of-bees/disease-manager';

function App() {
  return (
    <I18nProvider initialLocale="ar">
      <DiseaseList />
      <TreatmentList />
    </I18nProvider>
  );
}
```

### تغيير اللغة ديناميكياً

```typescript
import { useLocale } from '@kingdom-of-bees/disease-manager';

function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div>
      <button onClick={() => setLocale('ar')}>العربية</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('fr')}>Français</button>
    </div>
  );
}
```

---

## ♿ إمكانية الوصول

جميع المكونات تدعم:

- ✅ ARIA labels
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus states واضحة
- ✅ Screen reader support
- ✅ High contrast mode

---

## 📱 Responsive Design

المكونات متجاوبة بالكامل وتعمل على:

- 📱 Mobile (< 480px)
- 📱 Tablet (480px - 768px)
- 💻 Desktop (> 768px)

---

## 🔗 مثال كامل

```typescript
import React, { useState } from 'react';
import {
  I18nProvider,
  DiseaseList,
  DiseaseDetail,
  TreatmentList,
  Disease,
  Treatment,
} from '@kingdom-of-bees/disease-manager';

function App() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  return (
    <I18nProvider initialLocale="ar">
      <div className="app">
        <h1>إدارة أمراض النحل</h1>

        {/* قائمة الأمراض */}
        <section>
          <h2>الأمراض</h2>
          <DiseaseList
            showSymptoms={true}
            showImages={true}
            onDiseaseClick={setSelectedDisease}
          />
        </section>

        {/* تفاصيل المرض */}
        {selectedDisease && (
          <DiseaseDetail
            disease={selectedDisease}
            showImages={true}
            showPrevention={true}
            showStatistics={true}
            onClose={() => setSelectedDisease(null)}
          />
        )}

        {/* قائمة العلاجات */}
        <section>
          <h2>العلاجات</h2>
          <TreatmentList
            showDosage={true}
            showCost={true}
            onTreatmentClick={setSelectedTreatment}
          />
        </section>
      </div>
    </I18nProvider>
  );
}

export default App;
```

---

## 📚 المزيد من الموارد

- [دليل البدء السريع](./QUICK_START.md)
- [ملخص المشروع](./PROJECT_SUMMARY.md)
- [دليل المساهمة](./CONTRIBUTING.md)

---

<div dir="rtl">

صُنع بـ ❤️ لمربي النحل في كل مكان

</div>
