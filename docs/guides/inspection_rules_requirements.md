# متطلبات نظام إدارة الفحوصات الذكي (Smart Inspection Management System)

## 📌 نظرة عامة

نظام ذكي لإدارة فحوصات الخلايا يضمن:
1. ✅ ضبط الحدود الزمنية لكل نوع فحص (من قبل المبرمج)
2. ✅ جدولة الفحوصات القادمة تلقائياً عند إجراء فحص
3. ✅ إرسال تنبيهات ذكية (قبل/في/بعد موعد الفحص)
4. ✅ تتبع حالة الفحوصات (مجدول/مكتمل/متأخر)

---

## 🎯 الفكرة الأساسية

### سير العمل الكامل:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. المبرمج يضبط الحدود (InspectionSettings)                       │
│     - نوع الفحص: روتيني                                            │
│     - الحد الأدنى: 3 أيام                                          │
│     - الحد الأعلى: 10 أيام                                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. المستخدم يسجل فحص للخلية                                       │
│     - يختار نوع الفحص                                              │
│     - يدخل التاريخ                                                 │
│     - النظام يتحقق من الحدود                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. النظام يخطط الفحص القادم تلقائياً                              │
│     - يحسب: تاريخ الفحص + maxInterval                              │
│     - ينشئ جدولة في InspectionSchedule                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. إرسال التنبيهات                                                │
│     - قبل يوم من الموعد                                            │
│     - في يوم الموعد                                                │
│     - إذا تأخر (بعد maxInterval)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ هيكل قاعدة البيانات

### 1. جدول إعدادات الفحص (InspectionSettings)

```prisma
model InspectionSetting {
  id          String   @id @default(uuid())
  type        String   @unique // ROUTINE, QUICK_CHECK, DISEASE_CHECK, QUEEN_CHECK
  nameAr      String   // الاسم بالعربي
  minInterval int      // الحد الأدنى (بالأيام) - أقل فترة بين الفحوصات
  maxInterval int      // الحد الأعلى (بالأيام) - أقصى فترة مسموحة
  isActive    Boolean  @default(true)
  description String?  // وصف إضافي
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  schedules   InspectionSchedule[]
  @@map("inspection_settings")
}
```

### 2. جدول جدولة الفحوصات (InspectionSchedule)

```prisma
model InspectionSchedule {
  id            String    @id @default(uuid())
  hiveId        String
  settingId     String
  scheduledDate DateTime  // الموعد المجدول
  status        String    @default("PENDING") // PENDING, COMPLETED, MISSED, CANCELLED
  completedAt   DateTime? // تاريخ إتمام الفحص (إذا تم)
  reminderSent  Boolean   @default(false)     // هل تم إرسال تنبيه؟
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  hive          Hive              @relation(fields: [hiveId], references: [id], onDelete: Cascade)
  setting       InspectionSetting @relation(fields: [settingId], references: [id])
  
  @@index([hiveId])
  @@index([scheduledDate])
  @@index([status])
  @@map("inspection_schedules")
}
```

---

## 🎯 أنواع الفحص والإعدادات الافتراضية

| نوع الفحص | الاسم بالعربي | الحد الأدنى | الحد الأعلى | الوصف |
|-----------|--------------|-------------|-------------|-------|
| ROUTINE | فحص روتيني | 3 أيام | 10 أيام | الفحص الدوري الروتيني |
| QUICK_CHECK | فحص سريع | 0 أيام | 1 يوم | فحص سريع حسب الحاجة |
| DISEASE_CHECK | فحص أمراض | 0 أيام | 3 أيام | متابعة حالة الأمراض |
| QUEEN_CHECK | فحص ملكات | 14 يوم | 21 يوم | متابعة الملكات والتربية |

---

## 🔧 منطق العمل (Business Logic)

### 1. تسجيل فحص جديد (Record Inspection):

```typescript
async function recordInspection(data: CreateInspectionDTO) {
  // 1. التحقق من صحة التاريخ
  const setting = await getInspectionSetting(data.type);
  validateDate(data.date, setting);
  
  // 2. حفظ الفحص
  const inspection = await saveInspection(data);
  
  // 3. جدولة الفحص القادم تلقائياً
  const nextDate = calculateNextDate(data.date, setting.maxInterval);
  await createInspectionSchedule({
    hiveId: data.hiveId,
    settingId: setting.id,
    scheduledDate: nextDate,
    status: 'PENDING'
  });
  
  // 4. التحقق من الموعد المجدول السابق
  await checkAndUpdatePreviousSchedule(data.hiveId, data.date);
}
```

### 2. حساب تاريخ الفحص القادم:

```typescript
function calculateNextDate(lastInspectionDate: Date, maxInterval: number): Date {
  const nextDate = new Date(lastInspectionDate);
  nextDate.setDate(nextDate.getDate() + maxInterval);
  return nextDate;
}
```

### 3. التحقق من الموعد المجدول السابق:

```typescript
async function checkAndUpdatePreviousSchedule(hiveId: string, completedDate: Date) {
  const pendingSchedule = await getPendingSchedule(hiveId);
  
  if (pendingSchedule) {
    if (completedDate >= pendingSchedule.scheduledDate) {
      // تم الفحص في الوقت المحدد أو م��أخراً
      await updateScheduleStatus(pendingSchedule.id, 'COMPLETED');
    } else {
      // تم الفحص مبكراً
      await updateScheduleStatus(pendingSchedule.id, 'COMPLETED');
      // إلغاء الجدولة الجديدة لأن الفحص تم مبكراً
      await cancelSchedule(pendingSchedule.id);
    }
  }
}
```

### 4. إرسال التنبيهات (Cron Job):

```typescript
async function sendInspectionReminders() {
  // 1. تنبيهات قبل يوم واحد
  const tomorrow = getTomorrowDate();
  const upcomingSchedules = await getSchedulesForDate(tomorrow);
  
  for (const schedule of upcomingSchedules) {
    await sendNotification({
      type: 'INSPECTION_REMINDER',
      hiveId: schedule.hiveId,
      message: `تذكير: فحص ${schedule.setting.nameAr} غداً`
    });
    await markReminderSent(schedule.id);
  }
  
  // 2. تنبيهات المتأخرين
  const overdueSchedules = await getOverdueSchedules();
  
  for (const schedule of overdueSchedules) {
    const daysOverdue = calculateDaysOverdue(schedule.scheduledDate);
    await sendNotification({
      type: 'INSPECTION_OVERDUE',
      hiveId: schedule.hiveId,
      message: `تنبيه: تأخر فحص ${schedule.setting.nameAr} بـ ${daysOverdue} أيام`
    });
    await updateScheduleStatus(schedule.id, 'MISSED');
  }
}
```

---

## 🔌 واجهات برمجة التطبيقات (API Endpoints)

### إدارة الإعدادات:
```
GET    /api/inspection-settings              # عرض جميع الإعدادات
GET    /api/inspection-settings/:type        # تفاصيل إعداد نوع محدد
POST   /api/inspection-settings              # إنشاء إعداد جديد
PUT    /api/inspection-settings/:type        # تحديث إعداد نوع محدد
```

### إدارة الجداول:
```
GET    /api/hives/:hiveId/schedules           # جداول فحص خلية محددة
GET    /api/apiaries/:apiaryId/schedules      # جميع الجداول للمنحل
GET    /api/schedules/upcoming                # الجداول القادمة
GET    /api/schedules/overdue                 # الجداول المتأخرة
POST   /api/schedules                         # إنشاء جدول يدوي
PUT    /api/schedules/:id/complete            # تحديد كمكتمل
```

### التحقق:
```
POST   /api/inspections/validate              # التحقق من صحة التاريخ
```

---

## 💻 الواجهة الأمامية (Frontend)

### الصفحات المطلوبة:

1. **`InspectionSettingsPage.tsx`** (لوحة المبرمج)
   - جدول الإعدادات الحالية
   - نموذج تعديل الحدود
   - حفظ التغييرات

2. **`InspectionSchedulesPage.tsx`** (صفحة المهام)
   - قائمة الفحوصات المجدولة
   - فلاتر: (قادمة/مكتملة/متأخرة)
   - عرض تفاصيل كل جدولة

3. **تحديث `AddInspectionModal.tsx`**
   - عرض الحدود عند اختيار نوع الفحص
   - رسالة خطأ إذا خرج التاريخ عن النطاق

---

## 📅 جدولCron Jobs (المهام المجدولة)

| الوقت | المهمة |
|-------|--------|
| كل يوم الساعة 8 صباحاً | إرسال تنبيهات يوم الغد |
| كل يوم الساعة 9 صباحاً | فحص الجداول المتأخرة وإرسال تنبيهات |
| كل أسبوع | تقرير أسبوعي للفحوصات |

---

## 📋 نموذج البيانات الكامل

### InspectionSetting:
```json
{
  "type": "ROUTINE",
  "nameAr": "فحص روتيني",
  "minInterval": 3,
  "maxInterval": 10,
  "isActive": true,
  "description": "الفحص الدوري الروتيني للخلايا"
}
```

### InspectionSchedule:
```json
{
  "hiveId": "uuid-here",
  "settingId": "uuid-here",
  "scheduledDate": "2026-07-15T00:00:00Z",
  "status": "PENDING",
  "reminderSent": false
}
```

---

## 🔄 سيناريوهات العمل

### السيناريو (1): فحص في الوقت المحدد
```
📅 1 يوليو: فحص روتيني للخلية 5
📅 11 يوليو: الموعد المجدول (10 أيام)
📅 10 يوليو: تنبيه "فحص غداً"
📅 11 يوليو: المستخدم يفحص الخلية
✅ النظام: يحدد الجدول كمكتمل + يخطط فحص جديد
```

### السيناريو (2): فحص مبكر
```
📅 1 يوليو: فحص روتيني للخلية 5
📅 5 يوليو: المستخدم يفحص مبكراً (يوم 5)
✅ النظام: يحدد الجدول كمكتمل + يحسب فحص جديد (يوم 15)
❌ النظام: لا يلغي الجدول الجديد
```

### السيناريو (3): فحص متأخر
```
📅 1 يوليو: فحص روتيني للخلية 5
📅 11 يوليو: الموعد المجدول
📅 15 يوليو: تنبيه "متأخر بيوم"
📅 20 يوليو: المستخدم يفحص
✅ النظام: يحدد الجدول كمكتمل + يحسب فحص جديد
```

---

## 🎨 الملاحظات التصميمية

- **الجدولة التلقائية**: تحدث فقط عند اختيار نوع الفحص وليس "فحص سريع"
- **الحد الأدنى**: يمنع الجدولة المتكررة جداً
- **الحد الأعلى**: يمنع التأخير المفرط ويضمن جودة الرعاية
- **الإشعارات**: ترسل فقط لـ PENDING و MISSED
- **الإلغاء**: يمكن للمستخدم إلغاء جدولة يدوياً

---

## 📅 ترتيب التنفيذ

1. **الأولوية العالية:** إضافة الجداول في Prisma
2. **الأولوية العالية:** إنشاء API للإعدادات والجداول
3. **الأولوية العالية:** تعديل `recordInspection` للجدولة التلقائية
4. **الأولوية المتوسطة:** إنشاء Cron Job للتنبيهات
5. **الأولوية المتوسطة:** إنشاء صفحة الإعدادات
6. **الأولوية المتوسطة:** إنشاء صفحة الجداول
7. **الأولوية المنخفضة:** إضافة التحقق في نموذج الفحص

---

## 📚 الملفات المطلوب إنشاؤها/تعديلها

### Backend:
| الملف | الإجراء |
|-------|---------|
| `prisma/schema.prisma` | إضافة جدولين |
| `backend/src/controllers/inspectionSetting.controller.ts` | جديد |
| `backend/src/services/inspectionSetting.service.ts` | جديد |
| `backend/src/services/schedule.service.ts` | جديد |
| `backend/src/cron/inspection.reminders.ts` | جديد |
| `backend/src/services/inspection.service.ts` | تعديل - إضافة جدولة تلقائية |

### Frontend:
| الملف | الإجراء |
|-------|---------|
| `frontend-web/src/pages/InspectionSettingsPage.tsx` | جديد |
| `frontend-web/src/pages/InspectionSchedulesPage.tsx` | جديد |
| `frontend-web/src/hooks/api/useInspectionSettings.ts` | جديد |
| `frontend-web/src/hooks/api/useInspectionSchedules.ts` | جديد |
| `frontend-web/src/services/inspectionSettings.ts` | جديد |
| `frontend-web/src/services/inspectionSchedules.ts` | جديد |
| `frontend-web/src/components/wizards/AddInspectionModal.tsx` | تعديل |

---

## ✅ ملخص النظام

| المكون | الوصف |
|--------|-------|
| **إعدادات الفحص** | يحددها المبرمج (3-10 أيام للروتيني) |
| **الجدولة التلقائية** | تحدث عند كل فحص (تاريخ + maxInterval) |
| **التنبيهات** | قبل يوم + في يوم + عند ��لتأخر |
| **تتبع الحالة** | PENDING → COMPLETED/MISSED |

---

**تم إنشاء هذا المستند في:** 2 يوليو 2026  
**المشروع:** Kingdom of Bees  
**الحالة:** متطلبات نهائية