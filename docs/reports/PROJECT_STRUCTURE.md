# 📁 Kingdom of Bees - Project Structure

## ✅ Active Projects (Use These)

### 1. Backend (NEW - Production Ready)
```
📂 backend/
├── src/
│   ├── config/              ✅ Environment configuration
│   ├── controllers/         ✅ 6 controllers
│   ├── services/            ✅ 6 services
│   ├── repositories/        ✅ 6 repositories
│   ├── middleware/          ✅ Auth + Error
│   ├── routes/              ✅ API routes
│   ├── utils/               ✅ Logger + Response
│   ├── index.ts             ✅ Main server
│   └── seed.ts              ✅ Database seeding
├── .env                     ✅ Environment variables
├── tsconfig.json            ✅ TypeScript config
├── package.json             ✅ Dependencies
└── API_DOCUMENTATION.md     ✅ API docs

Status: ✅ ACTIVE - Port 4000
```

### 2. Frontend Web
```
📂 frontend-web/
├── src/
│   ├── pages/               ✅ React pages
│   ├── services/            ✅ API services
│   ├── components/          ✅ UI components
│   └── config.ts            ✅ Configuration
├── .env                     ✅ VITE_API_URL=http://localhost:4000/api
└── package.json

Status: ✅ ACTIVE - Port 5173
```

### 3. Admin Panel
```
📂 admin-panel/
├── src/
│   ├── pages/               ✅ Dashboard pages
│   ├── contexts/            ✅ Auth context
│   └── config.ts            ✅ Configuration
├── .env                     ✅ VITE_API_URL=http://localhost:4000/api
└── package.json

Status: ✅ ACTIVE - Port 5174
```

### 4. Shared Types
```
📂 packages/shared-types/
├── src/
│   └── index.ts             ✅ 32+ TypeScript types
├── dist/                    ✅ Compiled output
└── package.json

Status: ✅ ACTIVE - Used by all projects
```

### 5. Database
```
📂 packages/db/
└── prisma/
    └── schema.prisma        ✅ Database schema

Status: ✅ ACTIVE
```

---

## ❌ Old/Deprecated Projects (Can be Deleted)

### backend-control (OLD)
```
📂 backend-control/
└── src/
    └── server.ts            ❌ EMPTY FILE

Status: ❌ DEPRECATED - Replaced by backend/
Action: Can be safely deleted
```

---

## 🗂️ Recommended Actions

### 1. Delete Old Backend
```bash
# Optional: Backup first
Move-Item backend-control backend-control.backup

# Or delete directly
Remove-Item -Recurse -Force backend-control
```

### 2. Use New Backend
```bash
cd backend
npm install
npm run dev
```

---

## 📋 Quick Start Guide

### Start All Services

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Frontend Web
cd frontend-web
npm run dev
# Runs on http://localhost:5173

# Terminal 3: Admin Panel
cd admin-panel
npm run dev
# Runs on http://localhost:5174
```

### Seed Database (First Time)
```bash
cd backend
npx tsx src/seed.ts
```

### Login Credentials
```
Admin: admin@kingdom.com / Admin@123
Owner: owner@kingdom.com / Owner@123
```

---

## 🎯 Summary

| Project | Status | Port | Purpose |
|---------|--------|------|---------|
| **backend/** | ✅ Active | 4000 | Main API Server |
| **frontend-web/** | ✅ Active | 5173 | User Interface |
| **admin-panel/** | ✅ Active | 5174 | Admin Dashboard |
| **packages/shared-types/** | ✅ Active | - | Type Definitions |
| **packages/db/** | ✅ Active | - | Database Schema |
| **backend-control/** | ❌ Old | - | **DELETE THIS** |

---

**Recommendation:** Delete `backend-control/` folder as it's been replaced by the new `backend/` folder with proper architecture.

**Last Updated:** 2026-01-01
