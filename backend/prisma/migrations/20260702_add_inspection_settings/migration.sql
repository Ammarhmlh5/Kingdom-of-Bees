-- Migration: Inspection Settings & Schedules
-- Date: 2026-07-02
-- Adds: inspection_setting, inspection_schedule tables

-- CreateTable: inspection_setting
CREATE TABLE IF NOT EXISTS "inspection_setting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "min_interval" INTEGER NOT NULL,
    "max_interval" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "inspection_setting_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inspection_setting_type_key" UNIQUE ("type")
);

-- CreateTable: inspection_schedule
CREATE TABLE IF NOT EXISTS "inspection_schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hive_id" UUID NOT NULL,
    "setting_id" UUID NOT NULL,
    "scheduled_date" TIMESTAMPTZ NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMPTZ,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "inspection_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: inspection_setting
CREATE UNIQUE INDEX IF NOT EXISTS "inspection_setting_type_key" ON "inspection_setting"("type");

-- CreateIndex: inspection_schedule
CREATE INDEX IF NOT EXISTS "inspection_schedule_hive_id_idx" ON "inspection_schedule"("hive_id");
CREATE INDEX IF NOT EXISTS "inspection_schedule_scheduled_date_idx" ON "inspection_schedule"("scheduled_date");
CREATE INDEX IF NOT EXISTS "inspection_schedule_status_idx" ON "inspection_schedule"("status");

-- AddForeignKey: inspection_setting (with IF NOT EXISTS check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inspection_schedule_hive_id_fkey') THEN
        ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_hive_id_fkey"
            FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inspection_schedule_setting_id_fkey') THEN
        ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_setting_id_fkey"
            FOREIGN KEY ("setting_id") REFERENCES "inspection_setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add default inspection and operation settings
INSERT INTO "inspection_setting" ("type", "name_ar", "min_interval", "max_interval", "is_active", "description") VALUES
    ('QUICK_CHECK', 'فحص سريع', 0, 1, true, 'فحص سريع حسب الحاجة للاطمئنان على حالة الخلية دون تسجيل مفصل'),
    ('ROUTINE', 'فحص روتيني', 3, 10, true, 'الفحص الدوري المنتظم لجميع خلايا المنحل'),
    ('TREATMENT', 'فحص علاجي', 0, 7, true, 'فحص الخلايا بعد العلاج للتأكد من فعالية العلاج وعدم عودة المرض'),
    ('QUEEN_INSPECTION', 'فحص ملكات', 0, 7, true, 'فحص دوري للملكات للتأكد من وضع البيض وصحة الملكة وأدائها'),
    ('FEEDING', 'تغذية', 0, 7, true, 'جدولة التغذية الدورية للخلايا'),
    ('FRAME_TRANSFER', 'نقل إطارات', 0, 30, true, 'نقل الإطارات بين الخلايا'),
    ('FOUNDATION_ADD', 'إضافة شمع أساسات', 0, 60, true, 'إضافة شمع الأساسات للخلايا'),
    ('ADD_SUPER', 'إضافة عاسلة', 0, 30, true, 'إضافة عاسلة فوق الخلية'),
    ('HARVEST', 'حصاد', 0, 30, true, 'جدولة مواعيد حصاد العسل'),
    ('QUEEN_REPLACE', 'استبدال ملكات', 0, 30, true, 'جدولة استبدال الملكات عند الحاجة'),
    ('SPLIT', 'تقسيم خلايا', 0, 60, true, 'تقسيم الخلايا لإنتاج طرود جديدة'),
    ('MERGE', 'دمج خلايا', 0, 60, true, 'دمج خليتين في خلية واحدة')
ON CONFLICT ("type") DO NOTHING;