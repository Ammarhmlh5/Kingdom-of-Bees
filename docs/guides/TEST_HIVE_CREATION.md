# اختبار إنشاء خلية جديدة
## Test Hive Creation Issue

**التاريخ:** 4 فبراير 2026

---

## المشكلة

المستخدم يحاول إضافة خلية جديدة لكن لا يستطيع حفظها.

---

## التحليل

### 1. الـ Schema (Prisma)

```prisma
model Hive {
  hiveNumber String @map("hive_number")
  name       String?
  
  @@unique([apiaryId, hiveNumber])
  @@unique([apiaryId, name])
}
```

**المشاكل المحتملة:**
- ✅ `hiveNumber` مطلوب ويجب أن يكون فريد داخل المنحل
- ⚠️ `name` اختياري لكن له unique constraint - إذا كان فارغاً قد يسبب مشكلة
- ⚠️ إذا كان هناك خلية أخرى بنفس الرقم أو الاسم، سيفشل الحفظ

### 2. الـ Backend Service

**قبل التعديل:**
```typescript
name: data.name || data.hiveNumber, // Use hiveNumber as fallback name
```

**المشكلة:** إذا كان `name` فارغاً، يستخدم `hiveNumber` كـ fallback، مما قد يسبب تضارب في الـ unique constraint.

**بعد التعديل:**
```typescript
// Only add name if provided
if (data.name && data.name.trim() !== '') {
    hiveData.name = data.name.trim();
}
```

### 3. الـ Frontend Modal

**التحسينات:**
- ✅ إضافة validation لـ hiveNumber
- ✅ إضافة console.log لتتبع البيانات
- ✅ تحسين معالجة الأخطاء
- ✅ إزالة الحقول غير الموجودة في الـ schema (frameCount, beeBreed)

---

## التعديلات المطبقة

### 1. Backend Service (`backend/src/services/hive.service.ts`)

```typescript
async createHive(apiaryId: string, data: any) {
    console.log('[HiveService] Creating hive with data:', data);

    const hiveData: any = {
        apiary: { connect: { id: apiaryId } },
        hiveNumber: data.hiveNumber,
        hiveType: data.hiveType || data.type || 'LANGSTROTH',
        status: data.status || 'ACTIVE',
        queen: data.queenId ? { connect: { id: data.queenId } } : undefined,
        queenAge: data.queenAge ? parseInt(data.queenAge) : undefined,
        queenColor: data.queenColor || undefined
    };

    // Only add name if provided
    if (data.name && data.name.trim() !== '') {
        hiveData.name = data.name.trim();
    }

    return hiveRepository.create(hiveData);
}
```

### 2. Backend Controller (`backend/src/controllers/hive.controller.ts`)

```typescript
async create(req: Request, res: Response) {
    try {
        const apiaryId = (req as any).apiaryId;
        console.log('[HiveController] Create request - apiaryId:', apiaryId, 'body:', req.body);
        
        const hive = await hiveService.createHive(apiaryId, req.body);
        
        console.log('[HiveController] Hive created successfully:', hive.id);
        res.status(201).json(hive);
    } catch (error) {
        console.error('[HiveController] Create Error:', error);
        
        // Check for unique constraint violation
        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return res.status(400).json({ 
                    error: 'رقم الخلية أو الاسم مستخدم بالفعل في هذا المنحل' 
                });
            }
        }
        
        res.status(500).json({ error: (error as Error).message });
    }
}
```

### 3. Frontend Modal (`frontend-web/src/components/modals/CreateHiveModal.tsx`)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!apiaryId) {
        setError('خطأ: لم يتم تحديد المنحل');
        setLoading(false);
        return;
    }

    // Validate hiveNumber
    if (!formData.hiveNumber || formData.hiveNumber.trim() === '') {
        setError('رقم الخلية مطلوب');
        setLoading(false);
        return;
    }

    try {
        const hiveData: any = {
            hiveNumber: formData.hiveNumber.trim(),
            hiveType: formData.hiveType,
            status: formData.status
        };

        // Add optional fields if provided
        if (formData.name && formData.name.trim()) {
            hiveData.name = formData.name.trim();
        }
        if (formData.queenAge && formData.queenAge.trim()) {
            hiveData.queenAge = parseInt(formData.queenAge);
        }
        if (formData.queenColor && formData.queenColor.trim()) {
            hiveData.queenColor = formData.queenColor;
        }

        console.log('[CreateHiveModal] Sending data:', hiveData);

        const result = await createHive(apiaryId, hiveData);
        
        console.log('[CreateHiveModal] Result:', result);
        
        if (result) {
            onSuccess();
            onClose();
            // Reset form
        } else {
            setError('فشل إنشاء الخلية');
        }
    } catch (err: any) {
        console.error('[CreateHiveModal] Error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'حدث خطأ غير متوقع';
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};
```

---

## خطوات الاختبار

### 1. تشغيل الـ Backend

```bash
cd backend
npm run dev
```

### 2. تشغيل الـ Frontend

```bash
cd frontend-web
npm run dev
```

### 3. اختبار إنشاء خلية

1. افتح المتصفح وانتقل إلى صفحة الخلايا
2. اضغط على "إضافة خلية جديدة"
3. أدخل البيانات:
   - رقم الخلية: `TEST-001` (مطلوب)
   - اسم الخلية: `خلية الاختبار` (اختياري)
   - نوع الخلية: `LANGSTROTH`
4. اضغط على "حفظ الخلية"

### 4. فحص الـ Console

**في المتصفح (Frontend):**
```
[CreateHiveModal] Sending data: { hiveNumber: "TEST-001", ... }
[CreateHiveModal] Result: { id: "...", hiveNumber: "TEST-001", ... }
```

**في Terminal (Backend):**
```
[HiveController] Create request - apiaryId: xxx, body: { hiveNumber: "TEST-001", ... }
[HiveService] Creating hive with data: { hiveNumber: "TEST-001", ... }
[HiveController] Hive created successfully: xxx
```

---

## الأخطاء المحتملة وحلولها

### 1. خطأ: "رقم الخلية أو الاسم مستخدم بالفعل"

**السبب:** يوجد خلية أخرى بنفس الرقم أو الاسم في نفس المنحل.

**الحل:**
- استخدم رقم خلية مختلف
- أو احذف الخلية القديمة أولاً

### 2. خطأ: "خطأ: لم يتم تحديد المنحل"

**السبب:** لم يتم تمرير `apiaryId` للـ Modal.

**الحل:**
- تأكد من أن الـ Modal يستقبل `apiaryId` من الـ parent component

### 3. خطأ: "Failed to fetch"

**السبب:** الـ Backend غير متصل أو الـ URL خاطئ.

**الحل:**
- تأكد من أن الـ Backend يعمل على `http://localhost:3000`
- تحقق من الـ `.env` في الـ Frontend

### 4. خطأ: "Unauthorized"

**السبب:** المستخدم غير مسجل دخول.

**الحل:**
- سجل دخول أولاً
- تحقق من الـ token في localStorage

---

## الحالة

✅ **التعديلات مطبقة**

الآن يجب أن يعمل إنشاء الخلية بشكل صحيح.

---

## الخطوات التالية

1. **اختبر** إنشاء خلية جديدة
2. **راقب** الـ console في المتصفح والـ terminal
3. **أخبرني** بالنتيجة أو أي أخطاء تظهر

---

**تم بواسطة:** Kiro AI Assistant  
**التاريخ:** 4 فبراير 2026
