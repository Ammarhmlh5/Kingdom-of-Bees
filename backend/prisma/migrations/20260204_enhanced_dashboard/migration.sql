-- Enhanced Dashboard Migration
-- Date: 2026-02-04
-- Description: Add ApiaryMetrics and ApiaryTask tables for enhanced dashboard

-- Create enums first (if not exist)
DO $$ BEGIN
    CREATE TYPE "task_type" AS ENUM ('INSPECTION', 'FEEDING', 'HARVEST', 'SPLIT', 'MERGE', 'TREATMENT', 'ADD_SUPER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "task_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create ApiaryMetrics table
CREATE TABLE IF NOT EXISTS "apiary_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "apiary_id" UUID NOT NULL,
    "overall_strength" DOUBLE PRECISION NOT NULL,
    "strength_rating" TEXT NOT NULL,
    "total_hives" INTEGER NOT NULL,
    "excellent_hives" INTEGER NOT NULL,
    "good_hives" INTEGER NOT NULL,
    "weak_hives" INTEGER NOT NULL,
    "excellent_percent" DOUBLE PRECISION NOT NULL,
    "good_percent" DOUBLE PRECISION NOT NULL,
    "weak_percent" DOUBLE PRECISION NOT NULL,
    "excellent_trend" INTEGER NOT NULL,
    "good_trend" INTEGER NOT NULL,
    "weak_trend" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "apiary_metrics_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for ApiaryMetrics
CREATE INDEX IF NOT EXISTS "apiary_metrics_apiary_id_idx" ON "apiary_metrics"("apiary_id");
CREATE INDEX IF NOT EXISTS "apiary_metrics_calculated_at_idx" ON "apiary_metrics"("calculated_at");

-- Create ApiaryTask table
CREATE TABLE IF NOT EXISTS "apiary_task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "apiary_id" UUID NOT NULL,
    "task_type" "task_type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduled_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "assigned_to_id" UUID,
    "hive_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "apiary_task_apiary_id_fkey" FOREIGN KEY ("apiary_id") REFERENCES "apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "apiary_task_hive_id_fkey" FOREIGN KEY ("hive_id") REFERENCES "hive"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "apiary_task_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for ApiaryTask
CREATE INDEX IF NOT EXISTS "apiary_task_apiary_id_idx" ON "apiary_task"("apiary_id");
CREATE INDEX IF NOT EXISTS "apiary_task_status_idx" ON "apiary_task"("status");
CREATE INDEX IF NOT EXISTS "apiary_task_due_date_idx" ON "apiary_task"("due_date");
