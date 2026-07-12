import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding specific columns for Traceability...');

        // Add batch_id to honey_harvest if not exists
        await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'honey_harvest' AND column_name = 'batch_id') THEN
          ALTER TABLE "honey_harvest" ADD COLUMN "batch_id" UUID;
        END IF;
      END $$;
    `);

        // Add primary_apiary_id to honey_batch if not exists
        await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'honey_batch' AND column_name = 'primary_apiary_id') THEN
          ALTER TABLE "honey_batch" ADD COLUMN "primary_apiary_id" UUID;
        END IF;
      END $$;
    `);

        console.log('Columns added successfully.');
    } catch (e) {
        console.error('Error executing SQL:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
