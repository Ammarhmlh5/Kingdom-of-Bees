# 🐝 Kingdom of Bees

منصة رقمية شاملة لإدارة النحالين — تجمع بين إدارة العمليات اليومية، التجارة الإلكترونية، والذكاء الاصطناعي.

## 📦 المشاريع

| المشروع | التقنية | المنفذ | الحالة |
|---------|---------|--------|--------|
| **backend/** | Express + TypeScript + Prisma | `4000` | ✅ |
| **frontend-web/** | React + Vite + Tailwind | `5173` | ✅ |
| **admin-panel/** | React + Vite | `5174` | ✅ |
| **mobile-app/** | Expo (React Native) | — | ✅ |

## 🚀 التشغيل السريع

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend Web
cd frontend-web
npm install
npm run dev

# Terminal 3: Admin Panel
cd admin-panel
npm install
npm run dev
```

## 📋 متطلبات التشغيل

- Node.js 18+
- PostgreSQL (Supabase)
- npm

## 🔑 بيانات الدخول الافتراضية

- **Admin:** admin@kingdom.com / Admin@123
- **Owner:** owner@kingdom.com / Owner@123

## 🗄️ قاعدة البيانات

- Prisma ORM مع PostgreSQL (Supabase)
- ~70+ جدول، 60+ enum
- عرض المخطط: `cd backend && npx prisma studio`

## 📁 هيكلة المشروع

```
📂 backend/          — API Server (Express + Prisma)
📂 frontend-web/     — واجهة المستخدم (React + Vite)
📂 admin-panel/      — لوحة التحكم (React + Vite)
📂 mobile-app/       — تطبيق الجوال (Expo)
📂 packages/         — مكتبات مشتركة
  ├── shared-types/  — Types مشتركة
  └── db/            — Prisma schema
```

## 📄 الترخيص

MIT
