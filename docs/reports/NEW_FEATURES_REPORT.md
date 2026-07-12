# تقرير الميزات الجديدة — من المشروع الجديد (Kingdom-of-Bees2)

> هذا التقرير يوثّق الميزات التي تم تطويرها في المشروع الجديد (`Kingdom-of-Bees2`)
> وليست موجودة في هذا المشروع (`Kingdom-of-Bees`).
> الهدف: دمج هذه الميزات في المشروع الأصلي.

---

## 1. إعادة هيكلة قاعدة البيانات (Database Overhaul)

### الملخص
تحويل 12 حقل `String` حر إلى **Enums** محددة على مستوى قاعدة البيانات، مع إضافة Indexes وجداول جديدة.

### التغييرات على الـ Schema

#### الـ Enums الجديدة (12 enum)

| الـ Enum | الجدول | القيم |
|---|---|---|
| `UserRole` | `users` | `beekeeper`, `admin` |
| `HiveType` | `hives` | `Langstroth`, `Kenyan`, `TopBar` |
| `HiveStrength` | `hives` | `Strong`, `Moderate`, `Weak` |
| `QueenStatus` | `hives` | `Marked`, `Unmarked`, `Missing` |
| `InspectionType` | `inspections` | `Routine`, `Emergency`, `Harvest`, `Treatment` |
| `BroodPattern` | `inspections` | `Solid`, `Spotty`, `None` |
| `StoreLevel` | `inspections` | `Low`, `Medium`, `High` |
| `HiveTemperament` | `inspections` | `Calm`, `Nervous`, `Aggressive` |
| `ProductionType` | `productions` | `Honey`, `Wax`, `Pollen`, `RoyalJelly`, `Propolis`, `Venom` |
| `ProductionUnit` | `productions` | `kg`, `g`, `liter`, `ml` |
| `AlertStatus` | `alerts` | `Active`, `Monitoring`, `Resolved` |
| `DiseaseSeverity` | `diseases` | `Low`, `Moderate`, `High` |

#### الجداول الجديدة (4 جداول)

**1. `ApiaryMember` — عضوية المناحل**
```
id, apiaryId, userId, role (default: "assistant"), createdAt
```
- Unique constraint على `(apiaryId, userId)`
- Cascade Delete عند حذف المنحل أو المستخدم

**2. `AuditLog` — سجل التدقيق**
```
id, userId (nullable), action, entity, entityId, metadata (JSON), createdAt
```
- يسجل جميع العمليات الحساسة في النظام

**3. `SystemStats` — إحصائيات النظام**
```
id, key (unique), value (Float), updatedAt
```
- لتخزين إحصائيات النظام العامة

**4. `DashboardStats` — إحصائيات لوحة التحكم**
```
id, userId (unique), totalApiaries, totalHives, totalHoneyKg,
totalProductionEntries, activeAlerts, lastInspectionDate, updatedAt
```
- إحصائيات مُحسوبة مسبقاً لكل مستخدم لتسريع لوحة التحكم

#### تغيير سلوك الحذف
- علاقة `Alert → Disease` تغيّرت من `Cascade` إلى **`Restrict`**
- يمنع حذف مرض له تنبيهات مرتبطة

#### الـ Indexes الجديدة
```
users: email
apiaries: userId
hives: apiaryId
inspections: hiveId, date
productions: apiaryId, date
alerts: status, apiaryId, (lat, lng)
apiary_members: apiaryId, userId
audit_logs: userId, entity, createdAt
dashboard_stats: userId
```

### الملفات الجديدة

**`backend/lib/stats.js`** — دالة `updateDashboardStats(userId)`
- تُحسب وتُحدّث إحصائيات المستخدم تلقائياً
- تُستدعى من: `apiaryController`, `hiveController`, `productionController`, `alertController`, `inspectionController`

**`backend/scripts/initDashboardStats.js`** — سكريبت تهيئة
- يُنشئ سجلات `DashboardStats` للمستخدمين الموجودين

### التغييرات على الـ Controllers

جميع الـ controllers التالية تحتاج تحديث معالجة الأخطاء لـ `PrismaClientValidationError`:

| Controller | الحقول المتأثرة |
|---|---|
| `hiveController.js` | `type`, `strength`, `queenStatus` |
| `inspectionController.js` | `type`, `broodPattern`, `honeyStore`, `pollenStore`, `temperament` |
| `productionController.js` | `type`, `unit` |
| `alertController.js` | `status` |
| `diseaseController.js` | `severity` |
| `authController.js` | `role` |

---

## 2. مشاركة المناحل (Apiary Sharing)

### الملخص
نظام صلاحيات متعدد الأدوار يتيح لمالك المنحل دعوة مستخدمين آخرين بدور "مساعد".

### الصلاحيات

| العملية | المالك | المساعد |
|---|---|---|
| قراءة محتويات المنحل | ✅ | ✅ |
| إضافة/تعديل/حذف خلايا | ✅ | ✅ |
| إضافة/تعديل/حذف فحوصات | ✅ | ✅ |
| إضافة/تعديل/حذف إنتاج | ✅ | ✅ |
| إضافة/تعديل تنبيهات | ✅ | ✅ |
| تعديل بيانات المنحل | ✅ | ❌ |
| حذف المنحل | ✅ | ❌ |
| دعوة أعضاء | ✅ | ❌ |
| إزالة أعضاء | ✅ | ❌ |
| عرض قائمة الأعضاء | ✅ | ❌ |

### الملفات الجديدة

**`backend/lib/access.js`** — دالة `hasApiaryAccess(userId, apiaryId)`
```javascript
// Returns: { hasAccess: boolean, role: 'owner' | 'assistant' | null }
```

**`backend/controllers/memberController.js`** — Controller جديد
- `inviteMember` — دعوة مستخدم بالبريد الإلكتروني
- `removeMember` — إزالة عضو
- `getMembers` — جلب قائمة الأعضاء

**`backend/routes/members.js`** — Routes جديدة
```
POST   /api/apiaries/:id/members
DELETE /api/apiaries/:id/members/:memberId
GET    /api/apiaries/:id/members
```

### التغييرات على الـ Controllers الموجودة

**`apiaryController.js`:**
- `getApiaries` — يجلب المناحل المملوكة + المشتركة، ويُضيف حقل `userRole`
- `updateApiary` — يرفض المساعد بـ `403`
- `deleteApiary` — يرفض المساعد بـ `403`

**`hiveController.js`، `inspectionController.js`، `productionController.js`، `alertController.js`:**
- استبدال `apiary.userId !== req.user.id` بـ `hasApiaryAccess`

### نماذج الاستجابة الجديدة

**`GET /api/apiaries`** — يُضيف حقل `userRole` لكل منحل:
```json
{ "id": "...", "name": "...", "userRole": "owner" | "assistant" }
```

**`GET /api/apiaries/:id/members`:**
```json
[
  { "userId": "...", "name": "...", "email": "...", "role": "owner", "joinedAt": "..." },
  { "userId": "...", "name": "...", "email": "...", "role": "assistant", "joinedAt": "..." }
]
```

### رموز الأخطاء الجديدة

| الحالة | الكود |
|---|---|
| مستخدم غير مصرح له | `401` |
| مساعد يحاول عملية حصرية للمالك | `403` |
| مستخدم مدعو غير موجود | `404` |
| مستخدم عضو بالفعل | `409` |
| المالك يدعو نفسه | `400` |

---

## 3. ملخص الملفات المطلوب إنشاؤها/تعديلها

### ملفات جديدة
```
backend/lib/access.js
backend/lib/stats.js
backend/controllers/memberController.js
backend/routes/members.js
backend/scripts/initDashboardStats.js
```

### ملفات تحتاج تعديل
```
backend/prisma/schema.prisma       ← إضافة Enums + جداول جديدة + Indexes
backend/controllers/authController.js
backend/controllers/apiaryController.js
backend/controllers/hiveController.js
backend/controllers/inspectionController.js
backend/controllers/productionController.js
backend/controllers/alertController.js
backend/controllers/diseaseController.js
backend/app.js                     ← تسجيل routes الجديدة
```

---

## 4. ترتيب التنفيذ المقترح

1. تحديث `schema.prisma` وتشغيل migration
2. إنشاء `backend/lib/stats.js`
3. إنشاء `backend/lib/access.js`
4. تحديث جميع الـ controllers
5. إنشاء `memberController.js` و `routes/members.js`
6. تسجيل الـ routes في `app.js`
7. تشغيل `initDashboardStats.js` لتهيئة البيانات الموجودة
