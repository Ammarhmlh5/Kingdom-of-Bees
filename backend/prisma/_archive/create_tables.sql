-- CreateTable: inspection_setting
CREATE TABLE "inspection_setting" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "min_interval" INTEGER NOT NULL,
    "max_interval" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "inspection_setting_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint after table creation
ALTER TABLE "inspection_setting" ADD CONSTRAINT "inspection_setting_type_key" UNIQUE ("type");

-- CreateTable: inspection_schedule
CREATE TABLE "inspection_schedule" (
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

-- CreateIndex: inspection_schedule
CREATE INDEX "inspection_schedule_hive_id_idx" ON "inspection_schedule"("hive_id");
CREATE INDEX "inspection_schedule_scheduled_date_idx" ON "inspection_schedule"("scheduled_date");
CREATE INDEX "inspection_schedule_status_idx" ON "inspection_schedule"("status");

-- AddForeignKey: inspection_schedule
ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "inspection_setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add default inspection settings
INSERT INTO "inspection_setting" ("type", "name_ar", "min_interval", "max_interval", "is_active", "description") VALUES
    ('ROUTINE', 'فحص روتيني', 3, 10, true, 'الفحص الدوري الروتيني للخلايا'),
    ('QUICK_CHECK', 'فحص سريع', 0, 1, true, 'فحص سريع حسب الحاجة'),
    ('DISEASE_CHECK', 'فحص أمراض', 0, 3, true, 'فحص للمتابعة العلاجية'),
    ('QUEEN_CHECK', 'فحص ملكات', 14, 21, true, 'فحص بعد التربية أو جني الغذاء الملكي');

-- Verify tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'inspection%';