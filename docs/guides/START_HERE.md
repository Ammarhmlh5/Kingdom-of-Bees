# 🐝 Kingdom of Bees - ابدأ من هنا!

**مرحباً بك في تطبيق Kingdom of Bees!**

هذا الملف يساعدك على البدء بسرعة.

---

## 📋 ما تم إنجازه

✅ **الخطة الشاملة** - `COMPREHENSIVE_PLAN.md`  
✅ **قاعدة البيانات** - 46 جدول في `packages/db/prisma/schema.prisma`  
✅ **Backend API** - Server + Routes + Controllers  
✅ **نظام المصادقة** - JWT + Supabase  

**للتفاصيل الكاملة:** راجع `DEVELOPMENT_COMPLETE.md`

---

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات

```bash
cd packages/db
```

**أنشئ ملف `.env`:**
```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"
SUPABASE_URL="https://ragjzeptkuogixjofeux.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**احصل على PASSWORD من:**
- Supabase Dashboard → Settings → Database

**للمزيد:** راجع `DATABASE_SETUP.md`

---

### 2️⃣ تثبيت Dependencies

```bash
npm install
```

---

### 3️⃣ توليد Prisma Client

```bash
npx prisma generate
```

---

### 4️⃣ تطبيق Schema على Supabase

```bash
npx prisma db push
```

هذا سيُنشئ جميع الـ 46 جدول في Supabase.

---

### 5️⃣ تشغيل Backend Server

```bash
cd packages/db/packages/platform
npm run dev
```

**Server سيعمل على:** http://localhost:3000

---

## 🧪 اختبار API

### Health Check
```bash
curl http://localhost:3000/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**احفظ `accessToken` من النتيجة!**

### Get Profile
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📚 الملفات المهمة

| الملف | الوصف |
|------|--------|
| `COMPREHENSIVE_PLAN.md` | الخطة الكاملة (11 شهر) |
| `DEVELOPMENT_COMPLETE.md` | ما تم إنجازه |
| `DATABASE_SETUP.md` | تعليمات قاعدة البيانات |
| `packages/db/prisma/schema.prisma` | Database Schema |
| `packages/db/packages/platform/src/server.ts` | Backend Server |

---

## 🎯 API Endpoints المتاحة

### 🔐 Auth
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل دخول
- `POST /api/auth/refresh` - تحديث Token
- `POST /api/auth/logout` - تسجيل خروج

### 👤 Users
- `GET /api/users/me` - الملف الشخصي
- `PUT /api/users/me` - تحديث الملف
- `GET /api/users/me/notifications` - الإشعارات

### 🏠 Apiaries
- `GET /api/apiaries` - جميع المناحل
- `POST /api/apiaries` - إنشاء منحل
- `GET /api/apiaries/:id` - تفاصيل منحل
- `PUT /api/apiaries/:id` - تحديث منحل
- `DELETE /api/apiaries/:id` - حذف منحل
- `GET /api/apiaries/:id/hives` - خلايا المنحل
- `GET /api/apiaries/:id/stats` - إحصائيات

### 🐝 Hives
- `GET /api/hives` - جميع الخلايا
- `POST /api/hives` - إنشاء خلية
- `GET /api/hives/:id` - تفاصيل خلية
- `PUT /api/hives/:id` - تحديث خلية
- `DELETE /api/hives/:id` - حذف خلية
- `GET /api/hives/:id/frames` - الإطارات
- `PUT /api/hives/:id/frames` - تحديث الإطارات

**المزيد قادم:** Inspections, Feeding, Harvest, etc.

---

## 🗄️ قاعدة البيانات (46 جدول)

### ✅ Core (17 tables)
- Users, Apiaries, Hives, Inspections

### ✅ Advanced (29 tables)
- Queens, Feeding, Diseases, Harvest, Operations, Weather, Plants, System

**للتفاصيل:** راجع `packages/db/prisma/README.md`

---

## 🛠️ البنية المعمارية

```
Kingdom-of-Bees/
├── packages/
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma (46 tables)
│       └── packages/
│           └── platform/
│               ├── src/
│               │   ├── server.ts (Main server)
│               │   ├── middleware/ (Auth, Error, Logger)
│               │   ├── routes/ (11 route files)
│               │   └── controllers/ (4 controllers)
│               └── mobile/ (React Native - Coming soon)
└── Documentation/
    ├── COMPREHENSIVE_PLAN.md
    ├── DEVELOPMENT_COMPLETE.md
    ├── DATABASE_SETUP.md
    └── START_HERE.md (هذا الملف)
```

---

## 📈 الخطوات القادمة

### **Phase 1 - Sprint 2 (الأسابيع 5-8):**
1. ⏳ Inspection System (كامل)
2. ⏳ Frame Management (تفصيلي)
3. ⏳ Auto Strength Assessment
4. ⏳ Baladi Hive Support
5. ⏳ Image Upload

### **Phase 1 - Sprint 3 (الأسابيع 9-12):**
1. ⏳ Feeding System
2. ⏳ Disease Management
3. ⏳ Basic Recommendations

### **Mobile App:**
1. ⏳ React Native + Expo Setup
2. ⏳ Authentication Screens
3. ⏳ Offline Support (SQLite)

---

## ❓ المساعدة

### حدثت مشكلة؟

1. **Database connection failed**
   - تحقق من `DATABASE_URL` في `.env`
   - تحقق من database password في Supabase

2. **Prisma errors**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Server won't start**
   ```bash
   npm install
   npm run dev
   ```

4. **Authentication errors**
   - تحقق من `SUPABASE_URL` و `SUPABASE_KEY` في `.env`

---

## 🎉 ملخص الإنجازات

- ✅ **17/17 TODO مكتملة**
- ✅ **46 جدول قاعدة بيانات**
- ✅ **11 API Route**
- ✅ **4 Controllers كاملة**
- ✅ **نظام مصادقة آمن**
- ✅ **~5000 سطر كود**

**الحالة:** ✅ READY TO START DEVELOPMENT

---

## 📞 جاهز للانطلاق؟

1. ✅ أنشئ `.env`
2. ✅ ثبت dependencies
3. ✅ شغّل `npx prisma db push`
4. ✅ شغّل server
5. 🚀 ابدأ التطوير!

---

**Kingdom of Bees - تطبيق شامل لإدارة المناحل 🐝**

Made with ❤️ by Claude Sonnet 4.5

