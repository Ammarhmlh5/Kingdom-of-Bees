-- Add bloom_start_date and bloom_end_date columns to local_plant
ALTER TABLE "local_plant" ADD COLUMN "bloom_start_date" DATE;
ALTER TABLE "local_plant" ADD COLUMN "bloom_end_date" DATE;

-- Add PERCENTAGE to coverage_unit enum
ALTER TYPE "coverage_unit" ADD VALUE 'PERCENTAGE';
