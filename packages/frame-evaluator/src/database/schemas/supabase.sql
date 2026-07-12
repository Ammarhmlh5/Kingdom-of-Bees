-- مخطط قاعدة بيانات Supabase لتقييمات الإطارات
-- يتضمن Row Level Security (RLS) للأمان

-- إنشاء الجدول
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

-- تفعيل Row Level Security (RLS)
ALTER TABLE frame_evaluations ENABLE ROW LEVEL SECURITY;

-- سياسة: المستخدمون يمكنهم قراءة تقييماتهم فقط
CREATE POLICY "Users can view their own evaluations"
  ON frame_evaluations
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- سياسة: المستخدمون يمكنهم إدراج تقييماتهم فقط
CREATE POLICY "Users can insert their own evaluations"
  ON frame_evaluations
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- سياسة: المستخدمون يمكنهم تحديث تقييماتهم فقط
CREATE POLICY "Users can update their own evaluations"
  ON frame_evaluations
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- سياسة: المستخدمون يمكنهم حذف تقييماتهم فقط
CREATE POLICY "Users can delete their own evaluations"
  ON frame_evaluations
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- سياسة اختيارية: السماح للمسؤولين بالوصول الكامل
-- CREATE POLICY "Admins have full access"
--   ON frame_evaluations
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid()
--       AND role = 'admin'
--     )
--   );

-- أمثلة على الاستعلامات

-- إدراج تقييم جديد (يجب أن يكون userId مطابقاً للمستخدم الحالي)
-- INSERT INTO frame_evaluations (
--   id, "hiveId", "frameId", "userId", side,
--   "honeyPercentage", "broodPercentage", "beeBreadPercentage", "emptyPercentage",
--   "broodAge", "isValid", notes, images, metadata
-- ) VALUES (
--   'eval_123', 'hive_1', 'frame_1', auth.uid()::text, 'A',
--   30.0, 50.0, 10.0, 10.0,
--   'MIXED', true, 'تقييم جيد', '[]'::jsonb, '{}'::jsonb
-- );

-- الحصول على تقييمات المستخدم الحالي
-- SELECT * FROM frame_evaluations
-- WHERE "userId" = auth.uid()::text
-- ORDER BY "createdAt" DESC;

-- الحصول على آخر تقييم لإطار معين
-- SELECT * FROM frame_evaluations
-- WHERE "frameId" = 'frame_1'
-- AND "userId" = auth.uid()::text
-- ORDER BY "createdAt" DESC
-- LIMIT 1;
