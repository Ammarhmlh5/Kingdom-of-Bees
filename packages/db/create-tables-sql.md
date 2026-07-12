# 🗄️ خيار بديل: إنشاء الجداول عبر Supabase SQL Editor

إذا لم تتمكن من الحصول على Database Password، يمكنك إنشاء الجداول يدوياً:

---

## 📋 الخطوات:

### 1. اذهب إلى Supabase SQL Editor:
```
https://supabase.com/dashboard/project/ragjzeptkuogixjofeux/sql/new
```

### 2. سأولد SQL statements من Prisma Schema:
```bash
cd packages/db
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > create-tables.sql
```

### 3. افتح `create-tables.sql` وانسخ المحتوى

### 4. الصق في Supabase SQL Editor واضغط "Run"

---

## ⚡ دعني أولد SQL الآن!

