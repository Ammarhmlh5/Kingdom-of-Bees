# 🔐 إضافة كلمة المرور لقاعدة البيانات

## 📁 الملف المطلوب تعديله:

```
D:\Kingdom-of-Bees\packages\db\.env
```

---

## ✏️ ما يجب إضافته:

افتح الملف `.env` وأضف هذا السطر في **نهاية الملف**:

```env
DATABASE_URL="postgresql://postgres:**********************@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"
```

---

## 🔑 احصل على كلمة المرور:

### **الخطوة 1:** اذهب إلى:
```
https://supabase.com/dashboard/project/ragjzeptkuogixjofeux/settings/database
```

### **الخطوة 2:** ابحث عن "Database Password"

### **الخطوة 3:** اضغط "Reset Database Password" إذا لزم الأمر

### **الخطوة 4:** انسخ كلمة المرور

---

## 📝 التعديل:

### **قبل التعديل:**
```env
SUPABASE_URL=https://ragjzeptkuogixjofeux.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **بعد التعديل:**
```env
SUPABASE_URL=https://ragjzeptkuogixjofeux.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL="postgresql://postgres:كلمة_المرور_هنا@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"
```

---

## 🎯 مثال:

إذا كانت كلمة المرور: `MySecretPassword123`

```env
DATABASE_URL="postgresql://postgres:MySecretPassword123@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"
```

---

## 🚀 بعد التعديل:

```bash
cd D:\Kingdom-of-Bees\packages\db
npx prisma db push
```

**النتيجة المتوقعة:**
```
✔ Database tables created successfully!
✔ 46 tables pushed to Supabase
```

---

## ✅ البديل الأسهل (بدون كلمة مرور):

اقرأ ملف: `SETUP_WITHOUT_PASSWORD.md`

استخدم SQL Editor لإنشاء الجداول مباشرة (3 دقائق فقط!)

---

## 📊 الملخص:

| الخطوة | التفاصيل |
|--------|----------|
| **الملف** | `D:\Kingdom-of-Bees\packages\db\.env` |
| **السطر المطلوب** | `DATABASE_URL="postgresql://postgres:**********************@db.ragjzeptkuogixjofeux.supabase.co:5432/postgres"` |
| **مكان كلمة المرور** | بدلاً من `**********************` |
| **رابط الحصول على كلمة المرور** | [Supabase Database Settings](https://supabase.com/dashboard/project/ragjzeptkuogixjofeux/settings/database) |

---

**🐝 Kingdom of Bees**

