-- Fix migration issue: remove the broken migration record and reapply it
DELETE FROM "prisma_migrations" WHERE "migration_name" = '20260702_add_inspection_settings';

-- Now apply the migration manually
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

-- AddForeignKey: inspection_setting
ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "inspection_setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add default inspection settings
INSERT INTO "inspection_setting" ("type", "name_ar", "min_interval", "max_interval", "is_active", "description") VALUES
    ('ROUTINE', 'فحص روتيني', 3, 10, true, 'الفحص الدوري الروتيني للخلايا'),
    ('QUICK_CHECK', 'فحص سريع', 0, 1, true, 'الفحص السريع حسب الحاجة'),
    ('DISEASE_CHECK', 'فحص أمراض', 0, 3, true, 'فحص للمتابعة العلاجية'),
    ('QUEEN_CHECK', 'فحص ملكات', 14, 21, true, 'فحص بعد التربية أو جني الغذاء الملكي')
ON CONFLICT ("type") DO NOTHING;
