-- Migration: Hives Tab Development - Phase 1
-- Date: 2026-02-04
-- Description: Adding new tables and fields for Hives Tab functionality

-- ============================================
-- 1. Update Hive table with new fields
-- ============================================

ALTER TABLE "hive" 
ADD COLUMN IF NOT EXISTS "priority" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "next_inspection_reason" TEXT,
ADD COLUMN IF NOT EXISTS "ai_recommendations" JSONB,
ADD COLUMN IF NOT EXISTS "simulation_data" JSONB;

-- ============================================
-- 2. Create DevelopmentOperation table
-- ============================================

CREATE TABLE IF NOT EXISTS "development_operation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiary_id" UUID NOT NULL,
  "hive_id" UUID NOT NULL,
  "operation_type" TEXT NOT NULL,
  "development_date" TIMESTAMPTZ NOT NULL,
  "before_status" JSONB NOT NULL,
  "after_status" JSONB NOT NULL,
  "notes" TEXT,
  "performed_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_development_apiary" FOREIGN KEY ("apiary_id") 
    REFERENCES "apiary"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_development_hive" FOREIGN KEY ("hive_id") 
    REFERENCES "hive"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_development_apiary_date" 
  ON "development_operation"("apiary_id", "development_date" DESC);

-- ============================================
-- 3. Create SuperOperation table
-- ============================================

CREATE TABLE IF NOT EXISTS "super_operation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiary_id" UUID NOT NULL,
  "hive_id" UUID NOT NULL,
  "operation_type" TEXT NOT NULL,
  "operation_date" TIMESTAMPTZ NOT NULL,
  "super_number" INTEGER NOT NULL,
  "frames_in_super" INTEGER NOT NULL,
  "has_excluder" BOOLEAN DEFAULT FALSE,
  "frames_moved_up" JSONB,
  "expected_yield" DECIMAL(10, 2),
  "notes" TEXT,
  "performed_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_super_apiary" FOREIGN KEY ("apiary_id") 
    REFERENCES "apiary"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_super_hive" FOREIGN KEY ("hive_id") 
    REFERENCES "hive"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_super_apiary_date" 
  ON "super_operation"("apiary_id", "operation_date" DESC);

-- ============================================
-- 4. Create DailyOperation table
-- ============================================

CREATE TABLE IF NOT EXISTS "daily_operation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiary_id" UUID NOT NULL,
  "hive_id" UUID,
  "operation_type" TEXT NOT NULL,
  "operation_date" TIMESTAMPTZ NOT NULL,
  "operation_data" JSONB NOT NULL,
  "source_hive_id" UUID,
  "target_hive_id" UUID,
  "performed_by" UUID NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_daily_apiary" FOREIGN KEY ("apiary_id") 
    REFERENCES "apiary"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_daily_hive" FOREIGN KEY ("hive_id") 
    REFERENCES "hive"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_daily_apiary_date" 
  ON "daily_operation"("apiary_id", "operation_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_daily_performer_date" 
  ON "daily_operation"("performed_by", "operation_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_daily_operation_type" 
  ON "daily_operation"("operation_type");

-- ============================================
-- 5. Create HiveSimulation table
-- ============================================

CREATE TABLE IF NOT EXISTS "hive_simulation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "hive_id" UUID NOT NULL,
  "simulation_date" TIMESTAMPTZ NOT NULL,
  "current_state" JSONB NOT NULL,
  "predicted_states" JSONB NOT NULL,
  "factors" JSONB NOT NULL,
  "confidence" DECIMAL(5, 2) NOT NULL,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "fk_simulation_hive" FOREIGN KEY ("hive_id") 
    REFERENCES "hive"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_simulation_hive_date" 
  ON "hive_simulation"("hive_id", "simulation_date" DESC);

-- ============================================
-- 6. Update SplitOperation table
-- ============================================

ALTER TABLE "split_operation"
ADD COLUMN IF NOT EXISTS "frames_transferred" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "queen_location" TEXT,
ADD COLUMN IF NOT EXISTS "frame_details" JSONB,
ADD COLUMN IF NOT EXISTS "performed_by" UUID;

-- ============================================
-- 7. Update MergeOperation table
-- ============================================

ALTER TABLE "merge_operation"
ADD COLUMN IF NOT EXISTS "queen_kept" TEXT,
ADD COLUMN IF NOT EXISTS "queen_removed" UUID,
ADD COLUMN IF NOT EXISTS "safety_protocol" JSONB,
ADD COLUMN IF NOT EXISTS "success" BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "performed_by" UUID;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE "development_operation" IS 'Tracks hive development operations (NUC to HIVE, strengthening)';
COMMENT ON TABLE "super_operation" IS 'Tracks super/honey box operations (adding, removing, excluder)';
COMMENT ON TABLE "daily_operation" IS 'Tracks all daily operations for audit and rollback';
COMMENT ON TABLE "hive_simulation" IS 'Stores predictive simulation data for hives';

COMMENT ON COLUMN "hive"."priority" IS 'Inspection priority score (higher = more urgent)';
COMMENT ON COLUMN "hive"."next_inspection_reason" IS 'Reason for next inspection';
COMMENT ON COLUMN "hive"."ai_recommendations" IS 'AI-generated recommendations for this hive';
COMMENT ON COLUMN "hive"."simulation_data" IS 'Latest simulation predictions';
