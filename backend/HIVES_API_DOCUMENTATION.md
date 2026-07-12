# Hives Tab API Documentation
## توثيق واجهات برمجة تطبيقات تبويب الخلايا

**تاريخ:** 4 فبراير 2026  
**الإصدار:** 1.0.0

---

## 📋 جدول المحتويات

1. [Inspection APIs](#inspection-apis)
2. [Split APIs](#split-apis)
3. [Merge APIs](#merge-apis)
4. [Super APIs](#super-apis)
5. [Simulation APIs](#simulation-apis)
6. [Operations APIs](#operations-apis)

---

## 🔍 Inspection APIs

### 1. Get Inspection Queue
**Endpoint:** `GET /api/apiaries/:apiaryId/hives/inspection-queue`

**Description:** جلب قائمة الخلايا حسب الأولوية للفحص

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "hiveNumber": "H001",
      "priority": 10,
      "reason": "overdue_inspection",
      "daysOverdue": 5,
      "lastInspection": "2026-01-30T10:00:00Z",
      "aiRecommendation": "يجب الفحص فوراً - تأخر 5 أيام"
    }
  ],
  "count": 5
}
```

---

### 2. Record Inspection
**Endpoint:** `POST /api/apiaries/:apiaryId/hives/:hiveId/inspect`

**Description:** تسجيل فحص جديد

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "inspectionDate": "2026-02-04T10:00:00Z",
  "queenSeen": true,
  "queenQuality": "EXCELLENT",
  "broodFrames": 8,
  "honeyFrames": 3,
  "pollenFrames": 2,
  "foundationAdded": 2,
  "framesTransferred": [
    {
      "from": "hive-uuid-1",
      "to": "hive-uuid-2",
      "count": 1
    }
  ],
  "diseases": [],
  "foodStock": {
    "honey": 5,
    "pollen": 2
  },
  "notes": "الخلية في حالة ممتازة",
  "aiConsultation": {
    "question": "هل يجب إضافة عاسلة؟",
    "answer": "نعم، الخلية قوية وجاهزة"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inspection-uuid",
    "hiveId": "hive-uuid",
    "inspectionDate": "2026-02-04T10:00:00Z"
  },
  "message": "تم تسجيل الفحص بنجاح"
}
```

---

### 3. Update Priorities
**Endpoint:** `PUT /api/apiaries/:apiaryId/hives/priorities`

**Description:** تحديث أولويات جميع الخلايا يدوياً

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث الأولويات بنجاح"
}
```

---

## ✂️ Split APIs

### 1. Get Split Candidates
**Endpoint:** `GET /api/apiaries/:apiaryId/hives/split-candidates`

**Description:** جلب الخلايا المرشحة للتقسيم

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "hiveId": "uuid",
      "hiveNumber": "H001",
      "strengthScore": 85,
      "readinessLevel": "READY",
      "recommendation": "الخلية قوية وجاهزة للتقسيم الآن",
      "estimatedFrames": 4
    }
  ],
  "count": 3
}
```

---

### 2. Execute Split
**Endpoint:** `POST /api/apiaries/:apiaryId/hives/:hiveId/split`

**Description:** تنفيذ عملية التقسيم

**Request Body:**
```json
{
  "newHiveNumber": "H010",
  "framesTransferred": [
    {
      "frameId": "frame-uuid-1",
      "rating": 9,
      "type": "BROOD"
    },
    {
      "frameId": "frame-uuid-2",
      "rating": 8,
      "type": "BROOD"
    }
  ],
  "queenLocation": "SOURCE",
  "notes": "تقسيم ناجح"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "splitOperation": {},
    "newHive": {
      "id": "new-hive-uuid",
      "hiveNumber": "H010"
    },
    "sourceHive": {}
  },
  "message": "تم تقسيم الخلية بنجاح"
}
```

---

## 🔗 Merge APIs

### 1. Get Merge Candidates
**Endpoint:** `GET /api/apiaries/:apiaryId/hives/merge-candidates?season=AUTUMN`

**Description:** جلب الخلايا المرشحة للدمج

**Query Params:**
- `season`: SPRING | AUTUMN (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "weakHives": [
      {
        "hiveId": "uuid",
        "hiveNumber": "H005",
        "riskLevel": 80,
        "survivalChance": 20,
        "recommendation": "خطر عالي - يجب الدمج فوراً"
      }
    ],
    "suggestedMerges": [
      {
        "weakHive": "weak-hive-uuid",
        "targetHive": "strong-hive-uuid",
        "queenToKeep": "TARGET",
        "safetyProtocol": [
          "ضع ورقة جريدة بين الخليتين",
          "اثقب الورقة بثقوب صغيرة"
        ]
      }
    ]
  },
  "season": "AUTUMN"
}
```

---

### 2. Execute Merge
**Endpoint:** `POST /api/apiaries/:apiaryId/hives/:hiveId/merge`

**Description:** تنفيذ عملية الدمج

**Request Body:**
```json
{
  "targetHiveId": "target-hive-uuid",
  "mergeMethod": "NEWSPAPER",
  "queenKept": "TARGET",
  "safetyProtocol": [
    "ضع ورقة جريدة بين الخليتين",
    "اثقب الورقة بثقوب صغيرة"
  ],
  "notes": "دمج ناجح"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mergeOperation": {},
    "targetHive": {},
    "weakHive": {}
  },
  "message": "تم دمج الخلايا بنجاح"
}
```

---

## 📦 Super APIs

### 1. Get Super Candidates
**Endpoint:** `GET /api/apiaries/:apiaryId/hives/super-candidates`

**Description:** جلب الخلايا الجاهزة للعاسلات

**Response:**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "hiveId": "uuid",
        "hiveNumber": "H001",
        "readiness": "ADD_SUPER",
        "currentStories": 1,
        "recommendation": "الخلية قوية وجاهزة لإضافة طابق ثاني",
        "frameSuggestions": {
          "framesToMoveUp": ["frame-uuid-1", "frame-uuid-2"],
          "framesToAdd": []
        }
      }
    ],
    "seasonalContext": {
      "currentSeason": "ربيع",
      "upcomingFlows": ["السدر الربيعي"],
      "daysUntilPeak": 15
    }
  }
}
```

---

### 2. Add Super
**Endpoint:** `POST /api/apiaries/:apiaryId/hives/:hiveId/super`

**Description:** إضافة عاسلة للخلية

**Request Body:**
```json
{
  "operationType": "ADD_SUPER",
  "framesInSuper": 10,
  "hasExcluder": true,
  "framesMovedUp": ["frame-uuid-1", "frame-uuid-2"],
  "expectedYield": 15.5,
  "notes": "إضافة عاسلة قبل موسم السدر"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "superRecord": {},
    "hive": {},
    "newStoryNumber": 2
  },
  "message": "تم إضافة العاسلة بنجاح"
}
```

---

## 🔮 Simulation APIs

### 1. Run Simulation
**Endpoint:** `POST /api/apiaries/:apiaryId/simulate`

**Description:** تشغيل محاكاة تنبؤية

**Request Body:**
```json
{
  "scope": "HIVE",
  "hiveIds": ["hive-uuid-1"],
  "duration": 12,
  "factors": {
    "includeWeather": true,
    "includeBeekeeper": true,
    "includeSeasons": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulationId": "sim_1738627200000",
    "predictions": [
      {
        "month": 1,
        "hiveId": "hive-uuid-1",
        "predictedState": {
          "strength": 85,
          "broodFrames": 8,
          "honeyProduction": 2.5,
          "diseases": [],
          "queenStatus": "جيدة"
        },
        "confidence": 90,
        "recommendations": [
          "الخلية في حالة ممتازة",
          "فرصة جيدة للتقسيم"
        ]
      }
    ]
  },
  "message": "تم إنشاء المحاكاة بنجاح"
}
```

---

### 2. Get Simulation History
**Endpoint:** `GET /api/apiaries/:apiaryId/hives/:hiveId/simulations`

**Description:** جلب سجل المحاكاة لخلية معينة

**Response:**
```json
{
  "success": true,
  "data": [],
  "message": "سيتم تنفيذ هذه الميزة قريباً"
}
```

---

## 📊 Operations APIs

### 1. Get Daily Operations
**Endpoint:** `GET /api/operations/daily`

**Description:** جلب العمليات اليومية مع الفلترة

**Query Params:**
- `apiaryId`: string (optional)
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)
- `operationType`: string (optional)
- `performedBy`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "operation-uuid",
      "operationType": "FRAME_TRANSFER",
      "operationDate": "2026-02-04T10:00:00Z",
      "apiaryName": "منحل الوادي",
      "hiveNumber": "H001",
      "hiveName": "الخلية الأولى",
      "operationData": {
        "description": "نقل 2 إطار",
        "details": "من الخلية H001 إلى الخلية H002"
      },
      "performedBy": "user-uuid",
      "notes": "نقل ناجح",
      "createdAt": "2026-02-04T10:00:00Z"
    }
  ],
  "count": 25
}
```

---

### 2. Get Operation Stats
**Endpoint:** `GET /api/operations/stats`

**Description:** جلب إحصائيات العمليات

**Query Params:**
- `apiaryId`: string (optional)
- `startDate`: ISO date (optional)
- `endDate`: ISO date (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOperations": 150,
    "operationsByType": {
      "FRAME_TRANSFER": 45,
      "INSPECTION": 30,
      "FEEDING": 25
    },
    "operationsByWorker": {
      "user-uuid-1": 80,
      "user-uuid-2": 70
    },
    "mostActiveWorker": {
      "id": "user-uuid-1",
      "name": "Worker Name",
      "count": 80
    },
    "mostCommonOperation": {
      "type": "FRAME_TRANSFER",
      "count": 45
    }
  }
}
```

---

### 3. Get Operation Types
**Endpoint:** `GET /api/operations/types`

**Description:** جلب جميع أنواع العمليات مع التسميات العربية

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "FRAME_TRANSFER",
      "label": "نقل إطار"
    },
    {
      "value": "FOUNDATION_ADD",
      "label": "إضافة شمع أساس"
    },
    {
      "value": "QUEEN_REPLACE",
      "label": "إحلال ملكة"
    }
  ]
}
```

---

### 4. Delete Operation
**Endpoint:** `DELETE /api/operations/:operationId`

**Description:** حذف عملية (Rollback)

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "تم حذف العملية بنجاح",
    "deletedOperation": {}
  },
  "message": "تم حذف العملية بنجاح"
}
```

---

## 🔐 Authentication

جميع الـ APIs تتطلب Authentication عبر Bearer Token:

```
Authorization: Bearer {your-jwt-token}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "رسالة الخطأ بالعربية"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "رسالة الخطأ بالعربية"
}
```

---

## 📝 Notes

1. جميع التواريخ بصيغة ISO 8601
2. جميع الـ IDs بصيغة UUID
3. جميع الرسائل باللغة العربية
4. جميع الـ APIs تدعم JSON فقط

---

**آخر تحديث:** 4 فبراير 2026  
**الإصدار:** 1.0.0
