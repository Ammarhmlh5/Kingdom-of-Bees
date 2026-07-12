-- Migration: Apiary Workspace Completion
-- Date: 2026-04-19
-- Adds: financial_record, apiary_operation tables

-- ============================================================================
-- 1. financial_record table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "financial_record" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiary_id"   UUID NOT NULL REFERENCES "apiary"("id") ON DELETE CASCADE,
  "type"        VARCHAR(10) NOT NULL CHECK ("type" IN ('REVENUE', 'EXPENSE')),
  "amount"      DECIMAL(12, 2) NOT NULL CHECK ("amount" > 0),
  "currency"    VARCHAR(3) NOT NULL DEFAULT 'SAR',
  "category"    VARCHAR(100) NOT NULL,
  "description" TEXT,
  "record_date" DATE NOT NULL,
  "created_by"  UUID REFERENCES "user_profile"("id") ON DELETE SET NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_financial_record_apiary_date"
  ON "financial_record"("apiary_id", "record_date" DESC);

CREATE INDEX IF NOT EXISTS "idx_financial_record_type"
  ON "financial_record"("apiary_id", "type");

-- ============================================================================
-- 2. apiary_operation table (unified operations log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "apiary_operation" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "apiary_id"        UUID NOT NULL REFERENCES "apiary"("id") ON DELETE CASCADE,
  "operation_number" INTEGER NOT NULL,
  "operation_type"   VARCHAR(20) NOT NULL CHECK ("operation_type" IN (
    'INSPECTION', 'FEEDING', 'HARVEST', 'SPLIT', 'MERGE', 'TREATMENT', 'ADD_SUPER'
  )),
  "hive_id"          UUID REFERENCES "hive"("id") ON DELETE SET NULL,
  "description"      TEXT NOT NULL,
  "performed_by"     UUID REFERENCES "user_profile"("id") ON DELETE SET NULL,
  "operation_date"   TIMESTAMPTZ NOT NULL,
  "source_record_id" UUID,
  "source_type"      VARCHAR(30),
  "data"             JSONB NOT NULL DEFAULT '{}',
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("apiary_id", "operation_number")
);

CREATE INDEX IF NOT EXISTS "idx_apiary_operation_apiary_date"
  ON "apiary_operation"("apiary_id", "operation_date" DESC);

CREATE INDEX IF NOT EXISTS "idx_apiary_operation_type"
  ON "apiary_operation"("apiary_id", "operation_type");
