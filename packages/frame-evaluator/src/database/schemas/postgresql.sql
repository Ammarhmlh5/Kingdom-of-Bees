-- مخطط قاعدة بيانات PostgreSQL لتقييمات الإطارات
-- يمكن استخدام هذا الملف لإنشاء الجدول يدوياً

CREATE TABLE IF NOT EXISTS frame_evaluations (
  -- المعرفات
  id TEXT PRIMARY KEY,
  "hiveId" TEXT,
  "frameId" TEXT,
  "userId" TEXT,
  
  -- بيانات التقييم
  side TEXT NOT NULL CHECK(side IN ('A', 'B')),
  "honeyPercentage" DECIMAL(5,2) NOT NULL CHECK("honeyPercentage" >= 0 AND "honeyPercentage" <= 100),
  "broodPercentage" DECIMAL(5,2) NOT NULL CHECK("broodPercentage" >= 0 AND "broodPercentage" <= 100),
  "beeBreadPercentage" DECIMAL(5,2) NOT NULL CHECK("beeBreadPercentage" >= 0 AND "beeBreadPercentage" <= 100),
  "emptyPercentage" DECIMAL(5,2) NOT NULL CHECK("emptyPercentage" >= 0 AND "emptyPercentage" <= 100),
  "broodAge" TEXT NOT NULL,
  "isValid" BOOLEAN NOT NULL DEFAULT true,
  
  -- بيانات إضافية
  notes TEXT,
  images JSONB, -- JSON array
  metadata JSONB, -- JSON object
  
  -- التواريخ
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_hiveId ON frame_evaluations("hiveId");
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_frameId ON frame_evaluations("frameId");
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_userId ON frame_evaluations("userId");
CREATE INDEX IF NOT EXISTS idx_frame_evaluations_createdAt ON frame_evaluations("createdAt");

-- دالة لتحديث updatedAt تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger لتحديث updatedAt عند التحديث
DROP TRIGGER IF EXISTS update_frame_evaluations_updated_at ON frame_evaluations;
CREATE TRIGGER update_frame_evaluations_updated_at
  BEFORE UPDATE ON frame_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- أمثلة على الاستعلامات

-- إدراج تقييم جديد
-- INSERT INTO frame_evaluations (
--   id, "hiveId", "frameId", "userId", side,
--   "honeyPercentage", "broodPercentage", "beeBreadPercentage", "emptyPercentage",
--   "broodAge", "isValid", notes, images, metadata
-- ) VALUES (
--   'eval_123', 'hive_1', 'frame_1', 'user_1', 'A',
--   30.0, 50.0, 10.0, 10.0,
--   'MIXED', true, 'تقييم جيد', '[]'::jsonb, '{}'::jsonb
-- );

-- الحصول على آخر تقييم لإطار معين
-- SELECT * FROM frame_evaluations
-- WHERE "frameId" = 'frame_1'
-- ORDER BY "createdAt" DESC
-- LIMIT 1;

-- الحصول على تاريخ التقييمات لخلية معينة
-- SELECT * FROM frame_evaluations
-- WHERE "hiveId" = 'hive_1'
-- ORDER BY "createdAt" DESC;

-- حساب متوسط النسب المئوية
-- SELECT
--   AVG("honeyPercentage") as "avgHoney",
--   AVG("broodPercentage") as "avgBrood",
--   AVG("beeBreadPercentage") as "avgBeeBread"
-- FROM frame_evaluations
-- WHERE "hiveId" = 'hive_1';

-- إيجاد أكثر عمر حضنة شيوعاً
-- SELECT
--   "broodAge",
--   COUNT(*) as count
-- FROM frame_evaluations
-- WHERE "hiveId" = 'hive_1'
-- GROUP BY "broodAge"
-- ORDER BY count DESC
-- LIMIT 1;
