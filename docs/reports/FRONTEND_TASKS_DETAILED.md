# مهام Frontend التفصيلية - Kingdom of Bees

**تاريخ الإنشاء:** 8 يناير 2026  
**الحالة:** ⏳ **لم يبدأ**

---

## 📊 ملخص المهام

| الفئة | المهام | الوقت المقدر |
|-------|---------|--------------|
| Services | 4 | 4-5 ساعات |
| Auth Pages | 5 | 3-4 ساعات |
| Feature Pages | 6 | 4-5 ساعات |
| Notifications UI | 4 | 3-4 ساعات |
| Other | 1 | 1-2 ساعة |
| **الإجمالي** | **20** | **15-20 ساعة** |

---

## 🔴 المرحلة 1: Services (أولوية عالية جداً)

### المهمة 1.1: إنشاء `auth.ts`

**الملف:** `frontend-web/src/services/auth.ts`

**الوقت المقدر:** 1 ساعة

**Methods المطلوبة:**

```typescript
// 1. Forgot Password
async function forgotPassword(email: string)
// POST /auth/forgot-password

// 2. Reset Password
async function resetPassword(token: string, newPassword: string)
// POST /auth/reset-password

// 3. Refresh Token
async function refreshToken()
// POST /auth/refresh-token

// 4. Logout
async function logout()
// POST /auth/logout

// 5. Verify Email
async function verifyEmail(token: string)
// POST /auth/verify-email

// 6. Send Verification Email
async function sendVerificationEmail()
// POST /auth/send-verification
```

**مثال الكود:**

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

// ... باقي الـ methods
```

---

### المهمة 1.2: إنشاء `notifications.ts`

**الملف:** `frontend-web/src/services/notifications.ts`

**الوقت المقدر:** 1 ساعة

**Methods المطلوبة:**

```typescript
// 1. Get Notifications
async function getNotifications(filters?: { read?: boolean; type?: string; limit?: number })
// GET /notifications?read=false&type=inspection&limit=10

// 2. Get Unread Count
async function getUnreadCount()
// GET /notifications/unread-count

// 3. Get Notification By ID
async function getNotificationById(id: string)
// GET /notifications/:id

// 4. Mark As Read
async function markAsRead(id: string)
// PUT /notifications/:id/read

// 5. Mark All As Read
async function markAllAsRead()
// PUT /notifications/mark-all-read

// 6. Delete Notification
async function deleteNotification(id: string)
// DELETE /notifications/:id

// 7. Delete All Read
async function deleteAllRead()
// DELETE /notifications/read/all

// 8. Get Notification Settings
async function getNotificationSettings()
// GET /notifications/settings/me

// 9. Update Notification Settings
async function updateNotificationSettings(settings: any)
// PUT /notifications/settings/me
```
