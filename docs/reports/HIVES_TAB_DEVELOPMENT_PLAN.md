# خطة تطوير تبويب الخلايا - Kingdom of Bees
## Hives Tab Development Plan

**تاريخ الإعداد:** 4 فبراير 2026  
**الحالة:** خطة تنفيذية صارمة - لا تعديلات أو بدائل

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المفاهيم الأساسية](#المفاهيم-الأساسية)
3. [التبويبات المطلوبة](#التبويبات-المطلوبة)
4. [قاعدة البيانات](#قاعدة-البيانات)
5. [الواجهات الخلفية](#الواجهات-الخلفية)
6. [الواجهات الأمامية](#الواجهات-الأمامية)
7. [خطة التنفيذ المرحلية](#خطة-التنفيذ-المرحلية)

---

## 🎯 نظرة عامة

### الهدف الرئيسي
تطوير نظام متكامل لإدارة الخلايا يعمل كـ **"توأم رقمي"** (Digital Twin) يعكس الواقع الميداني بدقة وفورية، مع قدرات تحليلية ومحاكاة تنبؤية مدعومة بالذكاء الاصطناعي.

### نطاق الخطة
هذه الخطة تغطي:
1. **تبويب الخلايا** (6 تبويبات فرعية)
2. **تبويب أعمال اليوم** (تبويب رئيسي مستقل)

**ملاحظة مهمة:** تبويب أعمال اليوم هو تبويب رئيسي مستقل على نفس مستوى تبويب الخلايا في القائمة الرئيسية، وليس جزءاً من تبويب الخلايا.

### المبادئ الأساسية
1. **الفورية:** التحديثات تعكس العمل الميداني أولاً بأول
2. **الدقة:** البيانات المدخلة هي وقود محرك التحليل
3. **الذكاء:** التحليل التنبؤي والتوصيات الذكية
4. **السلاسة:** تجربة مستخدم متكاملة بدون انقطاع

---

## 🧠 المفاهيم الأساسية

### 1. التوأمة الرقمية (Digital Twin)
- انعكاس دقيق لحالة الخلايا الفيزيائية
- تحديثات فورية للبيانات
- مراقبة وتحليل مستمر

### 2. المحاكاة التنبؤية (Predictive Simulation)
- تحليل البيانات الحالية + الموسم + الطقس
- توقع حالة الخلية لمدة سنة
- مراعاة سلوك النحال وعمر الملكة

### 3. الذكاء السياقي (Contextual Intelligence)
- تحليل النمط السلوكي للنحال
- التوصيات المخصصة لكل خلية
- التنبيهات الذكية حسب الموسم

---

## 📑 التبويبات المطلوبة

### ملاحظة مهمة:
تبويب الخلايا يحتوي على 6 تبويبات فرعية. أما **تبويب أعمال اليوم** فهو تبويب رئيسي مستقل على نفس مستوى تبويب الخلايا وليس جزءاً منه.

---

## 🐝 تبويبات الخلايا (Hives Tab)

### 1. تبويب الفحص (Inspection Tab) - القلب النابض ⭐
**الوصف:** المركز الموحد لجميع عمليات الفحص والمتابعة

**المميزات:**
- قائمة أولويات ذكية (Smart Priority Queue)
- عرض الخلايا حسب الحاجة للانتباه
- واجهة فحص شاملة لتسجيل كل التفاصيل
- مستشار الذكاء الاصطناعي المدمج
- زر فحص موحد في جميع التبويبات

**البيانات المسجلة:**
- وضع شمع أساس
- تغيير ملكات
- نقل/سحب إطارات
- مخزون الغذاء
- تشخيص الأمراض
- تقييم جودة الملكة

### 2. تبويب تهيئة الخلايا (Hive Configuration Tab)
**الوصف:** الإدخال الأولي للبيانات عند إنشاء منحل جديد

**البيانات المطلوبة:**
- اسم/رقم الخلية
- عمر الملكة
- لون علامة الملكة
- سلالة النحل
- عدد الإطارات
- المواصفات الفنية للصندوق

**طريقة العرض:**
- قائمة على شكل صفوف
- زر "فحص" لكل خلية

### 3. تبويب تقسيم الخلايا (Hive Splitting Tab)
**الوصف:** إدارة ذكية لعمليات التقسيم

**الآلية:**
- تحليل تلقائي للخلايا الجاهزة للتقسيم
- عرض تقييم القوة لكل خلية
- معالج التقسيم (Splitting Wizard)

**البيانات المسجلة:**
- عدد الإطارات المنقولة
- تقييم كل إطار
- مصير الملكة (منقولة/باقية)
- إنشاء سجلات خلايا جديدة تلقائياً

**التنبيهات:**
- مراقبة بناء بيوت ملكية
- توقيت التلقيح
- مراقبة وضع البيض

### 4. تبويب الدمج والتطوير (Merge & Develop Tab)
**الوصف:** إدارة موسمية للنويات والخلايا الضعيفة

**الوظيفة الأولى - التطوير (الربيع/الصيف):**
- ترقية النويات الناجحة لخلايا منتجة
- مراقبة معايير القوة
- اقتراح التحويل التلقائي

**الوظيفة الثانية - الدمج (الخريف/قبل الشتاء):**
- تشخيص الخطر للخلايا الضعيفة
- اقتراح الدمج الذكي
- اختيار الملكة الأفضل
- بروتوكول الأمان (تفادي الاقتتال)

### 5. تبويب العاسلات (Supers & Production Tab)
**الوصف:** إدارة الإنتاج والعاسلات

**الذكاء الموسمي:**
- معرفة مواعيد المواسم (السدر، إلخ)
- التوقيت الدقيق للعمليات

**التوصيات:**
- الخلايا الجاهزة لإضافة الطابق الثاني
- الخلايا الجاهزة للحاجز الملكي
- إدارة الإطارات (أي إطارات ترفع/توضع)

**التنبيهات:**
- بناء بيوت ملكية في العاسلة
- ضغط النحل
- الحاجة لطابق ثالث

### 6. لوحة التحكم (Dashboard)
**الوصف:** عرض المؤشرات والمحاكاة التنبؤية

**المؤشرات:**
- الحالة الحالية للمنحل
- إحصائيات الخلايا
- التنبيهات العاجلة

**محرك المحاكاة:**
- اختيار خلية/خلايا/المنحل بالكامل
- محاكاة لمدة سنة
- مراعاة الطقس والموسم وسلوك النحال

---

## 📋 تبويب أعمال اليوم (Daily Operations Tab) - تبويب رئيسي مستقل

**الوصف:** تبويب رئيسي مستقل على نفس مستوى تبويب الخلايا، مخصص لعرض وإدارة جميع العمليات التي تمت في المنحل

**الموقع:** تبويب رئيسي في القائمة الرئيسية (ليس ضمن تبويب الخلايا)

**الغرض:** 
- عرض سجل توثيقي ورقابي لجميع العمليات
- تتبع إنتاجية العمال
- إدارة الأخطاء والتراجع عن العمليات

**الفلترة:**
- حسب العامل (Who): معرفة إنتاجية كل نحال
- حسب نوع العملية (What)
- حسب التاريخ (من - إلى)
- حسب المنحل

**أنواع العمليات المعروضة:**
1. **نقل إطار:** يظهر الخلية المانحة -> الخلية المستلمة
2. **إضافة شمع أساس:** الخلية وعدد الإطارات
3. **إحلال ملكة:** الخلية والملكة القديمة/الجديدة
4. **تقسيم خلية:** الخلية الأم والخلية الجديدة
5. **دمج خلايا:** الخلايا المدمجة
6. **إضافة عاسلة:** الخلية ورقم الطابق
7. **فحص:** الخلية ونتائج الفحص
8. **تغذية:** الخلية ونوع الغذاء
9. **علاج:** الخلية والمرض والدواء

**طريقة العرض:**
- قائمة زمنية (Timeline) مع الأحدث أولاً
- بطاقات (Cards) لكل عملية
- أيقونات مميزة لكل نوع عملية
- ألوان مختلفة حسب نوع العملية

**إدارة الأخطاء (Rollback):**
- هذا هو المكان الوحيد المخصص لحذف/تراجع عن عملية تم تسجيلها بالخطأ
- تأكيد قبل الحذف
- تسجيل عملية الحذف في السجل

**الإحصائيات:**
- عدد العمليات اليوم/الأسبوع/الشهر
- أكثر العمليات تكراراً
- أكثر العمال نشاطاً
- الوقت المستغرق في العمليات

---

## 🗄️ قاعدة البيانات

### التعديلات المطلوبة على Schema

#### 1. جدول Hive (تحديثات)
```prisma
model Hive {
  // الحقول الموجودة...
  
  // إضافات جديدة
  priority              Int?                     @default(0) @map("priority") // للأولوية في الفحص
  nextInspectionReason  String?                  @map("next_inspection_reason") // سبب الفحص القادم
  aiRecommendations     Json?                    @map("ai_recommendations") // توصيات الذكاء الاصطناعي
  simulationData        Json?                    @map("simulation_data") // بيانات المحاكاة
  
  // العلاقات الجديدة
  splitAsSource         SplitOperation[]         @relation("SourceHive")
  splitAsResult         SplitOperation[]         @relation("ResultHive")
  mergeAsWeak           MergeOperation[]         @relation("WeakHive")
  mergeAsTarget         MergeOperation[]         @relation("TargetHive")
  developmentHistory    DevelopmentOperation[]
  superOperations       SuperOperation[]
  dailyOperations       DailyOperation[]
}
```

#### 2. جدول جديد: SplitOperation
```prisma
model SplitOperation {
  id                String    @id @default(uuid()) @db.Uuid
  apiaryId          String    @map("apiary_id") @db.Uuid
  sourceHiveId      String    @map("source_hive_id") @db.Uuid
  resultHiveId      String    @map("result_hive_id") @db.Uuid
  splitDate         DateTime  @map("split_date") @db.Timestamptz(6)
  framesTransferred Int       @map("frames_transferred")
  queenLocation     String    @map("queen_location") // "SOURCE" | "RESULT" | "BOTH_NEW"
  frameDetails      Json      @map("frame_details") // تقييم كل إطار
  notes             String?
  performedBy       String    @map("performed_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  apiary            Apiary    @relation(fields: [apiaryId], references: [id], onDelete: Cascade)
  sourceHive        Hive      @relation("SourceHive", fields: [sourceHiveId], references: [id])
  resultHive        Hive      @relation("ResultHive", fields: [resultHiveId], references: [id])
  
  @@index([apiaryId, splitDate(sort: Desc)])
  @@map("split_operation")
}
```

#### 3. جدول جديد: MergeOperation (تحديث)
```prisma
model MergeOperation {
  id                String    @id @default(uuid()) @db.Uuid
  apiaryId          String    @map("apiary_id") @db.Uuid
  weakHiveId        String    @map("weak_hive_id") @db.Uuid
  targetHiveId      String    @map("target_hive_id") @db.Uuid
  mergeDate         DateTime  @map("merge_date") @db.Timestamptz(6)
  mergeMethod       String    @map("merge_method") // "NEWSPAPER" | "DIRECT" | "GRADUAL"
  queenKept         String    @map("queen_kept") // "WEAK" | "TARGET"
  queenRemoved      String?   @map("queen_removed") // ID الملكة المزالة
  safetyProtocol    Json?     @map("safety_protocol") // بروتوكول الأمان المتبع
  success           Boolean   @default(true)
  notes             String?
  performedBy       String    @map("performed_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  apiary            Apiary    @relation(fields: [apiaryId], references: [id], onDelete: Cascade)
  weakHive          Hive      @relation("WeakHive", fields: [weakHiveId], references: [id])
  targetHive        Hive      @relation("TargetHive", fields: [targetHiveId], references: [id])
  
  @@index([apiaryId, mergeDate(sort: Desc)])
  @@map("merge_operation")
}
```

#### 4. جدول جديد: DevelopmentOperation
```prisma
model DevelopmentOperation {
  id                String    @id @default(uuid()) @db.Uuid
  apiaryId          String    @map("apiary_id") @db.Uuid
  hiveId            String    @map("hive_id") @db.Uuid
  operationType     String    @map("operation_type") // "NUC_TO_HIVE" | "STRENGTHEN"
  developmentDate   DateTime  @map("development_date") @db.Timestamptz(6)
  beforeStatus      Json      @map("before_status") // الحالة قبل التطوير
  afterStatus       Json      @map("after_status") // الحالة بعد التطوير
  notes             String?
  performedBy       String    @map("performed_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  apiary            Apiary    @relation(fields: [apiaryId], references: [id], onDelete: Cascade)
  hive              Hive      @relation(fields: [hiveId], references: [id], onDelete: Cascade)
  
  @@index([apiaryId, developmentDate(sort: Desc)])
  @@map("development_operation")
}
```

#### 5. جدول جديد: SuperOperation
```prisma
model SuperOperation {
  id                String    @id @default(uuid()) @db.Uuid
  apiaryId          String    @map("apiary_id") @db.Uuid
  hiveId            String    @map("hive_id") @db.Uuid
  operationType     String    @map("operation_type") // "ADD_SUPER" | "ADD_EXCLUDER" | "REMOVE_SUPER"
  operationDate     DateTime  @map("operation_date") @db.Timestamptz(6)
  superNumber       Int       @map("super_number") // رقم الطابق
  framesInSuper     Int       @map("frames_in_super")
  hasExcluder       Boolean   @default(false) @map("has_excluder")
  framesMovedUp     Json?     @map("frames_moved_up") // الإطارات المرفوعة
  expectedYield     Decimal?  @map("expected_yield") @db.Decimal(10, 2)
  notes             String?
  performedBy       String    @map("performed_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  apiary            Apiary    @relation(fields: [apiaryId], references: [id], onDelete: Cascade)
  hive              Hive      @relation(fields: [hiveId], references: [id], onDelete: Cascade)
  
  @@index([apiaryId, operationDate(sort: Desc)])
  @@map("super_operation")
}
```

#### 6. جدول جديد: DailyOperation
```prisma
model DailyOperation {
  id                String    @id @default(uuid()) @db.Uuid
  apiaryId          String    @map("apiary_id") @db.Uuid
  hiveId            String?   @map("hive_id") @db.Uuid // nullable للعمليات على مستوى المنحل
  operationType     String    @map("operation_type") // "FRAME_TRANSFER" | "FOUNDATION_ADD" | "QUEEN_REPLACE" | etc
  operationDate     DateTime  @map("operation_date") @db.Timestamptz(6)
  operationData     Json      @map("operation_data") // تفاصيل العملية
  sourceHiveId      String?   @map("source_hive_id") @db.Uuid // للنقل
  targetHiveId      String?   @map("target_hive_id") @db.Uuid // للنقل
  performedBy       String    @map("performed_by") @db.Uuid
  notes             String?
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  apiary            Apiary    @relation(fields: [apiaryId], references: [id], onDelete: Cascade)
  hive              Hive?     @relation(fields: [hiveId], references: [id], onDelete: Cascade)
  
  @@index([apiaryId, operationDate(sort: Desc)])
  @@index([performedBy, operationDate(sort: Desc)])
  @@index([operationType])
  @@map("daily_operation")
}
```

#### 7. جدول جديد: HiveSimulation
```prisma
model HiveSimulation {
  id                String    @id @default(uuid()) @db.Uuid
  hiveId            String    @map("hive_id") @db.Uuid
  simulationDate    DateTime  @map("simulation_date") @db.Timestamptz(6)
  currentState      Json      @map("current_state") // الحالة الحالية
  predictedStates   Json      @map("predicted_states") // التوقعات الشهرية لسنة
  factors           Json      @map("factors") // العوامل المؤثرة (طقس، سلوك نحال، إلخ)
  confidence        Decimal   @map("confidence") @db.Decimal(5, 2) // نسبة الثقة
  createdBy         String    @map("created_by") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  hive              Hive      @relation(fields: [hiveId], references: [id], onDelete: Cascade)
  
  @@index([hiveId, simulationDate(sort: Desc)])
  @@map("hive_simulation")
}
```

---

## 🔧 الواجهات الخلفية (Backend APIs)

### 1. Inspection APIs

#### GET `/api/apiaries/:apiaryId/hives/inspection-queue`
**الوصف:** جلب قائمة الخلايا حسب الأولوية للفحص

**Response:**
```typescript
{
  hives: [
    {
      id: string,
      hiveNumber: string,
      priority: number,
      reason: string, // "queen_mating_check" | "post_split_check" | etc
      daysOverdue: number,
      lastInspection: Date,
      aiRecommendation: string
    }
  ]
}
```

#### POST `/api/apiaries/:apiaryId/hives/:hiveId/inspect`
**الوصف:** تسجيل فحص جديد

**Request Body:**
```typescript
{
  inspectionDate: Date,
  queenSeen: boolean,
  queenQuality: string,
  broodFrames: number,
  honeyFrames: number,
  pollenFrames: number,
  foundationAdded: number,
  framesTransferred: {
    from: string, // hiveId
    to: string,   // hiveId
    count: number
  }[],
  diseases: string[],
  foodStock: {
    honey: number,
    pollen: number
  },
  notes: string,
  aiConsultation?: {
    question: string,
    answer: string
  }
}
```

### 2. Configuration APIs

#### POST `/api/apiaries/:apiaryId/hives/configure`
**الوصف:** تهيئة خلية جديدة

**Request Body:**
```typescript
{
  hiveNumber: string,
  name: string,
  queenAge: number,
  queenMarkColor: string,
  beeBreed: string,
  frameCount: number,
  boxSpecifications: {
    type: string,
    material: string,
    size: string
  }
}
```

### 3. Split APIs

#### GET `/api/apiaries/:apiaryId/hives/split-candidates`
**الوصف:** جلب الخلايا المرشحة للتقسيم

**Response:**
```typescript
{
  candidates: [
    {
      hiveId: string,
      hiveNumber: string,
      strengthScore: number,
      readinessLevel: "READY" | "SOON" | "NOT_READY",
      recommendation: string,
      estimatedFrames: number
    }
  ]
}
```

#### POST `/api/apiaries/:apiaryId/hives/:hiveId/split`
**الوصف:** تنفيذ عملية التقسيم

**Request Body:**
```typescript
{
  newHiveNumber: string,
  framesTransferred: [
    {
      frameId: string,
      rating: number,
      type: "BROOD" | "HONEY" | "POLLEN"
    }
  ],
  queenLocation: "SOURCE" | "RESULT" | "BOTH_NEW",
  notes: string
}
```

### 4. Merge & Develop APIs

#### GET `/api/apiaries/:apiaryId/hives/merge-candidates`
**الوصف:** جلب الخلايا المرشحة للدمج (موسمي)

**Query Params:**
- `season`: "SPRING" | "AUTUMN"

**Response:**
```typescript
{
  weakHives: [
    {
      hiveId: string,
      hiveNumber: string,
      riskLevel: number,
      survivalChance: number,
      recommendation: string
    }
  ],
  suggestedMerges: [
    {
      weakHive: string,
      targetHive: string,
      queenToKeep: string,
      safetyProtocol: string[]
    }
  ]
}
```

#### POST `/api/apiaries/:apiaryId/hives/:hiveId/merge`
**الوصف:** تنفيذ عملية الدمج

**Request Body:**
```typescript
{
  targetHiveId: string,
  mergeMethod: "NEWSPAPER" | "DIRECT" | "GRADUAL",
  queenKept: "WEAK" | "TARGET",
  safetyProtocol: string[],
  notes: string
}
```

#### POST `/api/apiaries/:apiaryId/hives/:hiveId/develop`
**الوصف:** تطوير نواة لخلية

**Request Body:**
```typescript
{
  operationType: "NUC_TO_HIVE",
  beforeStatus: object,
  afterStatus: object,
  notes: string
}
```

### 5. Super APIs

#### GET `/api/apiaries/:apiaryId/hives/super-candidates`
**الوصف:** جلب الخلايا الجاهزة للعاسلات

**Response:**
```typescript
{
  candidates: [
    {
      hiveId: string,
      hiveNumber: string,
      readiness: "ADD_SUPER" | "ADD_EXCLUDER" | "MONITOR",
      currentStories: number,
      recommendation: string,
      frameSuggestions: {
        framesToMoveUp: string[],
        framesToAdd: string[]
      }
    }
  ],
  seasonalContext: {
    currentSeason: string,
    upcomingFlows: string[],
    daysUntilPeak: number
  }
}
```

#### POST `/api/apiaries/:apiaryId/hives/:hiveId/super`
**الوصف:** إضافة عاسلة

**Request Body:**
```typescript
{
  operationType: "ADD_SUPER" | "ADD_EXCLUDER",
  framesInSuper: number,
  hasExcluder: boolean,
  framesMovedUp: string[],
  expectedYield: number,
  notes: string
}
```

### 6. Daily Operations APIs (تبويب رئيسي مستقل)

**ملاحظة:** هذه APIs لتبويب رئيسي مستقل وليس جزءاً من تبويب الخلايا

#### GET `/api/operations/daily`
**الوصف:** جلب سجل العمليات اليومية

**Query Params:**
- `apiaryId`: string (optional - للفلترة حسب منحل معين)
- `startDate`: Date
- `endDate`: Date
- `operationType`: string (optional)
- `performedBy`: string (optional)

**Response:**
```typescript
{
  operations: [
    {
      id: string,
      operationType: string,
      operationDate: Date,
      hiveId: string,
      hiveNumber: string,
      operationData: object,
      performedBy: {
        id: string,
        name: string
      },
      notes: string
    }
  ]
}
```

#### DELETE `/api/operations/:operationId`
**الوصف:** حذف عملية مسجلة بالخطأ (Rollback)

**Response:**
```typescript
{
  success: boolean,
  message: string,
  deletedOperation: object
}
```

### 7. Simulation APIs

#### POST `/api/apiaries/:apiaryId/simulate`
**الوصف:** تشغيل محاكاة تنبؤية

**Request Body:**
```typescript
{
  scope: "HIVE" | "HIVES" | "APIARY",
  hiveIds?: string[], // إذا كان scope = "HIVE" أو "HIVES"
  duration: number, // بالأشهر (افتراضي 12)
  factors: {
    includeWeather: boolean,
    includeBeekeeper: boolean,
    includeSeasons: boolean
  }
}
```

**Response:**
```typescript
{
  simulationId: string,
  predictions: [
    {
      month: number,
      hiveId: string,
      predictedState: {
        strength: number,
        broodFrames: number,
        honeyProduction: number,
        diseases: string[],
        queenStatus: string
      },
      confidence: number,
      recommendations: string[]
    }
  ]
}
```

---

## 🎨 الواجهات الأمامية (Frontend Components)

### البنية العامة

**ملاحظة:** تبويب أعمال اليوم هو صفحة رئيسية مستقلة وليس جزءاً من HivesPage

```
frontend-web/src/
├── pages/
│   ├── context/
│   │   └── HivesPage.tsx (صفحة تبويب الخلايا)
│   └── DailyOperationsPage.tsx (صفحة مستقلة - تبويب رئيسي) ⭐
├── components/
│   ├── hives/
│   │   ├── InspectionTab.tsx ⭐
│   │   ├── ConfigurationTab.tsx
│   │   ├── SplitTab.tsx
│   │   ├── MergeTab.tsx
│   │   ├── SuperTab.tsx
│   │   ├── DashboardTab.tsx
│   │   ├── InspectionModal.tsx (زر الفحص الموحد)
│   │   ├── HiveCard.tsx
│   │   ├── PriorityQueue.tsx
│   │   ├── SimulationPanel.tsx
│   │   └── AIConsultant.tsx
│   └── operations/
│       ├── OperationsFilter.tsx
│       ├── OperationsList.tsx
│       ├── OperationCard.tsx
│       ├── OperationTimeline.tsx
│       ├── OperationStats.tsx
│       └── DeleteConfirmation.tsx
└── services/
    ├── hives.ts (تحديث)
    └── operations.ts (جديد)
```


### 1. InspectionTab.tsx (القلب النابض)

**المكونات:**
- **PriorityQueue:** قائمة الخلايا حسب الأولوية
- **InspectionForm:** نموذج الفحص الشامل
- **AIConsultant:** مستشار الذكاء الاصطناعي
- **QuickActions:** إجراءات سريعة (نقل إطار، إضافة شمع)

**الحالات (States):**
```typescript
const [hives, setHives] = useState<Hive[]>([]);
const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
const [inspectionData, setInspectionData] = useState<InspectionData>({});
const [aiQuery, setAiQuery] = useState<string>("");
const [aiResponse, setAiResponse] = useState<string>("");
```

**الوظائف الرئيسية:**
- `fetchInspectionQueue()`: جلب قائمة الأولويات
- `handleInspect(hiveId)`: فتح نموذج الفحص
- `submitInspection()`: حفظ بيانات الفحص
- `consultAI(question)`: استشارة الذكاء الاصطناعي

### 2. InspectionModal.tsx (زر الفحص الموحد)

**Props:**
```typescript
interface InspectionModalProps {
  hiveId: string;
  apiaryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contextData?: any; // بيانات سياقية من التبويب الحالي
}
```

**المميزات:**
- نافذة منبثقة (Modal/Slide-over)
- لا تقاطع سياق العمل
- حفظ تلقائي للبيانات
- إغلاق سلس والعودة للتبويب

### 3. ConfigurationTab.tsx

**المكونات:**
- **HiveConfigForm:** نموذج التهيئة
- **HiveList:** قائمة الخلايا المهيأة
- **BulkConfig:** تهيئة جماعية

**الحقول:**
- رقم/اسم الخلية
- معلومات الملكة (عمر، لون، سلالة)
- عدد الإطارات
- مواصفات الصندوق

### 4. SplitTab.tsx

**المكونات:**
- **CandidatesList:** قائمة المرشحين للتقسيم
- **SplitWizard:** معالج التقسيم
- **FrameSelector:** اختيار الإطارات المنقولة
- **QueenLocationPicker:** تحديد موقع الملكة

**التدفق:**
1. عرض الخلايا المرشحة مع التقييم
2. اختيار الخلية الأم
3. تحديد الإطارات المنقولة وتقييمها
4. تحديد موقع الملكة
5. تأكيد وحفظ

### 5. MergeTab.tsx

**المكونات:**
- **SeasonalSwitch:** تبديل بين الربيع/الخريف
- **WeakHivesList:** قائمة الخلايا الضعيفة
- **DevelopmentPanel:** لوحة التطوير (الربيع)
- **MergePanel:** لوحة الدمج (الخريف)
- **SafetyProtocol:** بروتوكول الأمان

**التدفق (الدمج):**
1. عرض الخلايا الضعيفة
2. اختيار الخلية الضعيفة
3. اختيار الخلية الهدف
4. تحديد الملكة المحتفظ بها
5. اختيار طريقة الدمج
6. تأكيد وحفظ

### 6. SuperTab.tsx

**المكونات:**
- **SeasonalContext:** السياق الموسمي
- **ReadyHivesList:** الخلايا الجاهزة
- **SuperWizard:** معالج إضافة العاسلة
- **FrameManager:** إدارة الإطارات

**التدفق:**
1. عرض السياق الموسمي (مواسم قادمة)
2. عرض الخلايا الجاهزة
3. اختيار الخلية
4. تحديد نوع العملية (عاسلة/حاجز)
5. اختيار الإطارات المرفوعة
6. تأكيد وحفظ

### 7. DailyOperationsPage.tsx (صفحة مستقلة - تبويب رئيسي)

**الموقع:** صفحة رئيسية مستقلة في `/operations` أو `/daily-operations`

**المكونات:**
- **OperationsFilter:** فلترة العمليات
- **OperationTimeline:** عرض زمني للعمليات
- **OperationsList:** قائمة العمليات
- **OperationCard:** بطاقة عملية واحدة
- **OperationStats:** إحصائيات العمليات
- **DeleteConfirmation:** تأكيد الحذف

**الفلاتر:**
- التاريخ (من - إلى)
- المنحل
- نوع العملية
- العامل

**العمليات المعروضة:**
- نقل إطار (مع الخلايا المانحة/المستلمة)
- إضافة شمع أساس
- إحلال ملكة
- تقسيم خلية
- دمج خلايا
- إضافة عاسلة
- فحص
- تغذية
- علاج
- وغيرها...

**المميزات:**
- عرض زمني (Timeline)
- أيقونات مميزة لكل نوع
- ألوان مختلفة حسب النوع
- إحصائيات تفاعلية
- تصدير التقارير

### 8. HiveCard.tsx (مكون مشترك)

**المكونات:**
- **ApiaryStats:** إحصائيات المنحل
- **AlertsPanel:** التنبيهات العاجلة
- **SimulationPanel:** لوحة المحاكاة
- **ChartsSection:** الرسوم البيانية

**المحاكاة:**
- اختيار النطاق (خلية/خلايا/منحل)
- تشغيل المحاكاة
- عرض النتائج (12 شهر)
- توصيات مخصصة

### 9. DashboardTab.tsx

**Props:**
```typescript
interface HiveCardProps {
  hive: Hive;
  showInspectButton?: boolean;
  showPriority?: boolean;
  actionButton?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: string;
  };
  contextData?: any;
}
```

**المميزات:**
- عرض معلومات الخلية
- زر الفحص الموحد
- مؤشر الأولوية
- أزرار إجراءات مخصصة

---

## 📅 خطة التنفيذ المرحلية

### المرحلة 1: البنية التحتية (الأسبوع 1-2)

#### قاعدة البيانات
- [ ] إضافة الحقول الجديدة لجدول Hive
- [ ] إنشاء جدول SplitOperation
- [ ] إنشاء جدول MergeOperation (تحديث)
- [ ] إنشاء جدول DevelopmentOperation
- [ ] إنشاء جدول SuperOperation
- [ ] إنشاء جدول DailyOperation
- [ ] إنشاء جدول HiveSimulation
- [ ] تشغيل Migration
- [ ] اختبار Schema

#### Backend - الخدمات الأساسية
- [ ] إنشاء `InspectionService`
- [ ] إنشاء `SplitService`
- [ ] إنشاء `MergeService`
- [ ] إنشاء `SuperService`
- [ ] إنشاء `SimulationService`
- [ ] إنشاء `AnalysisService` (للتحليل والتوصيات)

### المرحلة 2: تبويب الفحص (الأسبوع 3-4)

#### Backend
- [ ] API: GET `/inspection-queue`
- [ ] API: POST `/hives/:id/inspect`
- [ ] منطق حساب الأولويات
- [ ] منطق التوصيات الذكية

#### Frontend
- [ ] إنشاء `InspectionTab.tsx`
- [ ] إنشاء `PriorityQueue.tsx`
- [ ] إنشاء `InspectionModal.tsx` (زر الفحص الموحد)
- [ ] إنشاء `InspectionForm.tsx`
- [ ] دمج مع الخدمات

#### اختبار
- [ ] اختبار قائمة الأولويات
- [ ] اختبار تسجيل الفحص
- [ ] اختبار زر الفحص الموحد

### المرحلة 3: تبويب التهيئة (الأسبوع 5)

#### Backend
- [ ] API: POST `/hives/configure`
- [ ] API: GET `/hives/configured`

#### Frontend
- [ ] إنشاء `ConfigurationTab.tsx`
- [ ] إنشاء `HiveConfigForm.tsx`
- [ ] إنشاء `HiveList.tsx`
- [ ] دمج زر الفحص

#### اختبار
- [ ] اختبار تهيئة خلية واحدة
- [ ] اختبار التهيئة الجماعية

### المرحلة 4: تبويب التقسيم (الأسبوع 6-7)

#### Backend
- [ ] API: GET `/split-candidates`
- [ ] API: POST `/hives/:id/split`
- [ ] منطق تحليل الجاهزية
- [ ] منطق إنشاء الخلايا الجديدة
- [ ] منطق التنبيهات

#### Frontend
- [ ] إنشاء `SplitTab.tsx`
- [ ] إنشاء `CandidatesList.tsx`
- [ ] إنشاء `SplitWizard.tsx`
- [ ] إنشاء `FrameSelector.tsx`
- [ ] دمج زر الفحص

#### اختبار
- [ ] اختبار تحليل المرشحين
- [ ] اختبار عملية التقسيم
- [ ] اختبار التنبيهات

### المرحلة 5: تبويب الدمج والتطوير (الأسبوع 8-9)

#### Backend
- [ ] API: GET `/merge-candidates`
- [ ] API: POST `/hives/:id/merge`
- [ ] API: POST `/hives/:id/develop`
- [ ] منطق التحليل الموسمي
- [ ] منطق اختيار الملكة
- [ ] منطق بروتوكول الأمان

#### Frontend
- [ ] إنشاء `MergeTab.tsx`
- [ ] إنشاء `SeasonalSwitch.tsx`
- [ ] إنشاء `WeakHivesList.tsx`
- [ ] إنشاء `MergePanel.tsx`
- [ ] إنشاء `DevelopmentPanel.tsx`
- [ ] دمج زر الفحص

#### اختبار
- [ ] اختبار التحليل الموسمي
- [ ] اختبار عملية الدمج
- [ ] اختبار عملية التطوير

### المرحلة 6: تبويب العاسلات (الأسبوع 10-11)

#### Backend
- [ ] API: GET `/super-candidates`
- [ ] API: POST `/hives/:id/super`
- [ ] منطق التحليل الموسمي
- [ ] منطق توصيات الإطارات
- [ ] منطق التنبيهات

#### Frontend
- [ ] إنشاء `SuperTab.tsx`
- [ ] إنشاء `SeasonalContext.tsx`
- [ ] إنشاء `ReadyHivesList.tsx`
- [ ] إنشاء `SuperWizard.tsx`
- [ ] إنشاء `FrameManager.tsx`
- [ ] دمج زر الفحص

#### اختبار
- [ ] اختبار تحليل الجاهزية
- [ ] اختبار إضافة عاسلة
- [ ] اختبار التنبيهات

### المرحلة 7: تبويب أعمال اليوم (الأسبوع 12) - تبويب رئيسي مستقل

**ملاحظة:** هذا تبويب رئيسي مستقل وليس جزءاً من تبويب الخلايا

#### Backend
- [ ] API: GET `/operations/daily`
- [ ] API: DELETE `/operations/:id`
- [ ] منطق الفلترة المتقدمة
- [ ] منطق الإحصائيات

#### Frontend
- [ ] إنشاء `DailyOperationsPage.tsx` (صفحة مستقلة)
- [ ] إنشاء `OperationsFilter.tsx`
- [ ] إنشاء `OperationTimeline.tsx`
- [ ] إنشاء `OperationsList.tsx`
- [ ] إنشاء `OperationCard.tsx`
- [ ] إنشاء `OperationStats.tsx`
- [ ] إضافة Route في التطبيق

#### اختبار
- [ ] اختبار عرض العمليات
- [ ] اختبار الفلترة المتقدمة
- [ ] اختبار الحذف والتراجع
- [ ] اختبار الإحصائيات

### المرحلة 8: لوحة التحكم والمحاكاة (الأسبوع 13-14)

#### Backend
- [ ] API: POST `/simulate`
- [ ] منطق المحاكاة التنبؤية
- [ ] دمج بيانات الطقس
- [ ] دمج سلوك النحال
- [ ] حساب نسبة الثقة

#### Frontend
- [ ] إنشاء `DashboardTab.tsx`
- [ ] إنشاء `ApiaryStats.tsx`
- [ ] إنشاء `SimulationPanel.tsx`
- [ ] إنشاء `ChartsSection.tsx`
- [ ] إنشاء `AlertsPanel.tsx`

#### اختبار
- [ ] اختبار المحاكاة لخلية واحدة
- [ ] اختبار المحاكاة لعدة خلايا
- [ ] اختبار المحاكاة للمنحل

### المرحلة 9: الذكاء الاصطناعي (الأسبوع 15-16)

#### Backend
- [ ] دمج AI API
- [ ] إنشاء `AIConsultantService`
- [ ] منطق تحليل السياق
- [ ] منطق توليد التوصيات

#### Frontend
- [ ] إنشاء `AIConsultant.tsx`
- [ ] دمج مع تبويب الفحص
- [ ] دمج مع لوحة التحكم

#### اختبار
- [ ] اختبار الاستشارات
- [ ] اختبار التوصيات

### المرحلة 10: الاختبار الشامل والتحسين (الأسبوع 17-18)

- [ ] اختبار التكامل بين جميع التبويبات
- [ ] اختبار الأداء
- [ ] اختبار تجربة المستخدم
- [ ] تحسين الواجهات
- [ ] إصلاح الأخطاء
- [ ] توثيق الكود
- [ ] إعداد دليل المستخدم

---

## 📊 معايير النجاح

### الوظيفية
- ✅ جميع التبويبات تعمل بشكل صحيح
- ✅ زر الفحص الموحد يعمل في جميع السياقات
- ✅ المحاكاة تعطي نتائج دقيقة
- ✅ التنبيهات تظهر في الوقت المناسب

### الأداء
- ✅ تحميل قائمة الخلايا < 2 ثانية
- ✅ حفظ بيانات الفحص < 1 ثانية
- ✅ المحاكاة < 5 ثواني

### تجربة المستخدم
- ✅ واجهة سلسة بدون انقطاع
- ✅ تنقل سهل بين التبويبات
- ✅ رسائل واضحة ومفهومة
- ✅ دعم اللغة العربية بالكامل

---

## 🔒 ملاحظات مهمة

### الأمان
- جميع APIs محمية بالمصادقة
- التحقق من صلاحيات الوصول للمنحل
- تسجيل جميع العمليات الحساسة

### الأداء
- استخدام Pagination للقوائم الطويلة
- Caching للبيانات المتكررة
- Lazy Loading للمكونات الثقيلة

### قابلية التوسع
- البنية معدة لإضافة تبويبات جديدة
- APIs قابلة للتوسع
- المكونات قابلة لإعادة الاستخدام

---

## 📝 الخلاصة

هذه خطة تنفيذية صارمة لتطوير تبويب الخلايا وتبويب أعمال اليوم بشكل متكامل. الخطة تغطي:

1. ✅ **قاعدة البيانات:** 7 جداول جديدة/محدثة
2. ✅ **Backend:** 7 مجموعات APIs كاملة
3. ✅ **Frontend:** 
   - تبويب الخلايا: 9 مكونات رئيسية
   - تبويب أعمال اليوم: صفحة مستقلة + 6 مكونات
4. ✅ **التنفيذ:** 18 أسبوع مقسمة على 10 مراحل

**المدة الإجمالية:** 18 أسبوع (4.5 شهر)

**الموارد المطلوبة:**
- 2 مطور Backend
- 2 مطور Frontend
- 1 مصمم UI/UX
- 1 مختبر QA

---

**تم إعداد هذه الخطة بناءً على النقاش المفصل مع المستخدم**  
**التاريخ:** 4 فبراير 2026  
**الحالة:** جاهزة للتنفيذ ✅
