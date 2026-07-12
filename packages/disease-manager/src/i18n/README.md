# I18n System - نظام الترجمة

نظام ترجمة شامل متعدد اللغات لمكتبة إدارة أمراض النحل.

## اللغات المدعومة

- 🇸🇦 العربية (ar) - اللغة الأساسية مع دعم RTL
- 🇬🇧 الإنجليزية (en) - لغة احتياطية
- 🇫🇷 الفرنسية (fr)

## الميزات

- ✅ دعم ثلاث لغات كاملة
- ✅ دعم RTL/LTR تلقائي
- ✅ دعم المتغيرات (interpolation)
- ✅ دعم الجمع (pluralization) مع قواعد العربية المعقدة
- ✅ React Context و Hooks
- ✅ Type-safe مع TypeScript
- ✅ نظام احتياطي للترجمات المفقودة
- ✅ إضافة ترجمات ديناميكية

## الاستخدام الأساسي

### مع React

```tsx
import { I18nProvider, useTranslation } from '@kingdom-of-bees/disease-manager';

function App() {
  return (
    <I18nProvider defaultLocale="ar">
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, locale, direction } = useTranslation();

  return (
    <div dir={direction}>
      <h1>{t('diseases.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### بدون React

```typescript
import { createDefaultI18n } from '@kingdom-of-bees/disease-manager';

const i18n = createDefaultI18n();

// تغيير اللغة
i18n.setLocale('en');

// ترجمة
const title = i18n.translate('diseases.title');

// ترجمة مع متغيرات
const message = i18n.translate('validation.min_length', { min: 5 });

// ترجمة مع جمع
const days = i18n.translatePlural('time.days', 3);
```

## Hooks المتاحة

### useTranslation

```tsx
const { t, tPlural, locale, direction } = useTranslation();
```

### useLocale

```tsx
const [locale, setLocale] = useLocale();
```

### useTextDirection

```tsx
const direction = useTextDirection(); // 'rtl' | 'ltr'
```

## بنية الترجمات

```typescript
{
  common: { ... },      // كلمات شائعة
  diseases: { ... },    // الأمراض
  diagnosis: { ... },   // التشخيص
  treatments: { ... },  // العلاجات
  alerts: { ... },      // التنبيهات
  hives: { ... },       // الخلايا
  sync: { ... },        // المزامنة
  errors: { ... },      // الأخطاء
  validation: { ... },  // التحقق
  dates: { ... },       // التواريخ
  time: { ... }         // الوقت
}
```

## إضافة ترجمات مخصصة

```typescript
i18n.addTranslations('ar', {
  custom: {
    message: 'رسالة مخصصة',
  },
});
```

## قواعد الجمع

### العربية

- zero: 0 عناصر
- one: عنصر واحد
- two: عنصران
- few: 3-10 عناصر
- many: 11+ عنصر
- other: احتياطي

### الإنجليزية والفرنسية

- zero: 0 عناصر
- one: عنصر واحد
- other: 2+ عناصر

## الملفات

- `types.ts` - تعريفات الأنواع
- `I18nManager.ts` - مدير الترجمة الأساسي
- `I18nContext.tsx` - React Context و Hooks
- `translations/` - ملفات الترجمات
  - `ar.ts` - الترجمات العربية
  - `en.ts` - الترجمات الإنجليزية
  - `fr.ts` - الترجمات الفرنسية
  - `index.ts` - تصدير الترجمات
