-- Create a sequence for operation_number
CREATE SEQUENCE IF NOT EXISTS "apiary_operation_operation_number_seq";

-- Backfill existing rows with sequential numbers
UPDATE "apiary_operation"
SET "operation_number" = nextval('"apiary_operation_operation_number_seq"')
WHERE "operation_number" IS NULL OR "operation_number" = 0;

-- Set the default value to use the sequence
ALTER TABLE "apiary_operation"
ALTER COLUMN "operation_number" SET DEFAULT nextval('"apiary_operation_operation_number_seq"');

-- Ensure the column is NOT NULL
ALTER TABLE "apiary_operation"
ALTER COLUMN "operation_number" SET NOT NULL;
