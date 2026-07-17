# خطة تنفيذ تطبيق الهاتف — Kingdom of Bees

## الحالة الحالية

| الحالة | عدد | الصفحات |
|--------|-----|---------|
| ✅ مكتمل | 4 | LoginPage, RegisterPage, HomePage, SettingsPage |
| 🔧 جزئي | 19 | Weather, Advisor, Flora, Explore, Guide, Shop, AddApiary, HiveList, AddHive, HiveDetail, Inspection, Disease, Feeding, Queen, Merge, Frames, Harvest, Team, Health |
| ❌ فارغ | 1 | BeeCounterPage |

---

## التبويب ١: الصفحة الرئيسية + تسجيل الدخول + الإعدادات ✅

**الحالة:** مكتمل — تم تنفيذه في الجولة السابقة

- [x] LoginPage — تسجيل دخول بالبريد + جوجل
- [x] RegisterPage — تسجيل حساب جديد + جوجل
- [x] HomePage — جلب المناحل من API، إحصائيات، إجراءات سريعة
- [x] SettingsPage — ملف شخصي، تفضيلات، إصدار
- [x] BottomNav — 5 تبويبات

---

## التبويب ٢: إدارة المناحل والخلايا 🔧

**الأولوية:** عالية — هذه هي الوظيفة الأساسية

### HiveListPage.tsx
- **المشكلة:** يجلب البيانات من IndexedDB فقط
- **المطلوب:**
  - [ ] جلب الخلايا من API أولاً (`GET /apiaries/:apiaryId/hives`) مع fallback لـ IndexedDB
  - [ ] عرض حالة كل خلية (نشطة/معطّلة)
  - [ ] زر إضافة خلية يعمل
  - [ ] سحب لحذف/تعديل

### AddHivePage.tsx
- **المشكلة:** يعمل مع IndexedDB فقط
- **المطلوب:**
  - [ ] إرسال البيانات للـ API (`POST /apiaries/:apiaryId/hives`)
  - [ ] حفظ محلي + مزامنة لاحقة
  - [ ] التحقق من صحة الحقول

### HiveDetailPage.tsx
- **المشكلة:** يجلب من IndexedDB فقط
- **المطلوب:**
  - [ ] جلب تفاصيل الخلية من API (`GET /apiaries/:apiaryId/hives/:hiveId`)
  - [ ] عرض معلومات الخلية + آخر فحص
  - [ ] أزرار إجراءات: فحص، مرض، تغذية، ملكة، دمج، أطواق
  - [ ] حذف الخلية

### AddApiaryPage.tsx
- **المشكلة:** يعمل offline-first (مقبول)
- **المطلوب:**
  - [ ] تأكيد عمل الإرسال للـ API
  - [ ] عرض رسالة نجاح واضحة

### MergePage.tsx
- **المشكلة:** يعمل offline-first لكن لا يجلب مرشحي الدمج
- **المطلوب:**
  - [ ] جلب مرشحي الدمج من API (`GET /hives/merge-candidates`)
  - [ ] اختيار الخلية المستهدفة
  - [ ] تأكيد الدمج

---

## التبويب ٣: الفحوصات والعلاج 🔧

**الأولوية:** عالية — وظيفة محددة للنحال

### InspectionPage.tsx
- **المشكلة:** يعمل offline-first، AI analysis قد لا يعمل
- **المطلوب:**
  - [ ] تأكيد أن AI analysis يعمل (أو إزالته مؤقتاً)
  - [ ] إرسال الفحص للـ API
  - [ ] حفظ الأطواق (frames) مع الفحص
  - [ ] تقييم 상태 الخلية تلقائياً

### DiseasePage.tsx
- **المشكلة:** يعمل offline-first
- **المطلوب:**
  - [ ] تأكيد الإرسال للـ API
  - [ ] قائمة الأمراض الشائعة (dropdown)
  - [ ] شدة المرض (خفيف/متوسط/شديد)
  - [ ] العلاج المقترح

### FeedingPage.tsx
- **المشكلة:** يعمل offline-first
- **المطلوب:**
  - [ ] تأكيد الإرسال للـ API
  - [ ] أنواع التغذية (سكر/عسل/بُرسيم)
  - [ ] تاريخ التغذية التالي (تذكير)

### HealthPage.tsx
- **المشكلة:** زر الإضافة (FAB) لا يعمل
- **المطلوب:**
  - [ ] ربط FAB بصفحات الأطباق المختلفة
  - [ ] فلترة حسب نوع المرض
  - [ ] إحصائيات الصحة

### QueenPage.tsx
- **المشكلة:** يعمل offline-first
- **المطلوب:**
  - [ ] تأكيد الإرسال للـ API
  - [ ] حالة الملكة (نشطة/ضائعة/مستبدلة)
  - [ ] تاريخ آخر فحص للملكة

### FramesPage.tsx
- **المشكلة:** يعمل offline-first
- **المطلوب:**
  - [ ] تأكيد الإرسال للـ API
  - [ ] رسم الأطواق بصرياً
  - [ ] نسب العسل/الشرب/الحبوب

---

## التبويب ٤: السوق والطقس والاستكشاف 🔧

**الأولوية:** متوسطة — ميزات إضافية

### ShopPage.tsx
- **المشكلة:** بيانات مُقحمة بالكامل
- **المطلوب:**
  - [ ] جلب المنتجات من API (إذا وُجد)
  - [ ] أو تحويله لصفحة "أدوات النحال" مع محتوى تعليمي
  - [ ] ربط بـ marketplace إذا وُجد backend

### WeatherPage.tsx
- **المشكلة:** بيانات مُقحمة عند فشل API
- **المطلوب:**
  - [ ] جلب بيانات الطقس من API (`GET /weather/current/:apiaryId`)
  - [ ] التنبؤ بـ 5 أيام
  - [ ] تنبيهات الطقس (عاصفة رملية، مطر، حرارة)
  - [ ] إزالة البيانات المُقحمة

### ExplorePage.tsx
- **المشكلة:** صفحة تنقل فقط
- **المطلوب:**
  - [ ] إضافة مقالات تعليمية
  - [ ] ربط بالمنصة التعليمية
  - [ ] نصائح موسمية

### FloraPage.tsx
- **المكلة:** بيانات مُقحمة بالكامل
- **المطلوب:**
  - [ ] جلب النباتات من API (`GET /plants/search`)
  - [ ] نباتات كل منحل (`GET /apiaries/:apiaryId/plants`)
  - [ ] إضافة نبات جديد

### AdvisorPage.tsx
- **المشكلة:** قد لا يوجد backend endpoint
- **المطلوب:**
  - [ ] التحقق من وجود AI advisor endpoint
  - [ ] ربط بالـ API أو إنشاء endpoint جديد
  - [ ] تاريخ المحادثات

### GuidePage.tsx
- **المشكلة:** محتوى ثابت
- **المطلوب:**
  - [ ] مقبول كصفحة تعليمية ثابتة
  - [ ] يمكن تحسينه لاحقاً بمحتوى dinamic

---

## التبويب ٥: عد النحل ❌

**الأولوية:** متوسطة — ميزة خاصة

### BeeCounterPage.tsx
- **المشكلة:** يستخدم React Native components بدلاً من web components
- **المطلوب:**
  - [ ] إعادة كتابة الصفحة بـ web components
  - [ ] ربط بـ BeeCounter component
  - [ ] حفظ النتائج في backend
  - [ ] تاريخ العد

---

## التبويب ٦: الفريق والجمع 🔧

**الأولوية:** منخفضة — ميزات إضافية

### TeamPage.tsx
- **المشكلة:** زر الدعوة (FAB) لا يعمل
- **المطلوب:**
  - [ ] نموذج دعوة عضو جديد
  - [ ] تعديل دور العضو
  - [ ] إزالة عضو

### HarvestPage.tsx
- **المشكلة:** زر الإضافة (FAB) لا يعمل
- **المطلوب:**
  - [ ] نموذج إضافة جمع جديد
  - [ ] نوع العسل والكمية
  - [ ] تاريخ الجمع

---

## Endpoints غير مستخدمة في الـ Backend

| Endpoint | الغرض | الصفحة |
|----------|--------|--------|
| `GET /apiaries/:apiaryId/analytics` | تحليلات | — |
| `GET /apiaries/:apiaryId/tasks` | مهام | — |
| `POST /apiaries/:apiaryId/tasks` | إنشاء مهمة | — |
| `GET /apiaries/:apiaryId/metrics` | مقاييس | — |
| `GET /apiaries/:apiaryId/financials` | ماليات | — |
| `GET /apiaries/:apiaryId/operations` | عمليات يومية | — |
| `GET /hives/inspection-queue` | قائمة الفحوصات | — |
| `GET /hives/split-candidates` | مرشحو التقسيم | — |
| `GET /hives/merge-candidates` | مرشحو الدمج | MergePage |
| `POST /apiaries/:apiaryId/hives/:hiveId/split` | تقسيم خلية | — |
| `POST /apiaries/:apiaryId/hives/:hiveId/super` | إضافة طبقة | — |

---

## ترتيب التنفيذ المقترح

### المرحلة ١: إدارة المناحل والخلايا (التبويب ٢)
1. HiveListPage — API-first fetching
2. HiveDetailPage — API-first + إجراءات
3. AddHivePage — API submission
4. MergePage — مرشحو الدمج

### المرحلة ٢: الفحوصات والعلاج (التبويب ٣)
5. InspectionPage — تأكيد API + تحسين
6. DiseasePage — تأكيد API
7. FeedingPage — تأكيد API
8. HealthPage — ربط FAB
9. QueenPage — تأكيد API
10. FramesPage — تأكيد API

### المرحلة ٣: السوق والطقس (التبويب ٤)
11. WeatherPage — API данных + إزالة mock
12. ShopPage — إعادة بناء أو تحويل
13. FloraPage — ربط بالـ API
14. ExplorePage — تحسين
15. GuidePage — مقبول

### المرحلة ٤: باقي الصفحات (التبويب ٥+٦)
16. BeeCounterPage — إعادة كتابة بـ web
17. TeamPage — نموذج الدعوة
18. HarvestPage — نموذج الإضافة
