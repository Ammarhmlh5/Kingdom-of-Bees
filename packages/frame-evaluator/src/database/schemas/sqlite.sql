-- مخطط قاعدة بيانات SQLite لتقييمات الإطارات
-- يمكن استخدام هذا الملف لإنشاء الجدول يدوياً

CREATE TABLE IF NOT EXISTS frame_evaluations (
  -- المعرفات
  id TEXT PRIMARY KEY,
  hiveId TEXT,
  frameId TEXT,
  userId TEXT,
  
  -- بيانات التقييم
  side TEXT NOT NULL CHECK(side IN ('A', 'B')),
  honeyPercentage REAL NOT NULL CHECK(honeyPercentage >= 0 AND honeyPercentage <= 100),
  broodPercentage REAL NOT NULL CHECK(broodPercentage >= 0 AND broodPercentage <= 100),
  beeBreadPercentage REAL NOT NULL CHECK(beeBreadPercentage >= 0 AND beeBreadPercentage <= 100),
  emptyPercentage REAL NOT NULL CHECK(emptyPercentage >= 0 AND emptyPercentage <= 100),
  broodAge TEXT NOT NULL,
  isValid INTEGER NOT NULL DEFAULT 1,
  
  -- بيانات إضافية
  notes TEXT,
  images TEXT, -- JSON array
  metadata TEXT, -- JSON object
  
  -- التواريخ
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_hiveId ON frame_evaluations(hiveId);
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_frameId ON frame_evaluations(frameId);
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_userId ON frame_evaluations(userId);
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_createdAt ON frame_evaluations(createdAt);

-- أمثلة على الاستعلامات

-- إدراج تقييم جديد
-- INSERT INTO frame_evaluations (
--   id, hiveId, frameId, userId, side,
--   honeyPercentage, broodPercentage, beeBreadPercentage, emptyPercentage,
--   broodAge, isValid, notes, images, metadata, createdAt, updatedAt
-- ) VALUES (
--   'eval_123', 'hive_1', 'frame_1', 'user_1', 'A',
--   30.0, 50.0, 10.0, 10.0,
--   'MIXED', 1, 'تقييم جيد', '[]', '{}', datetime('now'), datetime('now')
-- );

-- الحصول على آخر تقييم لإطار معين
-- SELECT * FROM frame_evaluations
-- WHERE frameId = 'frame_1'
-- ORDER BY createdAt DESC
-- LIMIT 1;

-- الحصول على تاريخ التقييمات لخلية معينة
-- SELECT * FROM frame_evaluations
-- WHERE hiveId = 'hive_1'
-- ORDER BY createdAt DESC;

-- حساب متوسط النسب المئوية
-- SELECT
--   AVG(honeyPercentage) as avgHoney,
--   AVG(broodPercentage) as avgBrood,
--   AVG(beeBreadPercentage) as avgBeeBread
-- FROM frame_evaluations
-- WHERE hiveId = 'hive_1';
