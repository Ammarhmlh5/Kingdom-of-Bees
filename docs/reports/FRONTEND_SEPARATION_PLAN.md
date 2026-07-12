# خطة الفصل الصارم للواجهات - Kingdom of Bees

**تاريخ الإنشاء:** 8 يناير 2026  
**الهدف:** فصل صارم بين واجهة الإدارة والواجهات التنفيذية

---

## 🎯 المبدأ الأساسي

### الفصل الصارم:
1. **واجهة الإدارة (Admin Panel)** - للرقابة والمراقبة فقط
2. **واجهة النحالين (Beekeeper Portal)** - للعمل التنفيذي

---

## 📊 التصنيف الحالي

### ✅ واجهة الإدارة (Admin Panel) - موجودة
**المسار:** `admin-panel/`

**الصفحات الموجودة:**
- ✅ Dashboard - لوحة المراقبة العامة
- ✅ Users - إدارة المستخدمين
- ✅ Diseases - مكتبة الأمراض
- ✅ Logs - سجلات النظام
- ✅ SystemStatusPage - حالة النظام
- ✅ InfrastructurePage - البنية التحتية
- ✅ AIGovernancePage - حوكمة الذكاء الاصطناعي
- ✅ BillingPage - الفواتير والاشتراكات

**الوظائف:**
- مراقبة النظام
- إدارة المستخدمين
- مراجعة السجلات
- إدارة الاشتراكات
- مراقبة الأداء

---

### ⏳ واجهة النحالين (Beekeeper Portal) - تحتاج تنظيم
**المسار:** `frontend-web/`

**الصفحات الموجودة:**
- ✅ DashboardPage - لوحة التحكم
- ✅ ApiariesPage - المناحل
- ✅ HivesPage - الخلايا
- ✅ InspectionsPage - الفحوصات
- ✅ FeedingPage - التغذية
- ✅ HarvestPage - الحصاد
- ✅ HealthPage - الصحة
- ✅ QueensPage - الملكات
- ✅ NucleiPage - النويات
- ✅ OperationsPage - العمليات
- ✅ WeatherPage - الطقس
- ✅ FloraPage - النباتات
- ✅ AnalyticsPage - التحليلات
- ✅ TeamPage - الفريق
- ✅ SettingsPage - الإعدادات

---

## 🚫 الفصل الصارم - القواعد

### 1. واجهة الإدارة (Admin Panel)

#### ✅ مسموح:
- **المراقبة فقط** (Read-Only في معظم الحالات)
- عرض الإحصائيات العامة
- مراجعة السجلات
- إدارة المستخدمين (تفعيل/تعطيل)
- إدارة الاشتراكات
- مراقبة الأداء
- إدارة مكتبة الأمراض (للنظام)
- إعدادات النظام العامة

#### ❌ ممنوع:
- إدارة المناحل والخلايا
- إجراء الفحوصات
- تسجيل التغذية
- تسجيل الحصاد
- إدارة الملكات والنويات
- العمليات التنفيذية
- أي عمل تنفيذي للنحالين

---

### 2. واجهة النحالين (Beekeeper Portal)

#### ✅ مسموح:
- **جميع العمليات التنفيذية**
- إدارة المناحل والخلايا
- إجراء الفحوصات
- تسجيل التغذية
- تسجيل الحصاد
- إدارة الملكات والنويات
- العمليات (تقسيم، دمج، طرود)
- مراقبة الطقس والنباتات
- التحليلات الخاصة
- إدارة الفريق
- الإعدادات الشخصية

#### ❌ ممنوع:
- الوصول لإدارة النظام
- مراجعة سجلات النظام
- إدارة المستخدمين الآخرين
- إدارة الاشتراكات
- إعدادات النظام العامة

---

## 🔐 آلية الفصل

### 1. المصادقة والصلاحيات

```typescript
// User Roles
enum UserType {
  ADMIN           // واجهة الإدارة فقط
  BEEKEEPER       // واجهة النحالين
  TEAM_MEMBER     // واجهة النحالين (صلاحيات محدودة)
  EXPLORER        // واجهة المستهلك (تتبع المنتجات)
}
```

### 2. Routes المنفصلة

```typescript
// Admin Panel Routes
/admin/dashboard
/admin/users
/admin/diseases
/admin/logs
/admin/system-status
/admin/infrastructure
/admin/ai-governance
/admin/billing

// Beekeeper Portal Routes
/dashboard
/apiaries
/hives
/inspections
/feeding
/harvest
/health
/queens
/nuclei
/operations
/weather
/flora
/analytics
/team
/settings
```

### 3. API Permissions

```typescript
// Backend Middleware
- authenticate() - للتحقق من الـ Token
- authorizeAdmin() - للتحقق من صلاحيات الإدارة
- authorizeBeekeeperOrAdmin() - للتحقق من صلاحيات النحال أو الإدارة
```

---

## 📋 خطة التنفيذ

### المرحلة 1: إعادة هيكلة المشروع (يوم واحد)

#### 1.1 تنظيم المجلدات ✅

```
kingdom-of-bees/
├── admin-panel/              # واجهة الإدارة (موجودة)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Diseases.tsx
│   │   │   ├── Logs.tsx
│   │   │   ├── SystemStatus.tsx
│   │   │   ├── Infrastructure.tsx
│   │   │   ├── AIGovernance.tsx
│   │   │   └── Billing.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── layouts/
│   └── package.json
│
├── frontend-web/             # واجهة النحالين
│   ├── src/
│   │   ├── pages/
│   │   │   ├── beekeeper/   # صفحات النحالين
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
│   │   │   ├── auth/        # صفحات المصادقة
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   └── VerifyEmail.tsx
│   │   │   └── consumer/    # واجهة المستهلك
│   │   │       └── Tracking.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── layouts/
│   └── package.json
│
└── mobile-app/               # تطبيق الموبايل (مؤجل)
```

#### 1.2 إنشاء Guards للصلاحيات

**ملف:** `frontend-web/src/guards/RoleGuard.tsx`
**ملف:** `admin-panel/src/guards/AdminGuard.tsx`

---

### المرحلة 2: واجهة الإدارة (يومان)

#### 2.1 تحديث الصفحات الموجودة (4-5 ساعات)

**الصفحات:**
1. ✅ Dashboard - إضافة إحصائيات عامة
2. ✅ Users - ربط مع Backend
3. ✅ Diseases - ربط مع Backend
4. ✅ Logs - ربط مع Backend
5. ✅ SystemStatus - ربط مع Backend
6. ✅ Billing - ربط مع Backend

#### 2.2 إضافة صفحات جديدة (3-4 ساعات)

**الصفحات الجديدة:**
1. ❌ Reports - تقارير شاملة
2. ❌ Analytics - تحليلات متقدمة
3. ❌ Monitoring - مراقبة حية
4. ❌ Alerts - إدارة التنبيهات

---

### المرحلة 3: واجهة النحالين (3 أيام)

#### 3.1 Services (يوم واحد - 5-6 ساعات)

**Services المطلوبة:**
1. ❌ `auth.ts` (6 methods)
2. ❌ `notifications.ts` (9 methods)
3. ❌ تحديث `feeding.ts` (5 methods جديدة)
4. ❌ تحديث `harvest.ts` (6 methods جديدة)
5. ❌ `apiaries.ts` (تحديث)
6. ❌ `hives.ts` (تحديث)
7. ❌ `inspections.ts` (تحديث)
8. ❌ `health.ts` (تحديث)
9. ❌ `queens.ts` (تحديث)
10. ❌ `operations.ts` (تحديث)

#### 3.2 صفحات المصادقة (يوم واحد - 4-5 ساعات)

**الصفحات:**
1. ❌ تحديث `LoginPage.tsx`
2. ❌ تحديث `RegisterPage.tsx`
3. ❌ إنشاء `ForgotPasswordPage.tsx`
4. ❌ إنشاء `ResetPasswordPage.tsx`
5. ❌ إنشاء `VerifyEmailPage.tsx`

#### 3.3 صفحات العمل التنفيذي (يوم واحد - 5-6 ساعات)

**الصفحات:**
1. ❌ تحديث `DashboardPage.tsx`
2. ❌ تحديث `ApiariesPage.tsx`
3. ❌ تحديث `HivesPage.tsx`
4. ❌ تحديث `InspectionsPage.tsx`
5. ❌ تحديث `FeedingPage.tsx`
6. ❌ تحديث `HarvestPage.tsx`
7. ❌ تحديث `HealthPage.tsx`
8. ❌ تحديث `QueensPage.tsx`
9. ❌ تحديث `OperationsPage.tsx`
10. ❌ تحديث `SettingsPage.tsx`

---

## 🔒 الأمان والصلاحيات

### 1. Backend Middleware

```typescript
// backend/src/middleware/role.middleware.ts

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.userType !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

export const requireBeekeeper = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!['ADMIN', 'BEEKEEPER', 'TEAM_MEMBER'].includes(req.user?.userType)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Beekeeper only.'
        });
    }
    next();
};
```

### 2. Frontend Guards

```typescript
// frontend-web/src/guards/RoleGuard.tsx

export const RoleGuard: React.FC<{ allowedRoles: UserType[] }> = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    
    if (!user || !allowedRoles.includes(user.userType)) {
        return <Navigate to="/unauthorized" />;
    }
    
    return <>{children}</>;
};
```

### 3. Routes Protection

```typescript
// frontend-web/src/App.tsx

<Route path="/dashboard" element={
    <RoleGuard allowedRoles={['BEEKEEPER', 'TEAM_MEMBER']}>
        <DashboardPage />
    </RoleGuard>
} />

// admin-panel/src/App.tsx

<Route path="/admin/dashboard" element={
    <AdminGuard>
        <Dashboard />
    </AdminGuard>
} />
```

---

## 📊 الجدول الزمني

| المرحلة | الوقت | الحالة |
|---------|-------|--------|
| إعادة الهيكلة | 1 يوم | ⏳ |
| واجهة الإدارة | 2 يوم | ⏳ |
| واجهة النحالين | 3 أيام | ⏳ |
| **الإجمالي** | **6 أيام** | **⏳** |

---

## ✅ Checklist

### إعادة الهيكلة:
- [ ] تنظيم المجلدات
- [ ] إنشاء RoleGuard
- [ ] إنشاء AdminGuard
- [ ] تحديث Routes
- [ ] إضافة Middleware للصلاحيات

### واجهة الإدارة:
- [ ] تحديث Dashboard
- [ ] ربط Users مع Backend
- [ ] ربط Diseases مع Backend
- [ ] ربط Logs مع Backend
- [ ] ربط SystemStatus مع Backend
- [ ] ربط Billing مع Backend
- [ ] إضافة Reports
- [ ] إضافة Analytics
- [ ] إضافة Monitoring

### واجهة النحالين:
- [ ] إنشاء جميع الـ Services
- [ ] تحديث صفحات المصادقة
- [ ] تحديث صفحات العمل التنفيذي
- [ ] إضافة Notifications UI
- [ ] إضافة Charts & Reports

---

## 🎯 الأولويات

### 🔴 حرجة (يجب إكمالها):
1. إعادة الهيكلة والصلاحيات
2. Services للنحالين
3. صفحات المصادقة

### 🟡 مهمة (يفضل إكمالها):
4. صفحات العمل التنفيذي
5. واجهة الإدارة

### 🟢 اختيارية (يمكن تأجيلها):
6. Notifications UI
7. Charts & Reports المتقدمة

---

**الحالة:** 🟡 **جاهز للبدء**  
**تاريخ الإنشاء:** 8 يناير 2026
