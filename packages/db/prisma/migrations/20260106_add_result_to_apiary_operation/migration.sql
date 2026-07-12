-- AlterTable: Add missing columns to apiary_operation
ALTER TABLE "apiary_operation" ADD COLUMN IF NOT EXISTS "result" TEXT;
ALTER TABLE "apiary_operation" ADD COLUMN IF NOT EXISTS "success" BOOLEAN NOT NULL DEFAULT true;
