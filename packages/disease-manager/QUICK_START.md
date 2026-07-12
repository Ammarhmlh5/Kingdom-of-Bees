# دليل البدء السريع
# Quick Start Guide

<div dir="rtl">

هذا الدليل سيساعدك على البدء باستخدام مكتبة `@kingdom-of-bees/disease-manager` في دقائق!

</div>

## 📦 التثبيت

```bash
npm install @kingdom-of-bees/disease-manager
```

## 🚀 الاستخدام الأساسي

### 1. استخدام قاعدة بيانات الأمراض

```typescript
import { DiseaseService } from '@kingdom-of-bees/disease-manager';

// الحصول على جميع الأمراض
const allDiseases = DiseaseService.getDiseases();
console.log(`عدد الأمراض: ${allDiseases.length}`);

// البحث عن مرض
const searchResults = DiseaseService.searchDiseases('فاروا', 'ar');
console.log('نتائج البحث:', searchResults);

// الحصول على أمراض الحضنة فقط
const broodDiseases = DiseaseService.getDiseasesByCategory('brood');
console.log('أمراض الحضنة:', broodDiseases);

// الحصول على الأمراض الأكثر خطورة
const dangerous = DiseaseService.getMostDangerousDiseases();
console.log('الأمراض الخطرة:', dangerous);

// الحصول على مرض بالمعرف
const disease = DiseaseService.getDiseaseById('brood-001');
if (disease) {
  console.log('اسم المرض:', disease.name.ar);
  console.log('الوصف:', disease.description.ar);
  console.log('الأعراض:', disease.symptoms);
}
```

### 2. استخدام قاعدة بيانات العلاجات

```typescript
import { TreatmentService } from '@kingdom-of-bees/disease-manager';

// الحصول على جميع العلاجات
const allTreatments = TreatmentService.getTreatments();
console.log(`عدد العلاجات: ${allTreatments.length}`);

// الحصول على العلاجات العضوية فقط
const organicTreatments = TreatmentService.getOrganicTreatments();
console.log('العلاجات العضوية:', organicTreatments);

// الحصول على علاجات الفاروا
const varroaTreatments = TreatmentService.getTreatmentsByDisease('para-001');
console.log('علاجات الفاروا:', varroaTreatments);

// الحصول على العلاجات الموصى بها (عضوية، آمنة للعسل، رخيصة)
const recommended = TreatmentService.getRecommendedTreatmentsForDisease(
  'para-001',
  {
    organicOnly: true,
    safeForHoneyOnly: true,
    maxCost: 30,
    currency: 'USD'
  }
);
console.log('العلاجات الموصى بها:', recommended);

// مقارنة علاجين
const comparison = TreatmentService.compareTreatments('org-001', 'chem-001');
console.log('المقارنة:', comparison);
```

### 3. استخدام نظام الترجمة (I18n)

```typescript
import { I18nManager } from '@kingdom-of-bees/disease-manager';

// إنشاء مدير الترجمة
const i18n = new I18nManager('ar');

// ترجمة نص
const text = i18n.translate('diseases.title');
console.log(text); // "الأمراض"

// ترجمة مع متغيرات
const greeting = i18n.translate('common.hello', { name: 'أحمد' });
console.log(greeting); // "مرحباً أحمد"

// ترجمة مع الجمع
const days = i18n.translatePlural('time.day', 5);
console.log(days); // "5 أيام"

// تغيير اللغة
i18n.setLocale('en');
const englishText = i18n.translate('diseases.title');
console.log(englishText); // "Diseases"

// الحصول على اتجاه النص
const direction = i18n.getTextDirection();
console.log(direction); // "ltr" للإنجليزية، "rtl" للعربية
```

### 4. استخدام I18n مع React

```typescript
import React from 'react';
import { I18nProvider, useTranslation, useLocale } from '@kingdom-of-bees/disease-manager';

function DiseaseList() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('diseases.title')}</h1>
      <p>{t('diseases.description')}</p>
    </div>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  
  return (
    <div>
      <button onClick={() => setLocale('ar')}>العربية</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('fr')}>Français</button>
      <p>اللغة الحالية: {locale}</p>
    </div>
  );
}

function App() {
  return (
    <I18nProvider initialLocale="ar">
      <LanguageSwitcher />
      <DiseaseList />
    </I18nProvider>
  );
}
```

### 5. استخدام Platform Adapters

```typescript
import { detectPlatform, createWebPlatformAdapter } from '@kingdom-of-bees/disease-manager';

// اكتشاف المنصة تلقائياً
const platformType = detectPlatform();
console.log('المنصة:', platformType); // 'web', 'react-native', أو 'electron'

// إنشاء محول للمنصة
const platform = createWebPlatformAdapter();

// استخدام التخزين المحلي
await platform.storage.setItem('user_name', 'أحمد');
const userName = await platform.storage.getItem('user_name');
console.log('اسم المستخدم:', userName);

// إرسال إشعار
await platform.notification.show({
  title: 'تنبيه مهم',
  body: 'حان وقت فحص الخلايا',
  priority: 'high'
});

// التقاط صورة (في المتصفح)
const image = await platform.camera.captureImage({
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
});
console.log('الصورة:', image);
```

### 6. استخدام Database Adapters

```typescript
import { IndexedDBAdapter } from '@kingdom-of-bees/disease-manager';

// إنشاء محول قاعدة البيانات
const db = new IndexedDBAdapter({
  dbName: 'bee-diseases',
  version: 1
});

// الاتصال بقاعدة البيانات
await db.connect();

// إنشاء سجل خلية
await db.create('hives', {
  id: 'hive-001',
  name: 'الخلية الأولى',
  location: 'المنحل الرئيسي',
  status: 'healthy',
  lastInspection: new Date()
});

// قراءة جميع الخلايا
const hives = await db.read('hives');
console.log('الخلايا:', hives);

// قراءة خلية محددة
const hive = await db.readOne('hives', 'hive-001');
console.log('الخلية:', hive);

// تحديث خلية
await db.update('hives', 'hive-001', {
  status: 'needs_attention',
  lastInspection: new Date()
});

// حذف خلية
await db.delete('hives', 'hive-001');

// استعلام مع فلاتر
const healthyHives = await db.query('hives', {
  where: { status: 'healthy' },
  orderBy: 'name',
  limit: 10
});
console.log('الخلايا الصحية:', healthyHives);
```

## 🎯 أمثلة عملية

### مثال 1: تطبيق بسيط لعرض الأمراض

```typescript
import React, { useState, useEffect } from 'react';
import { DiseaseService, I18nProvider, useTranslation } from '@kingdom-of-bees/disease-manager';

function DiseaseApp() {
  const { t } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery) {
      const results = DiseaseService.searchDiseases(searchQuery, 'ar');
      setDiseases(results);
    } else {
      const all = DiseaseService.getDiseases();
      setDiseases(all);
    }
  }, [searchQuery]);

  return (
    <div dir="rtl">
      <h1>{t('diseases.title')}</h1>
      
      <input
        type="text"
        placeholder={t('common.search')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div>
        {diseases.map(disease => (
          <div key={disease.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <h2>{disease.name.ar}</h2>
            <p>{disease.description.ar}</p>
            <p><strong>الفئة:</strong> {disease.category}</p>
            <p><strong>الخطورة:</strong> {disease.severity}/5</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <I18nProvider initialLocale="ar">
      <DiseaseApp />
    </I18nProvider>
  );
}

export default App;
```

### مثال 2: تطبيق لاختيار العلاج المناسب

```typescript
import React, { useState } from 'react';
import { TreatmentService, DiseaseService } from '@kingdom-of-bees/disease-manager';

function TreatmentSelector() {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [safeForHoney, setSafeForHoney] = useState(false);
  const [treatments, setTreatments] = useState([]);

  const diseases = DiseaseService.getDiseases();

  const handleSearch = () => {
    if (!selectedDisease) return;

    const results = TreatmentService.getRecommendedTreatmentsForDisease(
      selectedDisease,
      {
        organicOnly,
        safeForHoneyOnly: safeForHoney,
        maxCost: 50,
        currency: 'USD'
      }
    );
    setTreatments(results);
  };

  return (
    <div dir="rtl">
      <h1>اختيار العلاج المناسب</h1>

      <div>
        <label>اختر المرض:</label>
        <select value={selectedDisease} onChange={(e) => setSelectedDisease(e.target.value)}>
          <option value="">-- اختر --</option>
          {diseases.map(d => (
            <option key={d.id} value={d.id}>{d.name.ar}</option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(e) => setOrganicOnly(e.target.checked)}
          />
          عضوي فقط
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={safeForHoney}
            onChange={(e) => setSafeForHoney(e.target.checked)}
          />
          آمن للعسل
        </label>
      </div>

      <button onClick={handleSearch}>بحث</button>

      <div>
        <h2>العلاجات الموصى بها:</h2>
        {treatments.map(treatment => (
          <div key={treatment.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <h3>{treatment.name.ar}</h3>
            <p>{treatment.description.ar}</p>
            <p><strong>النوع:</strong> {treatment.type}</p>
            <p><strong>الفعالية:</strong> {treatment.effectiveness}/5</p>
            {treatment.cost && (
              <p><strong>التكلفة:</strong> {treatment.cost.perHive} {treatment.cost.currency}</p>
            )}
            {treatment.organicCertified && <span>✅ عضوي</span>}
            {treatment.safeForHoney && <span>✅ آمن للعسل</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TreatmentSelector;
```

## 📚 المزيد من الموارد

- [التوثيق الكامل](https://github.com/kingdom-of-bees/disease-manager/docs)
- [أمثلة متقدمة](https://github.com/kingdom-of-bees/disease-manager/examples)
- [API Reference](https://github.com/kingdom-of-bees/disease-manager/api)

---

<div dir="rtl">

هل لديك أسئلة؟ افتح [Issue](https://github.com/kingdom-of-bees/disease-manager/issues) أو [Discussion](https://github.com/kingdom-of-bees/disease-manager/discussions)!

</div>
