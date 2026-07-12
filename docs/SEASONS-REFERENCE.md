# مرجع المواسم في النظام — Seasons Reference

> تاريخ التوثيق: 2026-07-07
> يغطي هذا الملف كل ما يتعلق بمفهوم **المواسم (Seasons)** في مشروع Kingdom of Bees.

---

## 1. قاعدة البيانات (Prisma Schema)

**الملف:** `packages/db/prisma/schema.prisma`

### 1.1 `DiseaseTreatment.season` (السطر 1552)
```prisma
season String[] // e.g. ["SPRING", "FALL"]
```
- حقل نصي متعدد القيم يحدد المواسم المناسبة للعلاج
- يُخزَّن في جدول `disease_treatment`

### 1.2 `ApiaryMetrics.seasonType` (السطر 3551)
```prisma
seasonType String? @map("season_type") // spring, summer, autumn, winter
```
- حقل نصي يحدد نوع الموسم الحالي للمنحل
- يُخزَّن في جدول `apiary_metrics`

> **ملاحظة:** لا يوجد جدول/model مستقل للمواسم. الموسم مجرد `String` ضمن جداول أخرى.

---

## 2. أنواع TypeScript (Types)

### 2.1 `disease-manager` — `packages/disease-manager/src/types/disease.ts` (السطر 39)
```typescript
export type Season =
  | 'spring'   // الربيع
  | 'summer'   // الصيف
  | 'fall'     // الخريف
  | 'winter';  // الشتاء
```

#### مستخدَم في:
- `Disease.seasonality: Season[]` (السطر 162)
- `DiseaseFilter.season?: Season` (السطر 234)
- `DiseaseStatistics.seasonalDistribution` (السطر 312)

### 2.2 `treatment.ts` — `packages/disease-manager/src/types/treatment.ts`
- `Treatment.recommendedSeason?: string[]` (السطر 255)
- `TreatmentFilter.season?: string` (السطر 295)

### 2.3 `diagnosis.ts` — `packages/disease-manager/src/types/diagnosis.ts` (السطر 125)
- `AnalysisOptions.considerSeasonality?: boolean`

### 2.4 `SeasonalContext` — `frontend-web/src/services/hives.ts` (السطر 329)
```typescript
export interface SeasonalContext {
    season: string;        // اسم الموسم بالعربية
    flows: string[];       // أسماء التدفقات الرحيقية
    daysUntilPeak: number; // أيام حتى الذروة
}
```

### 2.5 `MergeService` — `backend/src/services/merge.service.ts` (السطر 35)
```typescript
season: 'SPRING' | 'AUTUMN'
```

### 2.6 `AdvisorService.Season` — `mobile-app/lib/logic/advisor.ts` (السطر 3)
```typescript
type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
```

### 2.7 `SimulationRequest` — `backend/src/services/simulation.service.ts` (السطر 5)
```typescript
factors: { includeSeasons: boolean }
```

### 2.8 `SymptomMatcher.MatchingOptions` — `packages/disease-manager/src/core/SymptomMatcher.ts` (السطر 20)
```typescript
considerSeasonality?: boolean;
currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
```

---

## 3. الباك إند (Backend)

### 3.1 `super.service.ts` — `backend/src/services/super.service.ts`

**دالة `getSeasonalContext(month)`** (السطر 319):
تحدد الموسم والتدفقات الرحيقية بناءً على الشهر (للسعودية):

| الشهر | الموسم | التدفقات | daysUntilPeak |
|-------|--------|----------|:---:|
| 1 | شتاء | السمر | 60 |
| 2 | شتاء | السمر, الطلح | 30 |
| 3 | ربيع | الطلح, السدر الربيعي | 15 |
| 4 | ربيع | السدر الربيعي | 45 |
| 5 | ربيع | الصيفي | 30 |
| 6 | صيف | الصيفي | 60 |
| 7 | صيف | — | 90 |
| 8 | صيف | — | 120 |
| 9 | خريف | السدر | 60 |
| 10 | خريف | السدر | 30 |
| 11 | خريف | السدر | 15 |
| 12 | شتاء | السمر | 45 |

**إرجاع:** `{ season: string; flows: string[]; daysUntilPeak: number }`

### 3.2 `simulation.service.ts` — `backend/src/services/simulation.service.ts`

**دالة `getSeasonalImpact(month)`** (السطر 234):

| الشهر | التأثير | strength | production |
|-------|---------|:--------:|:----------:|
| 1 | شتاء | -2 | 0.5 |
| 2 | شتاء | -1 | 1 |
| 3 | ربيع | +3 | 2 |
| 4 | ربيع | +5 | 3 |
| 5 | ربيع | +4 | 2.5 |
| 6 | صيف | +2 | 1.5 |
| 7 | صيف | -1 | 0.5 |
| 8 | صيف | -2 | 0.3 |
| 9 | خريف | +1 | 1 |
| 10 | خريف (سدر) | +3 | 4 |
| 11 | خريف (سدر) | +4 | 5 |
| 12 | شتاء | 0 | 1 |

**دالة `generateRecommendations`** (السطر 315): تدفع توصية `'الاستعداد لموسم السدر'` في الشهور 9-11.

**دالة `calculateConfidence`** (السطر 338): تضيف 5 للثقة عند `includeSeasons = true`.

### 3.3 `merge.service.ts` — `backend/src/services/merge.service.ts`

**دالة `getMergeCandidates(apiaryId, season)`** (السطر 33):
- `season: 'SPRING' | 'AUTUMN'`
- في `'AUTUMN'`: تحدد الخلايا الضعيفة (`broodFrames < 4` أو `strengthScore < 50`) للدمج استعدادًا للشتاء

**دالة `calculateSurvivalChance(hive, season)`** (السطر 228):
- تقدير فرص النجاة في الشتاء بناءً على إطارات الحضنة، مخزون العسل، strength، وعمر الملكة

### 3.4 `merge.controller.ts` — `backend/src/controllers/merge.controller.ts` (السطر 11)

```typescript
const { season } = req.query;
const determinedSeason = season as 'SPRING' | 'AUTUMN' ||
  (currentMonth >= 3 && currentMonth <= 5 ? 'SPRING' : 'AUTUMN');
```
- يستنتج الموسم من query param أو من الشهر الحالي
- الإرجاع: `{ success, data, season: determinedSeason }`

### 3.5 `apiary.service.ts` — `backend/src/services/apiary.service.ts`

**نصائح الطقس الموسمية** (السطر 229):
- **الصيف** (شهور 5-8): رسالة تحذير من ارتفاع الحرارة
- **الشتاء** (شهور 0-1): رسالة برودة ليلية

**توصيات التغذية الموسمية** (السطر 521):
- **موسم السدر** (سبتمبر-أكتوبر): توقف عن التغذية السكرية
- **الشتاء** (ديسمبر-يناير): محلول سكري مركز (2:1) إذا المخزون < 20

### 3.6 `admin-disease.service.ts` — `backend/src/services/admin-disease.service.ts`
- `createTreatment` (السطر 88): يكتب `season: data.season || []`
- `updateTreatment` (السطر 110): يحدّث `season: data.season`

### 3.7 `simulation.controller.ts` — `backend/src/controllers/simulation.controller.ts`
- Default factors تشمل `includeSeasons: true` (السطر 47)

### 3.8 Routes — `backend/src/routes/hive.routes.ts`
- `GET /merge-candidates` ← `mergeController.getMergeCandidates` (السطر 36)
- `GET /super-candidates` ← `superController.getSuperCandidates` (السطر 41)

---

## 4. الواجهة الأمامية (Frontend Web)

### 4.1 `MergeTab.tsx` — `frontend-web/src/components/hives/MergeTab.tsx`
- **State:** `const [season, setSeason] = useState<'SPRING' | 'AUTUMN'>('AUTUMN')` (السطر 36)
- **API:** `getMergeCandidates(apiaryId, season)` (السطر 55)
- **UI:** تبويبان — `الربيع/الصيف (تطوير)` و `الخريف/الشتاء (دمج)` (السطر 330)
- **Header:** `إدارة موسمية للخلايا الضعيفة والنويات` (السطر 319)

### 4.2 `SuperTab.tsx` — `frontend-web/src/components/hives/SuperTab.tsx`
- **State:** `const [seasonalContext, setSeasonalContext] = useState<SeasonalContext | null>(null)` (السطر 60)
- **API:** `setSeasonalContext(data.seasonalContext)` (السطر 84)
- **UI:** بطاقة `السياق الموسمي` (السطر 344):
  - الموسم الحالي — `seasonalContext.season`
  - المواسم القادمة — `seasonalContext.flows`
  - أيام حتى الذروة — `seasonalContext.daysUntilPeak`

### 4.3 `SimulationPanel.tsx` — `frontend-web/src/components/hives/SimulationPanel.tsx`
- **UI:** زر تبديل (Toggle) `تضمين المواسم` مربوط بـ `factors.includeSeasons` (السطر 168)

### 4.4 `DashboardTab.tsx` — `frontend-web/src/components/hives/DashboardTab.tsx`
- **UI:** نص `تقديري للموسم الحالي` (السطر 144)

### 4.5 `AIConsultant.tsx` — `frontend-web/src/components/hives/AIConsultant.tsx`
- `موسم فيض قادم` (السطر 61) — نصيحة قبل التقسيم
- `قبل موسم الفيض بأسبوعين` (السطر 71) — نصيحة إضافة عاسلة

### 4.6 `hives.ts` (Service) — `frontend-web/src/services/hives.ts`
- `getMergeCandidates(apiaryId, season?)` (السطر 289)
- `getSuperCandidates(apiaryId)` (السطر 335)
- `SimulationRequest.factors.includeSeasons` (السطر 362)

---

## 5. تطبيق الموبايل (Mobile App)

### 5.1 `advisor.ts` — `mobile-app/lib/logic/advisor.ts`
- **نوع:** `type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'` (السطر 3)
- **دالة `analyze(frames, season)`** (السطر 13):
  - القاعدة 3 (السطر 44): في `SPRING` — فحص ازدحام الخلية (خطر التطريد)
  - القاعدة 4 (السطر 54): في `SPRING` أو `AUTUMN` — فحص نقص حبوب اللقاح

### 5.2 `ai.service.ts` — `mobile-app/lib/services/ai.service.ts`
- (السطر 27): نص `في هذا الوقت من السنة (الربيع)، يُنصح بالتغذية التحفيزية`
- (السطر 30): نص `إذا لم تكن في موسم جمع العسل` لمكافحة الفاروا

### 5.3 `flora/index.tsx` — `mobile-app/app/flora/index.tsx`
- (السطر 115): نص `أضف نباتات منطقتك لتتبع مواسم الإزهار`

### 5.4 `explore.tsx` — `mobile-app/app/(tabs)/explore.tsx`
- (السطر 37): نص `سجل النباتات ومواسم الإزهار في منطقتك`

---

## 6. حزمة `disease-manager`

### 6.1 `SymptomMatcher.ts` — `packages/disease-manager/src/core/SymptomMatcher.ts`
- (السطر 74): عند تفعيل `considerSeasonality` + `currentSeason`، يُرشّح الأمراض حسب `seasonality`

### 6.2 `DiagnosisEngine.ts` — `packages/disease-manager/src/core/DiagnosisEngine.ts`
- (السطر 28): يمرر `considerSeasonality` من الخيارات إلى `SymptomMatcher`

### 6.3 `DiseaseService.ts` — `packages/disease-manager/src/services/DiseaseService.ts`
- `getDiseasesBySeason(season)` (السطر 99): يُفلتر الأمراض حسب الموسم
- `getAvailableSeasons()` (السطر 193): يُرجِع كل المواسم الفريدة

### 6.4 `TreatmentService.ts` — `packages/disease-manager/src/services/TreatmentService.ts`
- `filterTreatments` (السطر 83): يُفلتر حسب `filter.season`
- `getTreatmentsBySeason(season)` (السطر 202): يُرجِع العلاجات المناسبة لموسم

### 6.5 `DiseaseDetail.tsx` — `packages/disease-manager/src/components/DiseaseDetail.tsx`
- (السطر 160): يعرض `seasonality` كبطاقات موسمية مترجمة

### 6.6 بيانات الأمراض (Disease Data Files)

| الملف | السطر | seasonality |
|-------|:-----:|-------------|
| `data/diseases/brood-diseases.ts` | 102 | `['spring', 'summer', 'fall']` |
| | 212 | `['spring', 'summer']` |
| | 312 | `['spring', 'fall']` |
| | 412 | `['spring', 'summer']` |
| `data/diseases/adult-diseases.ts` | 102 | `['spring', 'fall', 'winter']` |
| | 197 | `['spring', 'fall']` |
| | 312 | `['summer', 'fall']` |

### 6.7 بيانات العلاجات (Treatment Data Files)

| الملف | السطر | recommendedSeason |
|-------|:-----:|-------------------|
| `data/treatments/chemical-treatments.ts` | 150 | `['spring', 'fall']` |
| | 263 | `['spring', 'summer', 'fall']` |
| | 394 | `['fall']` |
| | 527 | `['spring', 'fall']` |
| | 673 | `['spring', 'fall']` |
| `data/treatments/organic-treatments.ts` | 130 | `['fall', 'winter']` |
| | 252 | `['spring', 'fall']` |
| | 374 | `['spring', 'summer', 'fall']` |
| | 468 | `['spring', 'summer', 'fall']` |
| `data/treatments/biological-mechanical-treatments.ts` | 100 | `['spring', 'summer']` |
| | 185 | `['summer', 'fall']` |
| | 264 | `['spring', 'summer', 'fall']` |
| | 330 | `['spring', 'summer', 'fall']` |

---

## 7. ملف الاختبار

**`backend/src/test-admin-api.ts`** (السطر 39):
```typescript
season: ['SPRING', 'AUTUMN']
```

---

## 8. الخلاصة — الموجود vs المفقود

### ✅ الموجود:
- مفهوم الموسم منتشر في 7 خدمات باك إند، 5 مكونات واجهة، 4 ملفات موبايل، وحزمة `disease-manager`
- الأمراض والعلاجات مصنفة موسميًا في بيانات ثابتة
- `getDiseasesBySeason()`، `getTreatmentsBySeason()`، `getSeasonalContext()`، `getSeasonalImpact()` — دوال جاهزة
- `SeasonalContext` interface جاهز في الواجهة

### ❌ المفقود:
- لا يوجد **جدول Seasons** مستقل في Prisma
- لا يوجد **CRUD** لإدارة المواسم عبر API
- لا يوجد **تخزين مركزي للموسم الحالي** — يُحتسب من `new Date().getMonth()` في كل مكان
- لا يوجد **تواريخ بداية/نهاية** لكل موسم (قابلة للتعديل)
- ميزة **تتبع مواسم الإزهار** في الموبايل غير منفذة (نصوص فقط)
- لا توجد **وحدة مركزية** لتحديد الموسم — كل خدمة تعيد حساب المنطق بنفسها
- لا توجد **واجهة إدارة** للمواسم في لوحة التحكم (admin-panel)
- لا يوجد **تسلسل مواسم** مع تواريخ دقيقة قابلة للتخصيص حسب المنطقة
