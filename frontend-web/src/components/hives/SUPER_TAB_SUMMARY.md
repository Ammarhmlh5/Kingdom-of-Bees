# ملخص تطوير تبويب "رفع أدوار وعاسلات" (SuperTab)

## تاريخ المحادثة: 2026-07-07

---

## 1. الهدف من التبويب

فرز وعرض الخلايا التي تصلح لرفع دور ثاني (طابق 2) أو دور ثالث (طابق 3)، مع إمكانية إضافة حاجز ملكات.

---

## 2. الملفات المعدلة (3 ملفات)

### 2.1 `backend/src/services/super.service.ts`

**التغيير الرئيسي:** إعادة هيكلة منطق اكتشاف المرشحين.

#### واجهة `SuperCandidate`:
```ts
{
  readiness: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER' | 'MONITOR';
  targetStory: 2 | 3;
}
```

#### منطق الكشف (`getSuperCandidates`):

| الحالة | الطوابق | الشرط | النتيجة |
|---|---|---|---|
| دور ثاني | 1 | ≥5 إطارات حاضنة (>50%) + قوة ≥60 | `ADD_SECOND_STORY` |
| دور ثالث | 2 | ≥4 إطارات عسل بالطابق 2 + قوة ≥70 + ≥5 حاضنة بالطابق 1 | `ADD_THIRD_STORY` |
| حاجز ملكات | 2 | ≥2 إطارات عسل بالطابق 2 + قوة ≥65 | `ADD_EXCLUDER` |
| مراقبة | أي | الباقي | `MONITOR` |

#### تحسينات إضافية:
- استخدام `strengthRating` كخيار احتياطي عند عدم وجود `strengthScore` (VERY_STRONG=90, STRONG=75, MEDIUM=50, ...)
- تخفيض العتبات لتكون أكثر عملية مع البيانات الحقيقية
- توصيات مختلفة حسب مستوى الجاهزية

#### واجهة `SuperData` (لإضافة دور):
```ts
{
  operationType: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER';
  targetStory: 2 | 3;
}
```

#### تحديث `addSuper`:
- `ADD_EXCLUDER` لا يزيد عدد الطوابق ولا ينشئ إطارات جديدة — فقط يضبط حاجز الملكات
- وصف العملية يتغير ديناميكياً: "رفع دور ثاني" / "رفع دور ثالث" / "حاجز ملكات"

#### إصلاح نوع `seasonalContext`:
- تغيير `currentSeason` → `season` و `upcomingFlows` → `flows` لمطابقة البيانات الفعلية

---

### 2.2 `frontend-web/src/services/hives.ts`

تحديث الأنواع لتتوافق مع backend:

```ts
interface SuperCandidate {
  readiness: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER' | 'MONITOR';
  targetStory: 2 | 3;
}

interface AddSuperData {
  operationType: 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER';
  targetStory: 2 | 3;
}

interface SeasonalContext {
  season: string;
  flows: string[];
  daysUntilPeak: number;
}
```

---

### 2.3 `frontend-web/src/components/hives/SuperTab.tsx`

تحديث كامل للواجهة (490 سطر).

#### التكوين البصري (`readinessConfig`):

| الحالة | اللون | الأيقونة | النص |
|---|---|---|---|
| `ADD_SECOND_STORY` | أخضر (`bg-green-500`) | `ArrowUp` | "جاهزة لرفع دور ثاني" |
| `ADD_THIRD_STORY` | أزرق (`bg-blue-600`) | `ChevronsUp` | "جاهزة لرفع دور ثالث" |
| `ADD_EXCLUDER` | كهرماني (`bg-amber-500`) | `Layers` | "جاهزة لحاجز ملكات" |

#### المكونات المضافة:
- **وسيلة إيضاح (Legend)** أعلى قائمة المرشحين بثلاثة ألوان
- **عرض الترقية** في البطاقة: "الطوابق الحالية: 2 ← 3" باللون الأخضر
- **نموذج ديناميكي** يتغير حسب نوع العملية:
  - دور ثاني/ثالث: يعرض عدد الإطارات والإنتاج المتوقع
  - حاجز ملكات: نموذج مبسط بدون إطارات
- **توصيات إطارات** مختلفة حسب نوع الرفع (حاضنة للدور الثاني، عسل للدور الثالث)
- **أزرار بألوان مختلفة** لكل إجراء

#### تدفق البيانات:
```
Backend Controller → { success: true, data: { candidates, seasonalContext } }
  → Axios (response.data.data)
  → SuperTab (data.candidates, data.seasonalContext)
```

---

## 3. المشاكل التي تمت معالجتها

### المشكلة: عدم ظهور الخلايا
**السبب:** البذرة (seed) تنشئ خلية واحدة بدون `strengthScore` (null) وبدون إطارات (`frames: []`).

**الحل:**
1. استخدام `strengthRating` كخيار احتياطي لتحويله إلى درجة رقمية
2. تخفيض العتبات: `broodFrames ≥ 7` → `≥ 5` و `strengthScore ≥ 75` → `≥ 60`

### المشكلة: عدم تطابق أنواع `seasonalContext`
**السبب:** Backend يصرّح بـ `currentSeason`/`upcomingFlows` لكن يعيد فعلياً `season`/`flows`.

**الحل:** تصحيح الأنواع في backend و frontend لتطابق `season`/`flows`.

---

## 4. أوامر التشغيل

```bash
# Backend
cd backend && npm run dev            # خادم التطوير (منفذ 4000)

# Frontend
cd frontend-web && npm run dev       # خادم الواجهة (منفذ 5173)

# التحقق من الأخطاء
cd frontend-web && npm run lint      # فحص الـ lint
cd backend && npx tsc --noEmit       # فحص TypeScript
```

---

## 5. اختبار التبويب

1. سجل الدخول إلى التطبيق
2. اختر منحلاً من القائمة
3. اذهب إلى تبويب "الخلايا"
4. اختر تبويب **"رفع أدوار وعاسلات"** (الأيقونة: ↑)
5. ستظهر الخلايا الجاهزة لرفع دور ثاني (أخضر)، دور ثالث (أزرق)، أو حاجز ملكات (كهرماني)
