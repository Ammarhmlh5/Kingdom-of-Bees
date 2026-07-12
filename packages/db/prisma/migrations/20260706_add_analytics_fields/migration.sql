-- Migration: Add analytics fields to operation_analysis and recreate prediction_match

-- Drop old columns from operation_analysis if they exist and add new ones
ALTER TABLE "operation_analysis" DROP COLUMN IF EXISTS "operation_type";
ALTER TABLE "operation_analysis" DROP COLUMN IF EXISTS "predicted_date";
ALTER TABLE "operation_analysis" DROP COLUMN IF EXISTS "accuracy_days";
ALTER TABLE "operation_analysis" DROP COLUMN IF EXISTS "actual_date";

-- Add new columns
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "hive_id" UUID NOT NULL;
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "analysis_type" TEXT NOT NULL;
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "prediction_payload" JSONB;
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "source_operation_id" UUID;
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "confidence_score" DOUBLE PRECISION;
ALTER TABLE "operation_analysis" ADD COLUMN IF NOT EXISTS "is_resolved" BOOLEAN NOT NULL DEFAULT false;

-- Drop old index and create new ones
DROP INDEX IF EXISTS "operation_analysis_apiary_id_operation_type_idx";
CREATE INDEX IF NOT EXISTS "operation_analysis_apiary_id_idx" ON "operation_analysis"("apiary_id");
CREATE INDEX IF NOT EXISTS "operation_analysis_hive_id_idx" ON "operation_analysis"("hive_id");
CREATE INDEX IF NOT EXISTS "operation_analysis_analysis_type_idx" ON "operation_analysis"("analysis_type");

-- Add foreign key for hive_id
ALTER TABLE "operation_analysis" DROP CONSTRAINT IF EXISTS "operation_analysis_hive_id_fkey";
ALTER TABLE "operation_analysis" ADD CONSTRAINT "operation_analysis_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE CASCADE;

-- Drop and recreate prediction_match
DROP TABLE IF EXISTS "prediction_match";

CREATE TABLE "prediction_match" (
    "id" UUID NOT NULL,
    "analysis_id" UUID NOT NULL,
    "apiary_id" UUID NOT NULL,
    "resolving_operation_id" UUID NOT NULL,
    "is_accurate" BOOLEAN NOT NULL,
    "accuracy_score" DECIMAL(5,2) NOT NULL,
    "predicted_data" JSONB,
    "actual_outcome_data" JSONB,
    "matched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_match_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "prediction_match_analysis_id_idx" ON "prediction_match"("analysis_id");
CREATE INDEX IF NOT EXISTS "prediction_match_apiary_id_idx" ON "prediction_match"("apiary_id");

ALTER TABLE "prediction_match" ADD CONSTRAINT "prediction_match_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "operation_analysis"("id") ON DELETE CASCADE;
