# 🗄️ إعداد قاعدة البيانات - Kingdom of Bees

## ✅ ما تم إنجازه

- ✅ Prisma Schema كامل (40+ tables)
- ✅ جميع الـ Models و Enums و Relationships
- ✅ No syntax errors

---

## 📋 الخطوات المتبقية

### 1️⃣ إعداد ملف .env

أنشئ ملف `.env` في مجلد `packages/db/` بالمحتوى التالي:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"

# Supabase API
SUPABASE_URL="https://ragjzeptkuogixjofeux.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2p6ZXB0a3VvZ2l4am9mZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTkwNzgsImV4cCI6MjA4MTU3NTA3OH0.ly4ZB763PzolSwfeKJQSKXwtJq3rweblQbZlWiJr1rE"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZ2p6ZXB0a3VvZ2l4am9mZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTkwNzgsImV4cCI6MjA4MTU3NTA3OH0.ly4ZB763PzolSwfeKJQSKXwtJq3rweblQbZlWiJr1rE"
```

**⚠️ مهم:** استبدل `[YOUR_PASSWORD]` بكلمة مرور قاعدة البيانات الفعلية من Supabase.

---

### 2️⃣ الحصول على كلمة مرور قاعدة البيانات

1. اذهب إلى https://supabase.com/dashboard
2. افتح مشروعك (ragjzeptkuogixjofeux)
3. اذهب إلى **Settings** → **Database**
4. انسخ كلمة المرور (أو أعد تعيينها إذا نسيتها)
5. استبدل `[YOUR_PASSWORD]` في ملف `.env`

---

### 3️⃣ تثبيت Dependencies

```bash
cd packages/db
npm install
```

---

### 4️⃣ توليد Prisma Client

```bash
npx prisma generate
```

هذا يُنشئ Prisma Client بناءً على Schema.

---

### 5️⃣ تطبيق Schema على Supabase

**الخيار الأول: Push (للتطوير)**
```bash
npx prisma db push
```

**الخيار الثاني: Migration (للإنتاج)**
```bash
npx prisma migrate dev --name init
```

---

### 6️⃣ التحقق من الجداول

```bash
npx prisma studio
```

أو اذهب إلى Supabase Dashboard → Table Editor

---

## 🎯 الناتج المتوقع

بعد تطبيق Schema، ستجد في Supabase:

### ✅ User Management (5 tables)
- user_profile
- apiary_membership
- user_notification_settings
- notification
- user_activity_log

### ✅ Apiary Management (3 tables)
- apiary
- apiary_location_history
- apiary_equipment_log

### ✅ Hive Management (5 tables)
- hive
- hive_frame
- hive_super
- hive_history
- baladi_hive_assessment

### ✅ Inspections (4 tables)
- inspection
- inspection_finding
- inspection_action
- inspection_frame_detail

### ✅ Queens & Nuclei (2 tables)
- queen
- nucleus

### ✅ Feeding (3 tables)
- feeding_record
- feeding_recommendation
- feeding_schedule

### ✅ Diseases (2 tables)
- disease_library
- disease_record

### ✅ Harvest (4 tables)
- harvest_record
- honey_harvest
- pollen_harvest
- royal_jelly_production

### ✅ Operations (4 tables)
- split_operation
- merge_operation
- consolidation_operation
- swarm_event

### ✅ Weather (3 tables)
- weather_data
- weather_forecast
- weather_impact

### ✅ Plants (4 tables)
- plant_library
- local_plant
- plant_observation
- forage_assessment

### ✅ System (7 tables)
- sync_event
- offline_queue
- system_setting
- ai_recommendation_log
- alert
- search_history
- app_feedback

**إجمالي:** 46 جدول + 60+ Enums

---

## 🔧 Troubleshooting

### مشكلة: Prisma Client not found
```bash
npm install @prisma/client
npx prisma generate
```

### مشكلة: Connection timeout
- تحقق من DATABASE_URL
- تحقق من اتصال الإنترنت
- تحقق من firewall settings

### مشكلة: Authentication failed
- تحقق من database password
- جرب reset password في Supabase

---

## 📝 الخطوات التالية

بعد إعداد قاعدة البيانات:

1. ✅ إنشاء Backend API (Express + TypeScript)
2. ✅ إعداد Authentication (JWT + Supabase Auth)
3. ✅ تطوير CRUD APIs
4. ✅ إعداد Mobile App (React Native)

---

## 💡 نصائح

- استخدم `npx prisma studio` للتصفح والتعديل
- راجع `prisma/schema.prisma` لفهم البنية
- استخدم `npx prisma format` لتنسيق Schema
- استخدم `npx prisma validate` للتحقق من Schema

---

**Status:** ✅ Schema Ready - Waiting for .env setup
**Next:** Setup .env → Run `npx prisma db push`

