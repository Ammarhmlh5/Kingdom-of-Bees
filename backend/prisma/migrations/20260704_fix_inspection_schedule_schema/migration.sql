-- Migration: Fix Inspection Schedule Schema
-- Date: 2026-07-04
-- Adds missing columns to inspection_schedule table to match Prisma schema
-- Fixes Prisma P2022 error: column "apiary_id" does not exist

-- Add apiary_id column (nullable initially for backfill)
ALTER TABLE "inspection_schedule"
  ADD COLUMN IF NOT EXISTS "apiary_id" UUID;

-- Backfill apiary_id from hive's apiary_id
UPDATE "inspection_schedule" s
  SET "apiary_id" = h."apiary_id"
  FROM "hive" h
  WHERE s."hive_id" = h."id"
  AND s."apiary_id" IS NULL;

-- Make apiary_id NOT NULL after backfill
ALTER TABLE "inspection_schedule"
  ALTER COLUMN "apiary_id" SET NOT NULL;

-- Add foreign key to apiary (with IF NOT EXISTS check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inspection_schedule_apiary_id_fkey') THEN
        ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_apiary_id_fkey"
            FOREIGN KEY ("apiary_id") REFERENCES "apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add index on apiary_id
CREATE INDEX IF NOT EXISTS "inspection_schedule_apiary_id_idx"
  ON "inspection_schedule"("apiary_id");

-- Add combined index on (apiary_id, scheduled_date)
CREATE INDEX IF NOT EXISTS "inspection_schedule_apiary_id_scheduled_date_idx"
  ON "inspection_schedule"("apiary_id", "scheduled_date");

-- Add inspection_id column (nullable)
ALTER TABLE "inspection_schedule"
  ADD COLUMN IF NOT EXISTS "inspection_id" UUID;

-- Add foreign key to inspection (with IF NOT EXISTS check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inspection_schedule_inspection_id_fkey') THEN
        ALTER TABLE "inspection_schedule" ADD CONSTRAINT "inspection_schedule_inspection_id_fkey"
            FOREIGN KEY ("inspection_id") REFERENCES "inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add skipped column
ALTER TABLE "inspection_schedule"
  ADD COLUMN IF NOT EXISTS "skipped" BOOLEAN NOT NULL DEFAULT false;

-- Add skip_reason column
ALTER TABLE "inspection_schedule"
  ADD COLUMN IF NOT EXISTS "skip_reason" TEXT;
