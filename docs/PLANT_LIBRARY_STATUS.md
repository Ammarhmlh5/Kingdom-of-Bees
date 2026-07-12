لك# حالة مكتبة النباتات (Plant Library Status)

> تاريخ الإنشاء: 2026-07-07

---

## ✅ المكتمل

### 1. قاعدة البيانات (Database Schema)

| العنصر | الملف | الحالة |
|--------|-------|--------|
| **PlantLibrary** | `packages/db/prisma/schema.prisma` (L2071-2258) | ✅ كامل - 25 حقلًا |
| **LocalPlant** | `packages/db/prisma/schema.prisma` | ✅ كامل - 22 حقلًا |
| **PlantObservation** | `packages/db/prisma/schema.prisma` | ✅ كامل - 15 حقلًا |
| **ForageAssessment** | `packages/db/prisma/schema.prisma` (L2813-2848) | ✅ كامل |
| **6 Enums** | `PlantType`, `CoverageUnit`, `PlantDensity`, `LocalPlantStatus`, `BeeActivityLevel`, `BloomStatus` | ✅ كامل |

### 2. الترحيل (Migrations)

| الملف | الحالة |
|-------|--------|
| `packages/db/prisma/init_nextgen.sql` | ✅ يحتوي DDL للنباتات |
| `packages/db/prisma/migration_diff.sql` | ✅ يحتوي تغييرات النباتات |

### 3. الواجهة الأمامية (Frontend Web)

| الملف | الحالة |
|-------|--------|
| `frontend-web/src/pages/FloraPage.tsx` | ✅ واجهة كاملة - عرض، بحث، إضافة، حذف |
| `frontend-web/src/services/plants.ts` | ✅ خدمة API (4 دوال) |
| `frontend-web/src/hooks/api/index.ts` (L459-495) | ✅ 4 React Query hooks |
| `frontend-web/src/App.tsx` (L66, 192) | ✅ مسار `/flora` مسجل |

### 4. تطبيق الموبايل

| الملف | الحالة |
|-------|--------|
| `mobile-app/app/flora/index.tsx` | ✅ شاشة فلورا محلية (SQLite) |
| `mobile-app/app/(tabs)/explore.tsx` | ✅ رابط إلى `/flora` |

### 5. نسخ احتياطية (Backup - تحتوي منطقًا قديمًا)

| الملف | الحالة |
|-------|--------|
| `backend/dist/src/services/plant.service.js` | ⏺ نسخة مترجمة قديمة (المصدر محذوف) |
| `backend/dist/src/controllers/plant.controller.js` | ⏺ نسخة مترجمة قديمة (المصدر محذوف) |
| `packages/db/archive/Legacy_Backup/backend_services/plant.service.ts` | ⏺ نسخة احتياطية من السورس |

---

## ❌ المفقود / الناقص

### 1. طبعة API بالكامل (Backend Layer)

| القطعة | المسار المطلوب | التفاصيل |
|--------|----------------|----------|
| **Controller** | `backend/src/controllers/plant.controller.ts` | ❌ غير موجود نهائيًا (الـ dist قديم) |
| **Service** | `backend/src/services/plant.service.ts` | ❌ غير موجود (النسخة موجودة في Legacy_Backup) |
| **Routes** | `backend/src/routes/plant.routes.ts` | ❌ غير موجود |
| **Repository** | `backend/src/repositories/plant.repository.ts` | ❌ غير موجود |
| **Validators** | `backend/src/validators/` أو `middleware/` | ❌ لا يوجد validation |
| **تسجيل المسارات** | `backend/src/index.ts` | ❌ لا يستورد أي مسار نباتات |

### 2. المسارات المطلوبة للواجهة

المسارات التي تستدعيها الواجهة الأمامية (`services/plants.ts`) ولكنها تؤدي إلى 404:

| الطريقة | المسار | الغرض |
|---------|-------|-------|
| `GET` | `/apiaries/:apiaryId/plants` | جلب نباتات منحل |
| `GET` | `/plants/search?q=:query` | بحث في مكتبة النباتات |
| `POST` | `/apiaries/:apiaryId/plants` | إضافة نبات لمنحل |
| `DELETE` | `/apiaries/:apiaryId/plants/:plantId` | حذف نبات من منحل |

### 3. لوحة الإدارة (Admin Panel)

| الملف | الحالة |
|-------|--------|
| أي صفحة لإدارة مكتبة النباتات | ❌ غير موجودة |
| `docs/guides/تقرير_تحليل_لوحة_الإدارة.md` | 📝 ذكرت كخاصية مرغوبة ولكن لم تنفذ |

### 4. بيانات أولية (Seed Data)

| الملف | الحالة |
|-------|--------|
| أي ملف seed للنباتات | ❌ غير موجود (على عكس bee-breeds, diseases, hive-types) |

### 5. أنواع مشتركة (Shared Types)

| الملف | الحالة |
|-------|--------|
| `packages/shared-types/src/index.ts` | ❌ لا توجد أنواع للنباتات |

### 6. الاختبارات (Tests)

| الملف | الحالة |
|-------|--------|
| أي اختبارات للنباتات في Backend/Frontend | ❌ صفر تغطية |

### 7. منصة (Platform Package)

| الملف | المشكلة |
|-------|---------|
| `packages/db/packages/platform/src/server.ts` | يستورد `plantRoutes` من ملف غير موجود |
| `packages/db/packages/platform/src/routes/plant.routes.ts` | ❌ غير موجود |

---

## 📊 نسبة الإنجاز

| الطبقة | النسبة | ملاحظة |
|--------|--------|--------|
| قاعدة البيانات | **100%** | كاملة وجاهزة |
| الواجهة الأمامية (Web) | **90%** | تحتاج ربط بالـ API |
| تطبيق الموبايل | **60%** | يعمل محليًا، غير مرتبط بـ API |
| الـ API (Backend) | **0%** | غير موجود في المصدر النشط |
| لوحة الإدارة | **0%** | غير موجودة |
| الاختبارات | **0%** | غير موجودة |
| بيانات أولية | **0%** | غير موجودة |

---

## 📋 خطة العمل المقترحة

### المرحلة 1: API الأساسية (الأولوية القصوى)

- [ ] استعادة `plant.service.ts` من `Legacy_Backup` وتحديثه
- [ ] إنشاء `plant.controller.ts`
- [ ] إنشاء `plant.routes.ts` وتضمين المسارات الأربعة
- [ ] تسجيل المسارات في `backend/src/index.ts`
- [ ] اختبار أن الواجهة الأمامية تتصل بنجاح

### المرحلة 2: تحسين المتانة

- [ ] إنشاء `plant.repository.ts` (فصل طبقة البيانات)
- [ ] إضافة validators للمدخلات
- [ ] إضافة أنواع مشتركة في `shared-types`
- [ ] إصلاح مسارات `platform` package

### المرحلة 3: لوحة الإدارة

- [ ] إنشاء صفحة إدارة مكتبة النباتات في `admin-panel`
- [ ] إضافة CRUD كامل للنباتات

### المرحلة 4: بيانات واختبارات

- [ ] إنشاء seed data لنباتات محلية
- [ ] كتابة اختبارات للـ Backend (Jest)
- [ ] كتابة اختبارات للـ Frontend (Vitest)

### المرحلة 5: تكامل الموبايل

- [ ] ربط تطبيق الموبايل بـ API بدلاً من SQLite المحلي

---

## 🔗 المراجع

- `docs/reports/EVALUATION_REPORTS/02_BACKEND_ANALYSIS.md` — L278: النباتات عند 0%
- `docs/reports/PROGRESS_SUMMARY.md` — L61: `plant.routes.ts` كـ placeholder
- `docs/reports/FINAL_SUMMARY.md` — L79-81: DB ✅, routes placeholder
- `docs/reports/COMPREHENSIVE_PLAN.md` — L132-136, L327-330
- `docs/guides/تقرير_تحليل_لوحة_الإدارة.md` — L171
