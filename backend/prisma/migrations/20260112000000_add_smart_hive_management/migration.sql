-- Create Enums if not exists
DO $$ BEGIN
    CREATE TYPE "ActionPriority" AS ENUM ('IMMEDIATE', 'URGENT', 'SOON', 'ROUTINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "HiveCondition" AS ENUM ('EXCELLENT', 'VERY_GOOD', 'GOOD', 'WEAK', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OperationType" AS ENUM ('SPLIT', 'ADD_SUPER', 'COMPRESS', 'MERGE', 'TRANSFORM', 'PROMOTE', 'FEED_SUPPORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "hive" ADD COLUMN IF NOT EXISTS "condition" "HiveCondition" NOT NULL DEFAULT 'GOOD';

-- CreateTable
CREATE TABLE IF NOT EXISTS "hive_analysis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hive_id" UUID NOT NULL,
    "apiary_id" UUID NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "general_strength_score" INTEGER NOT NULL,
    "split_readiness_score" INTEGER NOT NULL,
    "super_readiness_score" INTEGER NOT NULL,
    "winter_survival_score" INTEGER NOT NULL,
    "condition" "HiveCondition" NOT NULL,
    "frame_count" INTEGER NOT NULL,
    "brood_frame_count" INTEGER NOT NULL,
    "honey_frame_count" INTEGER NOT NULL,
    "pollen_frame_count" INTEGER NOT NULL,
    "queen_status" TEXT,
    "weather_factor" DECIMAL(65,30),
    "forage_factor" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hive_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hive_operation_suggestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "apiary_id" UUID NOT NULL,
    "primary_hive_id" UUID NOT NULL,
    "secondary_hive_id" UUID,
    "type" "OperationType" NOT NULL,
    "priority" "ActionPriority" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "hive_operation_suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hive_analysis_hive_id_idx" ON "hive_analysis"("hive_id");
CREATE INDEX IF NOT EXISTS "hive_analysis_apiary_id_idx" ON "hive_analysis"("apiary_id");
CREATE INDEX IF NOT EXISTS "hive_analysis_condition_idx" ON "hive_analysis"("condition");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hive_operation_suggestion_apiary_id_idx" ON "hive_operation_suggestion"("apiary_id");
CREATE INDEX IF NOT EXISTS "hive_operation_suggestion_type_idx" ON "hive_operation_suggestion"("type");
CREATE INDEX IF NOT EXISTS "hive_operation_suggestion_status_idx" ON "hive_operation_suggestion"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hive_condition_idx" ON "hive"("condition");

-- AddForeignKey (Constraint names must be unique, so we drop if exists conceptually, or just try add)
-- Better to use DO block for constraints too if re-running, but for now simple ALTER is fine as we expect clean run or failure.
-- If we want to be safe:
DO $$ BEGIN
    ALTER TABLE "hive_analysis" ADD CONSTRAINT "hive_analysis_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "hive_analysis" ADD CONSTRAINT "hive_analysis_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "hive_operation_suggestion" ADD CONSTRAINT "hive_operation_suggestion_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "hive_operation_suggestion" ADD CONSTRAINT "hive_operation_suggestion_primary_hive_id_fkey" FOREIGN KEY ("primary_hive_id") REFERENCES "hive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "hive_operation_suggestion" ADD CONSTRAINT "hive_operation_suggestion_secondary_hive_id_fkey" FOREIGN KEY ("secondary_hive_id") REFERENCES "hive"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
