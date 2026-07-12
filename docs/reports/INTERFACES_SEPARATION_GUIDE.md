# دليل الفصل الصارم بين الواجهات

**تاريخ:** 8 يناير 2026  
**الهدف:** توثيق الفصل الصارم بين واجهة الإدارة والواجهات التنفيذية

---

## 🎯 المبادئ الأساسية

### 1. الفصل التام
- **واجهة الإدارة:** للرقابة والمراقبة فقط
- **واجهة النحالين:** للعمل التنفيذي فقط
- **لا تداخل:** كل واجهة مستقلة تماماً

### 2. الصلاحيات الصارمة
- **Admin:** وصول كامل للمراقبة، محدود للتنفيذ
- **Beekeeper:** وصول كامل للتنفيذ، ممنوع من الإدارة
- **Team Member:** وصول محدود للتنفيذ

### 3. الأمان
- **Authentication:** مطلوب لجميع الواجهات
- **Authorization:** فحص الصلاحيات على كل طلب
- **Ownership:** التحقق من ملكية الموارد

---

## 📋 مصفوفة الصلاحيات

### واجهة الإدارة (Admin Panel)

| الوظيفة | Admin | Beekeeper | Team Member |
|---------|-------|-----------|-------------|
| **المراقبة** |
| عرض لوحة المراقبة | ✅ | ❌ | ❌ |
| عرض إحصائيات النظام | ✅ | ❌ | ❌ |
| مراجعة السجلات | ✅ | ❌ | ❌ |
| مراقبة الأداء | ✅ | ❌ | ❌ |
| **إدارة المستخدمين** |
| عرض المستخدمين | ✅ | ❌ | ❌ |
| تفعيل/تعطيل مستخدم | ✅ | ❌ | ❌ |
| تعديل صلاحيات | ✅ | ❌ | ❌ |
| حذف مستخدم | ✅ | ❌ | ❌ |
| **إدارة الاشتراكات** |
| عرض الاشتراكات | ✅ | ❌ | ❌ |
| تعديل اشتراك | ✅ | ❌ | ❌ |
| إلغاء اشتراك | ✅ | ❌ | ❌ |
| **إدارة النظام** |
| إعدادات النظام | ✅ | ❌ | ❌ |
| إدارة مكتبة الأمراض | ✅ | ❌ | ❌ |
| إدارة البنية التحتية | ✅ | ❌ | ❌ |
| حوكمة الذكاء الاصطناعي | ✅ | ❌ | ❌ |

---

### واجهة النحالين (Beekeeper Portal)

| الوظيفة | Admin | Beekeeper | Team Member |
|---------|-------|-----------|-------------|
| **إدارة المناحل** |
| عرض المناحل | ✅ | ✅ | ✅ (محدود) |
| إنشاء منحل | ❌ | ✅ | ❌ |
| تعديل منحل | ❌ | ✅ | ❌ |
| حذف منحل | ❌ | ✅ | ❌ |
| **إدارة الخلايا** |
| عرض الخلايا | ✅ | ✅ | ✅ |
| إنشاء خلية | ❌ | ✅ | ✅ |
| تعديل خلية | ❌ | ✅ | ✅ |
| حذف خلية | ❌ | ✅ | ❌ |
| **الفحوصات** |
| عرض الفحوصات | ✅ | ✅ | ✅ |
| إجراء فحص | ❌ | ✅ | ✅ |
| تعديل فحص | ❌ | ✅ | ✅ |
| حذف فحص | ❌ | ✅ | ❌ |
| **التغذية** |
| عرض سجلات التغذية | ✅ | ✅ | ✅ |
| تسجيل تغذية | ❌ | ✅ | ✅ |
| تعديل سجل تغذية | ❌ | ✅ | ✅ |
| حذف سجل تغذية | ❌ | ✅ | ❌ |
| **الحصاد** |
| عرض سجلات الحصاد | ✅ | ✅ | ✅ |
| تسجيل حصاد | ❌ | ✅ | ✅ |
| تعديل سجل حصاد | ❌ | ✅ | ✅ |
| حذف سجل حصاد | ❌ | ✅ | ❌ |
| **الصحة** |
| عرض سجلات الصحة | ✅ | ✅ | ✅ |
| تسجيل مرض | ❌ | ✅ | ✅ |
| تسجيل علاج | ❌ | ✅ | ✅ |
| **الملكات** |
| عرض الملكات | ✅ | ✅ | ✅ |
| إضافة ملكة | ❌ | ✅ | ✅ |
| تعديل ملكة | ❌ | ✅ | ✅ |
| حذف ملكة | ❌ | ✅ | ❌ |
| **العمليات** |
| تقسيم خلية | ❌ | ✅ | ❌ |
| دمج خلايا | ❌ | ✅ | ❌ |
| تسجيل طرد | ❌ | ✅ | ✅ |
| **الفريق** |
| عرض الفريق | ✅ | ✅ | ✅ |
| دعوة عضو | ❌ | ✅ | ❌ |
| إزالة عضو | ❌ | ✅ | ❌ |
| تعديل صلاحيات | ❌ | ✅ | ❌ |

---

## 🔒 آليات الأمان

### 1. Backend Middleware

#### A. Authentication Middleware
```typescript
// backend/src/middleware/auth.middleware.ts

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return ApiResponse.unauthorized(res, 'No token provided');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await prisma.userProfile.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user || !user.isActive) {
            return ApiResponse.unauthorized(res, 'Invalid token');
        }
        
        req.user = user;
        next();
    } catch (error) {
        return ApiResponse.unauthorized(res, 'Invalid token');
    }
};
```

#### B. Role Middleware
```typescript
// backend/src/middleware/role.middleware.ts

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
    }
    
    if (req.user.userType !== 'ADMIN') {
        return ApiResponse.forbidden(res, 'Admin access required');
    }
    
    next();
};

export const requireBeekeeper = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
    }
    
    const allowedRoles = ['ADMIN', 'BEEKEEPER', 'TEAM_MEMBER'];
    if (!allowedRoles.includes(req.user.userType)) {
        return ApiResponse.forbidden(res, 'Beekeeper access required');
    }
    
    next();
};

export const requireOwnership = (resourceUserId: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }
        
        // Admin can access everything
        if (req.user.userType === 'ADMIN') {
            return next();
        }
        
        // Check ownership
        if (req.user.id !== resourceUserId) {
            return ApiResponse.forbidden(res, 'Access denied');
        }
        
        next();
    };
};
```

#### C. تطبيق Middleware على Routes
```typescript
// backend/src/routes/index.ts

// Admin only routes
router.use('/admin/users', authenticate, requireAdmin, adminUserRoutes);
router.use('/admin/system', authenticate, requireAdmin, systemRoutes);
router.use('/admin/logs', authenticate, requireAdmin, logsRoutes);
router.use('/admin/billing', authenticate, requireAdmin, billingRoutes);

// Beekeeper routes (with ownership check)
router.use('/apiaries', authenticate, requireBeekeeper, apiaryRoutes);
router.use('/hives', authenticate, requireBeekeeper, hiveRoutes);
router.use('/inspections', authenticate, requireBeekeeper, inspectionRoutes);
router.use('/feeding', authenticate, requireBeekeeper, feedingRoutes);
router.use('/harvests', authenticate, requireBeekeeper, harvestRoutes);
router.use('/health', authenticate, requireBeekeeper, healthRoutes);
router.use('/queens', authenticate, requireBeekeeper, queenRoutes);
router.use('/operations', authenticate, requireBeekeeper, operationsRoutes);
```

---

### 2. Frontend Guards

#### A. RoleGuard للنحالين
```typescript
// frontend-web/src/guards/RoleGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(user.userType)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return <>{children}</>;
};
```

#### B. AdminGuard للإدارة
```typescript
// admin-panel/src/guards/AdminGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }
    
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }
    
    if (user.userType !== 'ADMIN') {
        return <Navigate to="/admin/unauthorized" replace />;
    }
    
    return <>{children}</>;
};
```

#### C. تطبيق Guards على Routes
```typescript
// frontend-web/src/App.tsx

import { RoleGuard } from './guards/RoleGuard';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Beekeeper Routes */}
            <Route path="/dashboard" element={
                <RoleGuard allowedRoles={['BEEKEEPER', 'TEAM_MEMBER']}>
                    <DashboardPage />
                </RoleGuard>
            } />
            
            <Route path="/apiaries" element={
                <RoleGuard allowedRoles={['BEEKEEPER', 'TEAM_MEMBER']}>
                    <ApiariesPage />
                </RoleGuard>
            } />
            
            {/* ... باقي الـ Routes */}
        </Routes>
    );
}
```

```typescript
// admin-panel/src/App.tsx

import { AdminGuard } from './guards/AdminGuard';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
                <AdminGuard>
                    <Dashboard />
                </AdminGuard>
            } />
            
            <Route path="/admin/users" element={
                <AdminGuard>
                    <Users />
                </AdminGuard>
            } />
            
            {/* ... باقي الـ Routes */}
        </Routes>
    );
}
```

---

## 📁 هيكل المشروع

```
kingdom-of-bees/
│
├── admin-panel/                    # واجهة الإدارة
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # لوحة المراقبة
│   │   │   ├── Users.tsx           # إدارة المستخدمين
│   │   │   ├── Diseases.tsx        # مكتبة الأمراض
│   │   │   ├── Logs.tsx            # السجلات
│   │   │   ├── SystemStatus.tsx    # حالة النظام
│   │   │   ├── Infrastructure.tsx  # البنية التحتية
│   │   │   ├── AIGovernance.tsx    # حوكمة AI
│   │   │   └── Billing.tsx         # الفواتير
│   │   ├── guards/
│   │   │   └── AdminGuard.tsx      # حماية الصفحات
│   │   ├── services/
│   │   │   ├── users.ts
│   │   │   ├── system.ts
│   │   │   └── billing.ts
│   │   └── layouts/
│   │       └── DashboardLayout.tsx
│   └── package.json
│
├── frontend-web/                   # واجهة النحالين
│   ├── src/
│   │   ├── pages/
│   │   │   ├── beekeeper/          # صفحات النحالين
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Apiaries.tsx
│   │   │   │   ├── Hives.tsx
│   │   │   │   ├── Inspections.tsx
│   │   │   │   ├── Feeding.tsx
│   │   │   │   ├── Harvest.tsx
│   │   │   │   ├── Health.tsx
│   │   │   │   ├── Queens.tsx
│   │   │   │   ├── Nuclei.tsx
│   │   │   │   ├── Operations.tsx
│   │   │   │   ├── Weather.tsx
│   │   │   │   ├── Flora.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── Team.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── auth/               # صفحات المصادقة
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   └── VerifyEmail.tsx
│   │   │   └── consumer/           # واجهة المستهلك
│   │   │       └── Tracking.tsx
│   │   ├── guards/
│   │   │   └── RoleGuard.tsx       # حماية الصفحات
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── apiaries.ts
│   │   │   ├── hives.ts
│   │   │   ├── inspections.ts
│   │   │   ├── feeding.ts
│   │   │   ├── harvest.ts
│   │   │   ├── health.ts
│   │   │   ├── queens.ts
│   │   │   ├── operations.ts
│   │   │   └── notifications.ts
│   │   └── layouts/
│   │       └── BeekeeperLayout.tsx
│   └── package.json
│
└── backend/                        # Backend API
    ├── src/
    │   ├── middleware/
    │   │   ├── auth.middleware.ts
    │   │   └── role.middleware.ts  # جديد
    │   ├── routes/
    │   │   ├── admin/              # Admin routes
    │   │   │   ├── users.routes.ts
    │   │   │   ├── system.routes.ts
    │   │   │   └── billing.routes.ts
    │   │   ├── auth.routes.ts
    │   │   ├── apiary.routes.ts
    │   │   ├── hive.routes.ts
    │   │   ├── inspection.routes.ts
    │   │   ├── feeding.routes.ts
    │   │   ├── harvest.routes.ts
    │   │   ├── health.routes.ts
    │   │   ├── queen.routes.ts
    │   │   ├── operations.routes.ts
    │   │   └── index.ts
    │   └── services/
    └── package.json
```

---

## 🎯 الخلاصة

### الفصل الصارم يضمن:
1. ✅ **الأمان:** كل مستخدم يصل فقط لما يحتاجه
2. ✅ **الوضوح:** واجهات منفصلة لأغراض مختلفة
3. ✅ **الصيانة:** سهولة التطوير والصيانة
4. ✅ **الأداء:** تحميل فقط ما هو مطلوب
5. ✅ **التوسع:** سهولة إضافة واجهات جديدة

---

**تاريخ:** 8 يناير 2026  
**الحالة:** 📘 **دليل جاهز للتطبيق**
