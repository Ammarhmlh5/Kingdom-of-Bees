# خطة تنفيذ مكتبة النباتات — Kingdom of Bees

> آخر تحديث: 2026-07-08
>
> ترتيب التنفيذ: الواجهات أولاً ← قواعد البيانات ثانياً ← الأكواد الخلفية ثالثاً

---

## الصور — النهج المعتمد

جميع صور النباتات تكون **روابط من Google** أو من أي مصدر خارجي.

- عند إضافة نبتة في لوحة الإدارة → يُلصق المسؤول رابط الصورة (Google Images URL)
- لا يوجد رفع ملفات للسيرفر المحلي
- إذا احتجنا إضافة صور جديدة → نرفعها لـ Google (Drive/Photos) ونستخدم الرابط
- `images` في قاعدة البيانات: `String[]` — مصفوفة روابط URLs

```
مثال:
images: [
  "https://upload.wikimedia.org/wikipedia/commons/...",
  "https://lh3.googleusercontent.com/..."
]
```

---

## المرحلة الأولى: الواجهات (Frontend)

> **الهدف:** بناء جميع واجهات المستخدم والمسؤول أولاً باستخدام mock/interim data حيث نحتاج.

### 1.1 لوحة الإدارة (Admin Panel) — إدارة مكتبة النباتات

#### أ. تعديل الشريط الجانبي

**الملف:** `admin-panel/src/layouts/MissionControlLayout.tsx`

إضافة عنصر للمصفوفة `navItems`:

```ts
import { Flower2 } from 'lucide-react';
// ...
{ label: 'مكتبة النباتات', href: '/plants', icon: Flower2 },
```

#### ب. إضافة المسارات

**الملف:** `admin-panel/src/App.tsx`

```tsx
import { PlantsListPage } from './pages/PlantsListPage';
import { PlantFormPage } from './pages/PlantFormPage';
import { PlantDetailPage } from './pages/PlantDetailPage';

// ضمن Routes:
<Route path="/plants" element={<PlantsListPage />} />
<Route path="/plants/new" element={<PlantFormPage />} />
<Route path="/plants/:id" element={<PlantDetailPage />} />
<Route path="/plants/:id/edit" element={<PlantFormPage />} />
```

#### ج. صفحات جديدة (3 ملفات)

##### (1) `PlantsListPage.tsx` — قائمة النباتات

| الوظيفة | التفاصيل |
|---------|----------|
| عرض جدول بجميع نباتات المكتبة | الاسم العربي، الاسم العلمي، النوع، حالة التحقق |
| البحث | بحث نصي في الاسم العربي والعلمي |
| الترشيح | فلترة حسب `plantType` (TREE/SHRUB/HERB/CROP/WILDFLOWER) |
| الإجراءات | زر تعديل، زر حذف، زر تفعيل/إلغاء التحقق |
| زر إضافة | رابط لـ `/plants/new` |

##### (2) `PlantFormPage.tsx` — إضافة/تعديل نبتة

نموذج كامل يشمل جميع المجموعات:

```
المجموعة 1 — الأسماء:
  □ الاسم العلمي* (scientificName)    input type=text
  □ الاسم العربي* (commonNameAr)      input type=text
  □ الاسم الإنجليزي (commonNameEn)    input type=text
  □ الأسماء المحلية (localNames)      dynamic array + add/remove
  □ المرادفات (synonyms)              dynamic array + add/remove

المجموعة 2 — التصنيف:
  □ نوع النبات* (plantType)           select: TREE/SHRUB/HERB/CROP/WILDFLOWER
  □ العائلة (family)                  input type=text

المجموعة 3 — الوصف:
  □ الوصف بالعربية (descriptionAr)    textarea
  □ الوصف بالإنجليزية (descriptionEn) textarea
  □ الارتفاع (min / max)              input type=number (متر)

المجموعة 4 — قيمة النحالة:
  □ الرحيق (nectar.production)        select: HIGH/MEDIUM/LOW/NONE
  □ الرحيق تقييم (nectar.rating)      input type=number (1-5)
  □ حبوب اللقاح (pollen.production)   select: HIGH/MEDIUM/LOW/NONE
  □ حبوب اللقاح تقييم (pollen.rating) input type=number (1-5)
  □ الجذب (attraction)               select: HIGH/MEDIUM/LOW

المجموعة 5 — الإزهار:
  □ شهر البداية (startMonth)          input type=number (1-12)
  □ شهر النهاية (endMonth)            input type=number (1-12)
  □ شهر الذروة (peakMonth)            input type=number (1-12)
  □ لون الزهر (flowerColor)           input type=text

المجموعة 6 — التوزيع الجغرافي:
  □ المناطق الأصلية (nativeRegions)   dynamic array
  □ المناطق المزروعة (cultivatedRegions) dynamic array

المجموعة 7 — الصور (روابط Google):
  □ روابط الصور (images)              dynamic array + input type=url
  □ إرشاد: "انسخ رابط الصورة من Google Images"

المجموعة 8 — الفيديو:
  □ روابط الفيديو (videos)            dynamic array + input type=url

المجموعة 9 — المراجع:
  □ المصادر (references)              JSON textarea (اختياري)

أزرار: حفظ | إلغاء
```

**ملاحظة:** في المرحلة الأولى، النموذج يعمل بـ mock data للعرض. يتم ربطه بـ API لاحقاً في المرحلة الثالثة.

##### (3) `PlantDetailPage.tsx` — عرض تفاصيل النبتة

- عرض جميع المعلومات بشكل مقروء
- معرض الصور (Google URLs)
- معلومات الإزهار
- زر "تعديل" و "حذف" و "تفعيل التحقق"

#### د. API Service للوحة الإدارة

**الملف:** `admin-panel/src/services/plants.ts`

```ts
export const adminPlantsService = {
  list: (params?) => api.get('/admin/plants', { params }),
  get: (id) => api.get(`/admin/plants/${id}`),
  create: (data) => api.post('/admin/plants', data),
  update: (id, data) => api.put(`/admin/plants/${id}`, data),
  delete: (id) => api.delete(`/admin/plants/${id}`),
  verify: (id) => api.post(`/admin/plants/${id}/verify`),
};
```

---

### 1.2 واجهة المستخدم (User Frontend) — FloraPage

> **الملف الحالي:** `frontend-web/src/pages/FloraPage.tsx` (موجود ويحتاج تحديث)

#### أ. تعديل حوار إضافة نبات

إضافة حقول جديدة لحوار البحث الحالي:

```
□ تاريخ بدء الإزهار (bloomStartDate)   — DatePicker (اختياري)
□ المسافة من المنحل (distanceKm)       — input type=number (اختياري)
□ الاتجاه (direction)                  — select: شمال / شمال شرق / شرق / جنوب شرق / جنوب / جنوب غرب / غرب / شمال غرب (اختياري)
```

#### ب. تعديل بطاقة عرض النبات

إظهار:

- اسم النبات (العربي والعلمي) — موجود ✅
- تاريخ الإضافة — موجود ✅
- النسبة المئوية للتغطية — موجود ✅
- **تاريخ بدء الإزهار** — جديد
- **تاريخ نهاية الإزهار** — جديد
- **حالة الإزهار** — جديد:
  - 🟢 لم يبدأ (لا يوجد bloomStartDate)
  - 🟡 في طور الإزهار (bloomStartDate موجود && bloomEndDate غير موجود)
  - 🔴 انتهى (bloomEndDate موجود)
- **زر "تسجيل بداية الإزهار"** — يظهر إذا bloomStartDate فارغ
- **زر "تسجيل نهاية الإزهار"** — يظهر إذا bloomStartDate موجود && bloomEndDate فارغ
- **مدة الإزهار (أيام)** — تحسب تلقائياً من bloomStartDate → bloomEndDate

#### ج. دوال API Service

**الملف:** `frontend-web/src/services/plants.ts`

```ts
// إضافة:
updateLocalPlant: async (apiaryId, plantId, data) => {
  const response = await api.put(`/apiaries/${apiaryId}/plants/${plantId}`, data);
  return response.data;
}
```

#### د. إضافة Hook

**الملف:** `frontend-web/src/hooks/api/index.ts`

```ts
export function useUpdateLocalPlant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ apiaryId, plantId, ...data }) =>
      plantsService.updateLocalPlant(apiaryId, plantId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['plants', vars.apiaryId] });
    }
  });
}
```

---

## المرحلة الثانية: تجهيز قواعد البيانات (Database)

> **الهدف:** تعديل Prisma schema وإنشاء ملف الهجرة (migration).

### 2.1 التعديلات على `packages/db/prisma/schema.prisma`

#### أ. إضافة bloomStartDate و bloomEndDate إلى LocalPlant

**الموقع:** بعد السطر `localBlooming Json? @map("local_blooming")`

```prisma
bloomStartDate DateTime? @map("bloom_start_date") @db.Date
bloomEndDate   DateTime? @map("bloom_end_date")   @db.Date
```

#### ب. إضافة PERCENTAGE إلى CoverageUnit

```prisma
enum CoverageUnit {
  HECTARES
  TREES
  PATCHES
  PERCENTAGE    // ← إضافة

  @@map("coverage_unit")
}
```

> **ضروري:** الواجهة ترسل `coverageUnit: 'PERCENTAGE'` حالياً — بدون هذه الإضافة سيفشل الـ API.

#### ج. (اختياري) إضافة NOT_BLOOMING_YET إلى LocalPlantStatus

```prisma
enum LocalPlantStatus {
  NOT_BLOOMING_YET  // ← إضافة (اختياري)
  ACTIVE
  BLOOMING
  ENDED
  REMOVED
}
```

### 2.2 إنشاء ملف هجرة (Migration)

```bash
cd backend
npx prisma migrate dev --name add_plant_bloom_dates --schema=../packages/db/prisma/schema.prisma
```

### 2.3 Seed Data (بيانات أولية)

**الملف:** `backend/prisma/seed/plants.ts`

نباتات سعودية مقترحة (20-30 نبتة):

| الاسم العربي | الاسم العلمي | النوع | قيمة نحلية |
|-------------|-------------|-------|-----------|
| السدر | Ziziphus spina-christi | TREE | عالي جداً |
| الطلح | Acacia gerrardii | TREE | عالي |
| السمر | Acacia tortilis | TREE | متوسط |
| السلم | Acacia ehrenbergiana | TREE | متوسط |
| الأرطى | Calligonum comosum | SHRUB | متوسط |
| الرمث | Haloxylon salicornicum | SHRUB | منخفض |
| العرفج | Rhanterium epapposum | SHRUB | عالي |
| الحنظل | Citrullus colocynthis | HERB | متوسط |
| الروثة | Salsola vermiculata | SHRUB | منخفض |
| الينبوت | Lycium shawii | SHRUB | متوسط |
| الثمام | Panicum turgidum | HERB | منخفض |
| النخيل | Phoenix dactylifera | TREE | عالي |
| الحمضيات | Citrus spp. | TREE | عالي |
| الكينا | Eucalyptus spp. | TREE | عالي |
| المانجروف | Avicennia marina | SHRUB | عالي |
| دوار الشمس | Helianthus annuus | CROP | عالي |
| البرسيم | Medicago sativa | CROP | عالي |
| الكزبرة | Coriandrum sativum | HERB | متوسط |
| النعناع | Mentha spp. | HERB | متوسط |
| الساكوليا | Salsola baryosma | SHRUB | منخفض |

> **ملاحظة:** الصور تضاف لاحقاً كروابط Google عند استخدام لوحة الإدارة.

---

## المرحلة الثالثة: الربط بقاعدة البيانات والأكواد الخلفية (Backend API)

> **الهدف:** بناء طبقة API كاملة وربط الواجهات بقاعدة البيانات.

### 3.1 ملفات جديدة (طبقة API للمستخدم)

#### أ. `backend/src/services/plant.service.ts`

```ts
export class PlantService {
  // بحث في مكتبة النباتات
  async searchLibrary(query: string): Promise<PlantLibrary[]>

  // جلب نباتات منحل معين
  async getApiaryPlants(apiaryId: string): Promise<LocalPlant[]>

  // إضافة نبتة لمنحل
  async addLocalPlant(data: AddLocalPlantInput): Promise<LocalPlant>

  // تحديث نبتة (bloom dates, location...)
  async updateLocalPlant(id: string, data: UpdateLocalPlantInput): Promise<LocalPlant>

  // حذف نبتة (soft delete)
  async removeLocalPlant(id: string): Promise<LocalPlant>
}
```

**المدخلات:**

```ts
interface AddLocalPlantInput {
  apiaryId: string;
  plantId: string;
  coverage: number;
  coverageUnit: CoverageUnit;
  distanceKm?: number;
  direction?: string;
  bloomStartDate?: Date;
  notes?: string;
}

interface UpdateLocalPlantInput {
  bloomStartDate?: Date;
  bloomEndDate?: Date;
  distanceKm?: number;
  direction?: string;
  coverage?: number;
  coverageUnit?: CoverageUnit;
  notes?: string;
}
```

#### ب. `backend/src/controllers/plant.controller.ts`

5 دوال (search, listByApiary, add, update, remove) — تستخدم `ApiResponse.success/error`.

#### ج. `backend/src/routes/plant.routes.ts`

```ts
const router = Router();
router.use(requireAuth);

// بحث عام
router.get('/plants/search', controller.search.bind(controller));

// نباتات المنحل
router.get('/:apiaryId/plants', controller.listByApiary.bind(controller));
router.post('/:apiaryId/plants', controller.add.bind(controller));
router.put('/:apiaryId/plants/:plantId', controller.update.bind(controller));
router.delete('/:apiaryId/plants/:plantId', controller.remove.bind(controller));
```

#### د. `backend/src/validators/plant.schema.ts`

```ts
import { z } from 'zod';

export const addLocalPlantSchema = z.object({
  plantId: z.string().uuid(),
  coverage: z.number().positive(),
  coverageUnit: z.enum(['HECTARES', 'TREES', 'PATCHES', 'PERCENTAGE']),
  distanceKm: z.number().min(0).optional(),
  direction: z.string().optional(),
  bloomStartDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateLocalPlantSchema = z.object({
  bloomStartDate: z.string().datetime().optional(),
  bloomEndDate: z.string().datetime().optional(),
  distanceKm: z.number().min(0).optional(),
  direction: z.string().optional(),
  coverage: z.number().positive().optional(),
  coverageUnit: z.enum(['HECTARES', 'TREES', 'PATCHES', 'PERCENTAGE']).optional(),
  notes: z.string().optional(),
});
```

> **ملاحظة:** `bloomEndDate` يجب أن يكون بعد `bloomStartDate` إذا كان كلاهما موجوداً:
>
> ```ts
> .refine(data => !data.bloomEndDate || !data.bloomStartDate || data.bloomEndDate >= data.bloomStartDate, {
>   message: 'تاريخ نهاية الإزهار يجب أن يكون بعد تاريخ البداية'
> })
> ```

#### هـ. `backend/src/repositories/plant.repository.ts` (اختياري — للمرحلة المتقدمة)

```ts
export class PlantRepository {
  async findPlantsByApiary(apiaryId: string)
  async searchPlants(query: string)
  async createLocalPlant(data)
  async updateLocalPlant(id, data)
  async removeLocalPlant(id)  // soft delete
}
```

### 3.2 ملفات جديدة (طبقة API للمسؤول)

#### أ. `backend/src/services/admin-plant.service.ts`

```ts
export class AdminPlantService {
  async listPlants(params: { page, limit, type?, search?, verified? })
  async getPlant(id: string)
  async createPlant(data: CreatePlantInput)
  async updatePlant(id: string, data: UpdatePlantInput)
  async deletePlant(id: string)  // hard delete
  async verifyPlant(id: string, verifiedBy: string)
}
```

#### ب. `backend/src/controllers/admin-plant.controller.ts`

6 دوال (list, get, create, update, delete, verify).

#### ج. `backend/src/routes/admin-plant.routes.ts`

```ts
const router = Router();
router.use(requireAuth);
router.use(requireAdmin); // middleware تحقق من صلاحية المسؤول

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.post('/:id/verify', controller.verify.bind(controller));
```

### 3.3 تحديث `backend/src/index.ts`

```ts
import plantRoutes from './routes/plant.routes';
import adminPlantRoutes from './routes/admin-plant.routes';

// إضافة:
app.use('/api/apiaries', plantRoutes);    // /api/apiaries/:apiaryId/plants
app.use('/api/plants', plantRoutes);      // /api/plants/search
app.use('/api/admin/plants', adminPlantRoutes); // /api/admin/plants
```

### 3.4 ربط الواجهات بالـ API

#### Admin Panel

بعد إنشاء الـ API، تحديث `admin-panel/src/services/plants.ts` لاستدعاء endpoints حقيقية بدلاً من mock data.

#### User Frontend

بعد إنشاء الـ API، `frontend-web/src/services/plants.ts` يعمل تلقائياً (لأن المسارات متطابقة مع ما يرسله حالياً).

### 3.5 الاختبارات

```
backend/src/tests/
  plant.service.test.ts
  plant.controller.test.ts
  admin-plant.service.test.ts
  admin-plant.controller.test.ts

frontend-web/src/__tests__/  (أو في المسار المستخدم للمشروع)
  FloraPage.test.tsx
```

---

## جدول زمني مقترح

| المرحلة | المدة | المخرجات |
|---------|-------|----------|
| **الأولى: واجهات** | 4-5 أيام | 3 صفحات Admin + تحديث FloraPage + mock data للعرض |
| **الثانية: قاعدة بيانات** | 1 يوم | تحديث schema + migration + seed data |
| **الثالثة: API وربط** | 4-5 أيام | 7 ملفات Backend + ربط الواجهات + اختبارات |

---

## ملخص جميع الملفات

### المرحلة الأولى — واجهات (7 ملفات)

| الملف | الحالة |
|-------|--------|
| `admin-panel/src/pages/PlantsListPage.tsx` | 🆕 جديد |
| `admin-panel/src/pages/PlantFormPage.tsx` | 🆕 جديد |
| `admin-panel/src/pages/PlantDetailPage.tsx` | 🆕 جديد |
| `admin-panel/src/services/plants.ts` | 🆕 جديد |
| `admin-panel/src/layouts/MissionControlLayout.tsx` | ✏️ تعديل |
| `admin-panel/src/App.tsx` | ✏️ تعديل |
| `frontend-web/src/pages/FloraPage.tsx` | ✏️ تعديل |
| `frontend-web/src/services/plants.ts` | ✏️ تعديل (إضافة update) |
| `frontend-web/src/hooks/api/index.ts` | ✏️ تعديل (إضافة useUpdateLocalPlant) |

### المرحلة الثانية — قاعدة بيانات (2 ملفات)

| الملف | الحالة |
|-------|--------|
| `packages/db/prisma/schema.prisma` | ✏️ تعديل (bloomStartDate, bloomEndDate, PERCENTAGE) |
| `backend/prisma/seed/plants.ts` | 🆕 جديد |

### المرحلة الثالثة — API (9 ملفات)

| الملف | الحالة |
|-------|--------|
| `backend/src/services/plant.service.ts` | 🆕 جديد |
| `backend/src/controllers/plant.controller.ts` | 🆕 جديد |
| `backend/src/routes/plant.routes.ts` | 🆕 جديد |
| `backend/src/validators/plant.schema.ts` | 🆕 جديد |
| `backend/src/services/admin-plant.service.ts` | 🆕 جديد |
| `backend/src/controllers/admin-plant.controller.ts` | 🆕 جديد |
| `backend/src/routes/admin-plant.routes.ts` | 🆕 جديد |
| `backend/src/index.ts` | ✏️ تعديل |
| `backend/src/tests/*.test.ts` | 🆕 جديد |
