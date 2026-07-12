# خارطة طريق تنفيذ الواجهات - Kingdom of Bees

**تاريخ:** 8 يناير 2026  
**المدة:** 6 أيام عمل  
**الهدف:** فصل صارم وتكامل كامل

---

## 📅 الجدول الزمني التفصيلي

### 🔵 اليوم 1: إعادة الهيكلة والصلاحيات

#### الصباح (3-4 ساعات):

**1. إنشاء Backend Middleware للصلاحيات**

**الملف:** `backend/src/middleware/role.middleware.ts`

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiResponse } from '../utils/response';

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

**2. تحديث Routes بالصلاحيات**

**الملف:** `backend/src/routes/index.ts`

```typescript
import { requireAdmin, requireBeekeeper } from '../middleware/role.middleware';

// Admin only routes
router.use('/admin/users', authenticate, requireAdmin, adminUserRoutes);
router.use('/admin/system', authenticate, requireAdmin, systemRoutes);
router.use('/admin/logs', authenticate, requireAdmin, logsRoutes);

// Beekeeper routes
router.use('/apiaries', authenticate, requireBeekeeper, apiaryRoutes);
router.use('/hives', authenticate, requireBeekeeper, hiveRoutes);
router.use('/feeding', authenticate, requireBeekeeper, feedingRoutes);
router.use('/harvests', authenticate, requireBeekeeper, harvestRoutes);
```

#### بعد الظهر (3-4 ساعات):

**3. إنشاء Frontend Guards**

**الملف:** `frontend-web/src/guards/RoleGuard.tsx`

```typescript
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
        return <div>Loading...</div>;
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

**الملف:** `admin-panel/src/guards/AdminGuard.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
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

**4. تحديث Routes**

**الملف:** `frontend-web/src/App.tsx`

```typescript
import { RoleGuard } from './guards/RoleGuard';

// Protected Beekeeper Routes
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
```

---

### 🔵 اليوم 2: Services للنحالين (الجزء 1)

#### الصباح (3 ساعات):

**1. إنشاء `auth.ts`**

**الملف:** `frontend-web/src/services/auth.ts`

```typescript
import { API_URL, fetchWithAuth } from '@/config';

export async function forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send reset email');
    return response.json();
}

export async function resetPassword(token: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return response.json();
}

export async function refreshToken() {
    const response = await fetchWithAuth(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json();
}

export async function logout() {
    const response = await fetchWithAuth(`${API_URL}/auth/logout`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to logout');
    return response.json();
}

export async function verifyEmail(token: string) {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Failed to verify email');
    return response.json();
}

export async function sendVerificationEmail() {
    const response = await fetchWithAuth(`${API_URL}/auth/send-verification`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to send verification email');
    return response.json();
}
```

**2. إنشاء `notifications.ts`**

**الملف:** `frontend-web/src/services/notifications.ts`

```typescript
import { API_URL, fetchWithAuth } from '@/config';

export async function getNotifications(filters?: { 
    read?: boolean; 
    type?: string; 
    limit?: number 
}) {
    const params = new URLSearchParams();
    if (filters?.read !== undefined) params.append('read', String(filters.read));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const response = await fetchWithAuth(`${API_URL}/notifications?${params}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
}

export async function getUnreadCount() {
    const response = await fetchWithAuth(`${API_URL}/notifications/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
}

export async function getNotificationById(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch notification');
    return response.json();
}

export async function markAsRead(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return response.json();
}

export async function markAllAsRead() {
    const response = await fetchWithAuth(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return response.json();
}

export async function deleteNotification(id: string) {
    const response = await fetchWithAuth(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
}

export async function deleteAllRead() {
    const response = await fetchWithAuth(`${API_URL}/notifications/read/all`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all read');
    return response.json();
}

export async function getNotificationSettings() {
    const response = await fetchWithAuth(`${API_URL}/notifications/settings/me`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
}

export async function updateNotificationSettings(settings: any) {
    const response = await fetchWithAuth(`${API_URL}/notifications/settings/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
}
```

#### بعد الظهر (3 ساعات):

**3. تحديث `feeding.ts`**

**الملف:** `frontend-web/src/services/feeding.ts`

```typescript
// إضافة Methods جديدة

export async function getFeedingById(id: string) {
    const response = await fetchWithAuth(`${API_URL}/feeding/${id}`);
    if (!response.ok) throw new Error('Failed to fetch feeding record');
    return response.json();
}

export async function updateFeedingRecord(id: string, data: any) {
    const response = await fetchWithAuth(`${API_URL}/feeding/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update feeding record');
    return response.json();
}

export async function deleteFeedingRecord(id: string) {
    const response = await fetchWithAuth(`${API_URL}/feeding/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete feeding record');
    return response.json();
}

export async function getFeedingRecommendations(hiveId: string) {
    const response = await fetchWithAuth(`${API_URL}/feeding/recommendations/${hiveId}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
}

export async function getFeedingSchedule(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/feeding/schedule/${apiaryId}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
}
```

---

### 🔵 اليوم 3: Services للنحالين (الجزء 2)

#### طوال اليوم (6 ساعات):

**1. تحديث `harvest.ts`**
**2. تحديث `apiaries.ts`**
**3. تحديث `hives.ts`**
**4. تحديث `inspections.ts`**

---

### 🔵 اليوم 4: صفحات المصادقة

#### طوال اليوم (5-6 ساعات):

**1. تحديث `LoginPage.tsx`**
**2. تحديث `RegisterPage.tsx`**
**3. إنشاء `ForgotPasswordPage.tsx`**
**4. إنشاء `ResetPasswordPage.tsx`**
**5. إنشاء `VerifyEmailPage.tsx`**

---

### 🔵 اليوم 5: صفحات العمل التنفيذي (الجزء 1)

#### طوال اليوم (6 ساعات):

**1. تحديث `DashboardPage.tsx`**
**2. تحديث `ApiariesPage.tsx`**
**3. تحديث `HivesPage.tsx`**
**4. تحديث `InspectionsPage.tsx`**
**5. تحديث `FeedingPage.tsx`**

---

### 🔵 اليوم 6: صفحات العمل التنفيذي (الجزء 2)

#### طوال اليوم (6 ساعات):

**1. تحديث `HarvestPage.tsx`**
**2. تحديث `HealthPage.tsx`**
**3. تحديث `QueensPage.tsx`**
**4. تحديث `OperationsPage.tsx`**
**5. تحديث `SettingsPage.tsx`**
**6. اختبار شامل**

---

## 📊 ملخص الجدول

| اليوم | المهام | الوقت | الحالة |
|-------|---------|-------|--------|
| 1 | إعادة الهيكلة والصلاحيات | 6-8 ساعات | ⏳ |
| 2 | Services (الجزء 1) | 6 ساعات | ⏳ |
| 3 | Services (الجزء 2) | 6 ساعات | ⏳ |
| 4 | صفحات المصادقة | 5-6 ساعات | ⏳ |
| 5 | صفحات العمل (الجزء 1) | 6 ساعات | ⏳ |
| 6 | صفحات العمل (الجزء 2) | 6 ساعات | ⏳ |
| **الإجمالي** | **6 أيام** | **35-38 ساعة** | **⏳** |

---

## ✅ Checklist التنفيذ

### اليوم 1:
- [ ] إنشاء `role.middleware.ts`
- [ ] تحديث `routes/index.ts` بالصلاحيات
- [ ] إنشاء `RoleGuard.tsx`
- [ ] إنشاء `AdminGuard.tsx`
- [ ] تحديث `App.tsx` بالـ Guards

### اليوم 2:
- [ ] إنشاء `auth.ts`
- [ ] إنشاء `notifications.ts`
- [ ] تحديث `feeding.ts`

### اليوم 3:
- [ ] تحديث `harvest.ts`
- [ ] تحديث `apiaries.ts`
- [ ] تحديث `hives.ts`
- [ ] تحديث `inspections.ts`

### اليوم 4:
- [ ] تحديث `LoginPage.tsx`
- [ ] تحديث `RegisterPage.tsx`
- [ ] إنشاء `ForgotPasswordPage.tsx`
- [ ] إنشاء `ResetPasswordPage.tsx`
- [ ] إنشاء `VerifyEmailPage.tsx`

### اليوم 5:
- [ ] تحديث `DashboardPage.tsx`
- [ ] تحديث `ApiariesPage.tsx`
- [ ] تحديث `HivesPage.tsx`
- [ ] تحديث `InspectionsPage.tsx`
- [ ] تحديث `FeedingPage.tsx`

### اليوم 6:
- [ ] تحديث `HarvestPage.tsx`
- [ ] تحديث `HealthPage.tsx`
- [ ] تحديث `QueensPage.tsx`
- [ ] تحديث `OperationsPage.tsx`
- [ ] تحديث `SettingsPage.tsx`
- [ ] اختبار شامل

---

**الحالة:** 🟡 **جاهز للبدء**  
**تاريخ البدء المقترح:** اليوم  
**تاريخ الانتهاء المتوقع:** بعد 6 أيام
