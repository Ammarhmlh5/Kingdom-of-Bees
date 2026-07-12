-- AlterTable: Add unique constraint to Apiary.name
ALTER TABLE "apiary" ADD CONSTRAINT "apiary_name_key" UNIQUE ("name");

-- AlterTable: Add unique constraint to Hive.name (per apiary)
ALTER TABLE "hive" ADD CONSTRAINT "hive_apiary_id_name_key" UNIQUE ("apiary_id", "name");

-- AlterTable: Add unique constraint to Queen.queenNumber
ALTER TABLE "queen" ADD CONSTRAINT "queen_queen_number_key" UNIQUE ("queen_number");
