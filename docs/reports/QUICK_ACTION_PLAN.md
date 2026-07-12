# خطة العمل السريعة - Frontend Integration

**تاريخ:** 8 يناير 2026  
**الهدف:** ربط Frontend مع Backend APIs الجاهزة

---

## ✅ الوضع الحالي

### Backend: 🟢 مكتمل 100%
- ✅ 35 API جاهز
- ✅ 4 أنظمة كاملة
- ✅ جميع الـ Routes مسجلة
- ✅ جاهز للاستخدام الفوري

### Frontend: 🟡 يحتاج تكامل
- ⏳ 20 مهمة متبقية
- ⏳ 15-20 ساعة عمل
- ⏳ 3-4 أيام

---

## 🎯 الخطة المقترحة (3 أيام)

### اليوم 1: Services (5-6 ساعات)

#### الصباح (3 ساعات):
1. ✅ إنشاء `auth.ts` (1 ساعة)
   - 6 methods للمصادقة
2. ✅ إنشاء `notifications.ts` (1 ساعة)
   - 9 methods للإشعارات
3. ✅ تحديث `feeding.ts` (1 ساعة)
   - إضافة 5 methods جديدة

#### بعد الظهر (2-3 ساعات):
4. ✅ تحديث `harvest.ts` (2 ساعة)
   - إضافة 6 methods جديدة
   - تصحيح الموجود
5. ✅ اختبار جميع الـ Services (30 دقيقة)

**النتيجة:** جميع الـ Services جاهزة ✅

---

### اليوم 2: Authentication Pages (5-6 ساعات)

#### الصباح (3 ساعات):
1. ✅ تحديث `LoginPage.tsx` (30 دقيقة)
   - ربط مع Backend
   - إضافة رابط "نسيت كلمة المرور"
2. ✅ تحديث `RegisterPage.tsx` (30 دقيقة)
   - ربط مع Backend
   - إضافة رسالة التأكيد
3. ✅ إنشاء `ForgotPasswordPage.tsx` (1 ساعة)
   - Form لإدخال البريد
   - رسالة النجاح
4. ✅ إنشاء `ResetPasswordPage.tsx` (1 ساعة)
   - Form لكلمة المرور الجديدة
   - التحقق من Token

#### بعد الظهر (2-3 ساعات):
5. ✅ إنشاء `VerifyEmailPage.tsx` (1 ساعة)
   - التحقق من Token
   - رسالة النجاح/الفشل
6. ✅ تحديث Routes (30 دقيقة)
7. ✅ اختبار جميع الصفحات (1 ساعة)

**النتيجة:** نظام مصادقة كامل ✅

---

### اليوم 3: Feature Pages (5-6 ساعات)

#### الصباح (3 ساعات):
1. ✅ تحديث `FeedingPage.tsx` (1 ساعة)
   - ربط مع جميع APIs
2. ✅ إنشاء `FeedingRecommendations.tsx` (1 ساعة)
   - عرض التوصيات
3. ✅ إنشاء `FeedingSchedule.tsx` (1 ساعة)
   - عرض الجدول

#### بعد الظهر (2-3 ساعات):
4. ✅ تحديث `HarvestPage.tsx` (1-2 ساعة)
   - ربط مع جميع APIs
5. ✅ اختبار شامل (1 ساعة)

**النتيجة:** صفحات التغذية والحصاد جاهزة ✅

---

## 🚀 البدء السريع

### الخطوة 1: إنشاء `auth.ts`

```bash
# إنشاء الملف
touch frontend-web/src/services/auth.ts
```

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

---

## 📋 Checklist سريع

### اليوم 1: Services ✅
- [ ] إنشاء `auth.ts`
- [ ] إنشاء `notifications.ts`
- [ ] تحديث `feeding.ts`
- [ ] تحديث `harvest.ts`
- [ ] اختبار Services

### اليوم 2: Auth Pages ✅
- [ ] تحديث `LoginPage.tsx`
- [ ] تحديث `RegisterPage.tsx`
- [ ] إنشاء `ForgotPasswordPage.tsx`
- [ ] إنشاء `ResetPasswordPage.tsx`
- [ ] إنشاء `VerifyEmailPage.tsx`
- [ ] اختبار Auth Flow

### اليوم 3: Feature Pages ✅
- [ ] تحديث `FeedingPage.tsx`
- [ ] إنشاء `FeedingRecommendations.tsx`
- [ ] إنشاء `FeedingSchedule.tsx`
- [ ] تحديث `HarvestPage.tsx`
- [ ] اختبار شامل

---

## 🎯 الأولويات

### 🔴 حرجة (يجب إكمالها):
1. Services (اليوم 1)
2. Auth Pages (اليوم 2)

### 🟡 مهمة (يفضل إكمالها):
3. Feature Pages (اليوم 3)

### 🟢 اختيارية (يمكن تأجيلها):
4. Notifications UI
5. Charts & Reports

---

## 📞 ملاحظات

### للمطور:
- Backend جاهز تماماً ✅
- جميع الـ APIs مختبرة ✅
- استخدم `fetchWithAuth` للـ authenticated requests
- استخدم `fetch` للـ public requests (login, register, forgot password)

### للاختبار:
- تأكد من تشغيل Backend على `http://localhost:3000`
- احصل على Token من `/auth/login`
- استخدم Token في جميع الـ requests

---

## 🎉 النتيجة المتوقعة

بعد 3 أيام:
- ✅ جميع الـ Services جاهزة
- ✅ نظام مصادقة كامل
- ✅ صفحات التغذية والحصاد جاهزة
- ✅ MVP جاهز للاستخدام

---

**تاريخ البدء المقترح:** اليوم  
**تاريخ الانتهاء المتوقع:** بعد 3 أيام  
**الحالة:** 🟡 **جاهز للبدء**
