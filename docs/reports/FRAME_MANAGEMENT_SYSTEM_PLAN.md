# خطة نظام إدارة الإطارات التفاعلي - ملخص تنفيذي

**تاريخ:** 8 يناير 2026  
**الحالة:** جاهز للتنفيذ  
**الأولوية:** عالية جداً  
**المدة المتوقعة:** 5-7 أيام

---

## 🎯 الهدف

تطوير نظام شامل لإدارة الإطارات (Frames) في الخلايا، باعتبار الإطار الوحدة الأساسية لاتخاذ جميع القرارات في النظام. يوفر النظام واجهة تفاعلية بديهية تعتمد على المؤشرات المرئية (Sliders) لتسجيل وتتبع حالة كل إطار بدقة.

---

## 📋 نظرة عامة

### المشكلة:
حالياً، النظام لا يوفر طريقة تفاعلية ودقيقة لتسجيل محتويات الإطارات، مما يؤدي إلى:
- عدم دقة التوصيات
- صعوبة تقييم قوة الخلية
- عدم القدرة على التنبؤ بالمشاكل مبكراً
- صعوبة حساب احتياجات التغذية

### الحل:
نظام تفاعلي متكامل يسمح بـ:
- تسجيل نسب العسل والحضنة وحبوب اللقاح بدقة (0-100%)
- تحديد عمر الحضنة (بيض → يرقات → عذارى → جاهزة)
- تتبع تاريخ كل إطار عبر الزمن
- حساب توصيات ذكية بناءً على البيانات الفعلية
- إرسال تنبيهات استباقية

---

## 🎨 الواجهة التفاعلية

### المؤشرات (Sliders):

1. **مؤشر العسل (Vertical - من الأعلى للأسفل)**
   ```
   ┌─┐
   │░│ ← 0% (فارغ)
   │░│
   │█│ ← 50%
   │█│
   │█│ ← 100% (ممتلئ)
   └─┘
   ```

2. **مؤشر الحضنة (Horizontal - من اليمين لليسار)**
   ```
   ├──────────────┤
   0%      50%    100%
   ```

3. **مؤشر عمر الحضنة (Vertical - من الأعلى للأسفل)**
   ```
   ┌─┐
   │█│ ← بيض (0-3 أيام)
   │░│ ← يرقات (4-9 أيام)
   │░│ ← عذارى (10-20 يوم)
   │░│ ← جاهزة (21+ يوم)
   └─┘
   ```

### التمثيل البصري:
- **عسل:** لون ذهبي/أصفر 🍯
- **حضنة:** لون بني/بيج 🐝
- **حبوب لقاح:** لون برتقالي 🌼
- **بيض:** نقاط بيضاء صغيرة
- **يرقات:** خطوط منحنية
- **عذارى:** خلايا مغلقة
- **جاهزة:** خلايا داكنة مغلقة

---

## 🗄️ التغييرات في قاعدة البيانات

### 1. تحديث HiveFrame (موجود):
```prisma
model HiveFrame {
  // ... الحقول الموجودة
  
  // NEW: إضافة عمر الحضنة
  broodAge BroodAge? @map("brood_age")
  
  // NEW: العلاقة مع اللقطات
  snapshots FrameSnapshot[]
}
```

### 2. جدول جديد: FrameSnapshot
```prisma
model FrameSnapshot {
  id      String @id @default(uuid())
  frameId String
  
  // حالة الإطار في هذه اللحظة
  honeyPercentage  Int
  broodPercentage  Int
  pollenPercentage Int
  broodAge         BroodAge?
  
  // السياق
  inspectionId String?
  userId       String
  notes        String?
  recordedAt   DateTime @default(now())
  
  // العلاقات
  frame      HiveFrame
  inspection Inspection?
  user       UserProfile
}
```

### 3. Enum جديد: BroodAge
```prisma
enum BroodAge {
  EGGS      // بيض (0-3 أيام)
  LARVAE    // يرقات (4-9 أيام)
  PUPAE     // عذارى (10-20 يوم)
  EMERGING  // جاهزة للخروج (21+ يوم)
}
```

---

## 🔧 Backend APIs الجديدة

### Frame Management:
```
GET    /api/hives/:hiveId/frames          # جميع إطارات الخلية
GET    /api/frames/:frameId                # إطار محدد
PUT    /api/frames/:frameId                # تحديث الإطار
POST   /api/hives/:hiveId/frames          # إضافة إطار
DELETE /api/frames/:frameId                # حذف إطار
GET    /api/frames/:frameId/history       # تاريخ الإطار
```

### Analysis & Recommendations:
```
GET /api/hives/:hiveId/analysis           # تحليل شامل
GET /api/hives/:hiveId/recommendations    # التوصيات
GET /api/hives/:hiveId/stats              # الإحصائيات
```

---

## 🧮 محرك الحسابات

### 1. حساب قوة الخلية:
```typescript
- 8+ إطارات حضنة → قوية جداً
- 5-7 إطارات حضنة → قوية
- 3-4 إطارات حضنة → متوسطة
- أقل من 3 → ضعيفة
```

### 2. احتياج التغذية:
```typescript
- متوسط عسل < 20% → تغذية طارئة
- متوسط عسل < 30% → تغذية عالية الأولوية
- متوسط عسل < 50% → تغذية عادية
```

### 3. خطر التطريد:
```typescript
- 5+ إطارات بحضنة جاهزة → خطر عالي
- 3-4 إطارات بحضنة جاهزة → خطر متوسط
- أقل من 3 → خطر منخفض
```

### 4. مشاكل الملكة:
```typescript
- لا يوجد بيض لمدة 7+ أيام → فحص الملكة
- حضنة غير منتظمة في 3+ إطارات → فحص الأمراض
```

---

## 🚨 نظام التنبيهات الذكية

### أنواع التنبيهات:

1. **خطر تطريد (HIGH)**
   - الشرط: 5+ إطارات بحضنة جاهزة
   - الإجراء: فحص فوري وتقسيم أو إضافة مساحة

2. **مشكلة ملكة (HIGH)**
   - الشرط: لا يوجد بيض لمدة 7+ أيام
   - الإجراء: فحص الملكة فوراً

3. **تغذية طارئة (HIGH)**
   - الشرط: متوسط عسل < 20%
   - الإجراء: تغذية فورية

4. **اشتباه بمرض (MEDIUM)**
   - الشرط: حضنة غير منتظمة في 3+ إطارات
   - الإجراء: فحص الأمراض

5. **مساحة مطلوبة (MEDIUM)**
   - الشرط: 80%+ من الإطارات ممتلئة بالعسل
   - الإجراء: إضافة طابق علوي

---

## 📱 Frontend Components الجديدة

### 1. FrameEditor
- واجهة تفاعلية لتحرير الإطار
- 3 مؤشرات (عسل، حضنة، عمر حضنة)
- معاينة مرئية فورية
- Validation (مجموع ≤ 100%)

### 2. FrameCard
- عرض مرئي للإطار
- ألوان حسب المحتوى
- أيقونات حسب النوع
- onClick للتحرير

### 3. HiveFramesView
- عرض جميع إطارات الخلية
- Grid layout
- Filter/Search
- Add Frame button

### 4. FrameHistoryView
- Timeline للقطات
- Comparison view
- Filter by date

### 5. HiveAnalysisCard
- قوة الخلية
- توصيات التغذية
- خطر التطريد
- التنبيهات

### 6. AlertsList
- جميع التنبيهات النشطة
- تصنيف حسب الأولوية
- Dismiss functionality
- Action buttons

---

## 📊 خطة التنفيذ (7 أيام)

### اليوم 1: قاعدة البيانات
- ✅ تحديث Schema
- ✅ إنشاء FrameSnapshot
- ✅ إنشاء BroodAge enum
- ✅ Migration
- ✅ Seeds

### اليوم 2-3: Backend
- ✅ Frame Repository & Service
- ✅ Analysis Service
- ✅ Alert Service
- ✅ Controllers
- ✅ Routes

### اليوم 3: Frontend Services
- ✅ Frame Service
- ✅ Analysis Service
- ✅ TypeScript Types

### اليوم 4-5: Frontend Components
- ✅ FrameCard
- ✅ FrameEditor
- ✅ BroodAgeIndicator
- ✅ HiveFramesView
- ✅ FrameHistoryView
- ✅ HiveAnalysisCard
- ✅ AlertsList

### اليوم 5-6: Frontend Pages
- ✅ تحديث CreateHivePage
- ✅ تحديث HiveDetailPage
- ✅ إنشاء FrameDetailPage
- ✅ تحديث InspectionPage
- ✅ إنشاء HiveAnalysisPage

### اليوم 6: نظام التنبيهات
- ✅ Alert Checker Job
- ✅ تكامل مع Notifications
- ✅ AlertsPage

### اليوم 7: الاختبار
- ✅ Backend APIs
- ✅ Frontend Components
- ✅ Integration
- ✅ Performance
- ✅ Documentation

---

## 🎯 الفوائد المتوقعة

### 1. دقة أعلى:
- تسجيل دقيق لحالة كل إطار
- بيانات موثوقة للتحليل
- توصيات مبنية على بيانات فعلية

### 2. توقع المشاكل:
- اكتشاف خطر التطريد مبكراً
- اكتشاف مشاكل الملكة
- اكتشاف نقص الغذاء

### 3. قرارات أفضل:
- حساب دقيق لاحتياجات التغذية
- تقييم موضوعي لقوة الخلية
- توصيات مخصصة لكل خلية

### 4. تتبع التطور:
- تاريخ كامل لكل إطار
- مقارنة بين الفحوصات
- تحليل الاتجاهات

### 5. تجربة مستخدم محسنة:
- واجهة بديهية وسهلة
- تسجيل سريع
- معاينة مرئية فورية

---

## 📁 الملفات المطلوبة

### قاعدة البيانات (1):
1. `shared-database/prisma/schema.prisma` (تحديث)

### Backend (15 ملف):
2. `backend/src/repositories/frame.repository.ts` (جديد)
3. `backend/src/services/frame.service.ts` (جديد)
4. `backend/src/services/analysis.service.ts` (جديد)
5. `backend/src/services/alert.service.ts` (تحديث)
6. `backend/src/controllers/frame.controller.ts` (جديد)
7. `backend/src/controllers/analysis.controller.ts` (جديد)
8. `backend/src/routes/frame.routes.ts` (جديد)
9. `backend/src/routes/analysis.routes.ts` (جديد)
10. `backend/src/routes/index.ts` (تحديث)
11. `backend/src/jobs/alert-checker.job.ts` (جديد)

### Frontend Services (3):
12. `frontend-web/src/services/frames.ts` (جديد)
13. `frontend-web/src/services/analysis.ts` (جديد)
14. `frontend-web/src/types/frame.ts` (جديد)

### Frontend Components (7):
15. `frontend-web/src/components/frames/FrameCard.tsx` (جديد)
16. `frontend-web/src/components/frames/FrameEditor.tsx` (جديد)
17. `frontend-web/src/components/frames/BroodAgeIndicator.tsx` (جديد)
18. `frontend-web/src/components/frames/HiveFramesView.tsx` (جديد)
19. `frontend-web/src/components/frames/FrameHistoryView.tsx` (جديد)
20. `frontend-web/src/components/analysis/HiveAnalysisCard.tsx` (جديد)
21. `frontend-web/src/components/alerts/AlertsList.tsx` (جديد)

### Frontend Pages (5):
22. `frontend-web/src/pages/CreateHivePage.tsx` (تحديث)
23. `frontend-web/src/pages/HiveDetailPage.tsx` (تحديث)
24. `frontend-web/src/pages/FrameDetailPage.tsx` (جديد)
25. `frontend-web/src/pages/InspectionPage.tsx` (تحديث)
26. `frontend-web/src/pages/HiveAnalysisPage.tsx` (جديد)
27. `frontend-web/src/pages/AlertsPage.tsx` (جديد)

**إجمالي:** 27 ملف (18 جديد، 9 محدث)

---

## ✅ Checklist التنفيذ

### المرحلة 1: قاعدة البيانات ✅
- [ ] تحديث HiveFrame model
- [ ] إنشاء FrameSnapshot model
- [ ] إنشاء BroodAge enum
- [ ] تشغيل Migration
- [ ] إنشاء Seeds

### المرحلة 2: Backend APIs ✅
- [ ] Frame Repository
- [ ] Frame Service
- [ ] Analysis Service
- [ ] Alert Service
- [ ] Controllers
- [ ] Routes

### المرحلة 3: Frontend Services ✅
- [ ] Frame Service
- [ ] Analysis Service
- [ ] TypeScript Types

### المرحلة 4: Frontend Components ✅
- [ ] FrameCard
- [ ] FrameEditor
- [ ] BroodAgeIndicator
- [ ] HiveFramesView
- [ ] FrameHistoryView
- [ ] HiveAnalysisCard
- [ ] AlertsList

### المرحلة 5: Frontend Pages ✅
- [ ] CreateHivePage
- [ ] HiveDetailPage
- [ ] FrameDetailPage
- [ ] InspectionPage
- [ ] HiveAnalysisPage
- [ ] AlertsPage

### المرحلة 6: نظام التنبيهات ✅
- [ ] Alert Checker Job
- [ ] تكامل Notifications
- [ ] AlertsPage

### المرحلة 7: الاختبار ✅
- [ ] Backend APIs
- [ ] Frontend Components
- [ ] Integration
- [ ] Performance

---

## 📚 المراجع

- **Requirements:** `.kiro/specs/frame-management-system/requirements.md`
- **Design:** `.kiro/specs/frame-management-system/design.md`
- **Tasks:** `.kiro/specs/frame-management-system/tasks.md`

---

## 🚀 البدء

للبدء في التنفيذ:
1. راجع ملف المتطلبات (requirements.md)
2. راجع ملف التصميم (design.md)
3. ابدأ بتنفيذ المهام من tasks.md بالترتيب
4. اتبع الـ Checklist أعلاه

---

**الحالة:** 🟢 **جاهز للتنفيذ**  
**تاريخ:** 8 يناير 2026  
**المدة المتوقعة:** 5-7 أيام  
**الأولوية:** ⭐⭐⭐⭐⭐ عالية جداً

---

**تم إعداد الخطة بواسطة:** Kiro AI  
**للاستفسارات:** راجع ملفات التفاصيل في `.kiro/specs/frame-management-system/`
