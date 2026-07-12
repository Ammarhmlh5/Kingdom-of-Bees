# Developer Guide - Kingdom of Bees
## دليل المطور - مملكة النحل

**آخر تحديث:** 4 فبراير 2026

---

## 📋 نظرة عامة

هذا الدليل موجه للمطورين الذين يرغبون في المساهمة في المشروع أو فهم بنيته.

---

## 🏗️ بنية المشروع

```
kingdom-of-bees/
├── backend/                    # Backend (Express.js + Prisma)
│   ├── src/
│   │   ├── services/          # Business logic
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Middleware functions
│   │   ├── repositories/      # Data access layer
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
├── frontend-web/              # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── hives/        # Hives-specific components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client services
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utility functions
│   └── package.json
│
└── shared-database/           # Shared database schema
    └── prisma/
        └── schema.prisma
```

---

## 🛠️ إعداد بيئة التطوير

### المتطلبات

- Node.js 18+
- PostgreSQL 15+
- npm أو yarn

### الخطوات

1. **استنساخ المشروع:**
```bash
git clone https://github.com/yourusername/kingdom-of-bees.git
cd kingdom-of-bees
```

2. **إعداد Backend:**
```bash
cd backend
npm install
cp .env.example .env
# عدّل .env بمعلومات قاعدة البيانات
npx prisma migrate dev
npm run dev
```

3. **إعداد Frontend:**
```bash
cd frontend-web
npm install
cp .env.example .env
# عدّل .env برابط API
npm run dev
```

---

## 📝 معايير الكود

### TypeScript

- استخدم TypeScript في كل مكان
- لا تستخدم `any` إلا للضرورة القصوى
- عرّف interfaces/types لجميع البيانات

**مثال:**
```typescript
// ✅ جيد
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ سيء
const user: any = { ... };
```

### التسمية

- **المتغيرات والدوال:** camelCase
- **الأنواع والواجهات:** PascalCase
- **الثوابت:** UPPER_SNAKE_CASE
- **الملفات:** kebab-case

**مثال:**
```typescript
// المتغيرات
const userName = "Ahmed";
const isActive = true;

// الدوال
function getUserById(id: string) { }

// الأنواع
interface UserProfile { }
type UserRole = "admin" | "user";

// الثوابت
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";
```

### معالجة الأخطاء

**Backend:**
```typescript
try {
  const result = await someOperation();
  return res.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  return res.status(500).json({ 
    success: false, 
    message: 'فشلت العملية' 
  });
}
```

**Frontend:**
```typescript
try {
  const data = await apiCall();
  toast.success('تمت العملية بنجاح');
} catch (error) {
  console.error('API call failed:', error);
  toast.error('فشلت العملية');
}
```

---

## 🔧 إضافة ميزة جديدة

### مثال: إضافة ميزة "تقييم الملكة"

#### 1. Backend

**أ. إضافة إلى Schema:**
```prisma
// prisma/schema.prisma
model QueenRating {
  id          String   @id @default(uuid())
  hiveId      String
  rating      Int      // 1-5
  notes       String?
  ratedBy     String
  ratedAt     DateTime @default(now())
  
  hive        Hive     @relation(fields: [hiveId], references: [id])
  
  @@map("queen_rating")
}
```

**ب. إنشاء Service:**
```typescript
// src/services/queen-rating.service.ts
export class QueenRatingService {
  async rateQueen(data: RateQueenDto) {
    return await prisma.queenRating.create({
      data: {
        hiveId: data.hiveId,
        rating: data.rating,
        notes: data.notes,
        ratedBy: data.userId
      }
    });
  }

  async getQueenRatings(hiveId: string) {
    return await prisma.queenRating.findMany({
      where: { hiveId },
      orderBy: { ratedAt: 'desc' }
    });
  }
}
```

**ج. إنشاء Controller:**
```typescript
// src/controllers/queen-rating.controller.ts
export class QueenRatingController {
  private service = new QueenRatingService();

  async rateQueen(req: Request, res: Response) {
    try {
      const result = await this.service.rateQueen(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'فشل التقييم' });
    }
  }

  async getRatings(req: Request, res: Response) {
    try {
      const ratings = await this.service.getQueenRatings(req.params.hiveId);
      res.json({ success: true, data: ratings });
    } catch (error) {
      res.status(500).json({ success: false, message: 'فشل جلب التقييمات' });
    }
  }
}
```

**د. إضافة Routes:**
```typescript
// src/routes/queen-rating.routes.ts
const router = express.Router();
const controller = new QueenRatingController();

router.post('/hives/:hiveId/queen/rate', controller.rateQueen);
router.get('/hives/:hiveId/queen/ratings', controller.getRatings);

export default router;
```

#### 2. Frontend

**أ. إضافة إلى Service:**
```typescript
// src/services/hives.ts
export async function rateQueen(hiveId: string, data: RateQueenData) {
  const response = await api.post(`/hives/${hiveId}/queen/rate`, data);
  return response.data;
}

export async function getQueenRatings(hiveId: string) {
  const response = await api.get(`/hives/${hiveId}/queen/ratings`);
  return response.data;
}
```

**ب. إنشاء Component:**
```typescript
// src/components/hives/QueenRatingModal.tsx
export function QueenRatingModal({ hiveId, isOpen, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      await rateQueen(hiveId, { rating, notes });
      toast.success('تم التقييم بنجاح');
      onClose();
    } catch (error) {
      toast.error('فشل التقييم');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* UI here */}
    </Dialog>
  );
}
```

---

## 🧪 الاختبار

### Unit Tests (مثال)

```typescript
// src/services/__tests__/queen-rating.service.test.ts
describe('QueenRatingService', () => {
  it('should rate a queen', async () => {
    const service = new QueenRatingService();
    const result = await service.rateQueen({
      hiveId: 'test-hive-id',
      rating: 5,
      notes: 'ممتازة',
      userId: 'test-user-id'
    });
    
    expect(result).toBeDefined();
    expect(result.rating).toBe(5);
  });
});
```

### تشغيل الاختبارات

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend-web
npm test
```

---

## 🔍 التصحيح (Debugging)

### Backend

**استخدام VS Code:**
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "preLaunchTask": "tsc: build",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
}
```

**استخدام Console:**
```typescript
console.log('Debug:', variable);
console.error('Error:', error);
```

### Frontend

**استخدام React DevTools:**
- تثبيت React DevTools extension
- فتح DevTools في المتصفح
- استخدام Components tab

**استخدام Console:**
```typescript
console.log('State:', state);
console.table(data);
```

---

## 📦 إدارة الحزم

### إضافة حزمة جديدة

**Backend:**
```bash
cd backend
npm install package-name
npm install -D @types/package-name  # للأنواع
```

**Frontend:**
```bash
cd frontend-web
npm install package-name
```

### تحديث الحزم

```bash
npm outdated  # عرض الحزم القديمة
npm update    # تحديث الحزم
```

---

## 🔐 الأمان

### Best Practices

1. **لا تحفظ أسرار في الكود**
   - استخدم `.env` للمتغيرات الحساسة
   - أضف `.env` إلى `.gitignore`

2. **التحقق من المدخلات**
   - استخدم validation library (مثل Zod)
   - لا تثق بمدخلات المستخدم

3. **استخدام HTTPS**
   - في الإنتاج دائماً
   - استخدم Let's Encrypt للشهادات المجانية

4. **Rate Limiting**
   - حدد عدد الطلبات لكل IP
   - استخدم `express-rate-limit`

---

## 🤝 المساهمة

### Git Workflow

1. **Fork المشروع**
2. **إنشاء branch جديد:**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit التغييرات:**
```bash
git commit -m "Add amazing feature"
```

4. **Push إلى branch:**
```bash
git push origin feature/amazing-feature
```

5. **فتح Pull Request**

### Commit Messages

استخدم صيغة واضحة:
```
feat: إضافة ميزة تقييم الملكة
fix: إصلاح خطأ في حساب الأولوية
docs: تحديث دليل المطور
style: تحسين تنسيق الكود
refactor: إعادة هيكلة service layer
test: إضافة اختبارات للـ API
```

---

## 📚 موارد إضافية

### التوثيق
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### الأدوات
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - لاختبار APIs
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## 💬 الدعم

إذا كان لديك أسئلة:
1. راجع التوثيق أولاً
2. ابحث في Issues الموجودة
3. افتح Issue جديد

---

**تم إعداده بواسطة:** Kiro AI Assistant  
**التاريخ:** 4 فبراير 2026

