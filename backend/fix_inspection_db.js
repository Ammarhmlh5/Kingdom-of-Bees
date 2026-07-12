
const { Client } = require('pg');

async function fixDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Adding missing columns to inspection_setting...');
    try {
      await client.query('ALTER TABLE "inspection_setting" ADD COLUMN IF NOT EXISTS "name_en" TEXT DEFAULT \'\'');
      await client.query('ALTER TABLE "inspection_setting" ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN DEFAULT false');
      console.log('✅ inspection_setting updated');
    } catch (e) {
      console.error('❌ Failed to update inspection_setting:', e.message);
    }

    console.log('Adding missing columns to inspection_schedule...');
    try {
      await client.query('ALTER TABLE "inspection_schedule" ADD COLUMN IF NOT EXISTS "apiary_id" UUID');
      await client.query('ALTER TABLE "inspection_schedule" ADD COLUMN IF NOT EXISTS "skipped" BOOLEAN DEFAULT false');
      await client.query('ALTER TABLE "inspection_schedule" ADD COLUMN IF NOT EXISTS "skip_reason" TEXT');
      await client.query('ALTER TABLE "inspection_schedule" ADD COLUMN IF NOT EXISTS "inspection_id" UUID');

      // Try to change type of scheduled_date to DATE to match Prisma schema @db.Date
      // But let's first check what's there
      const res = await client.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'inspection_schedule' AND column_name = 'scheduled_date'");
      if (res.rows.length > 0 && res.rows[0].data_type !== 'date') {
          console.log(`Changing scheduled_date from ${res.rows[0].data_type} to DATE...`);
          await client.query('ALTER TABLE "inspection_schedule" ALTER COLUMN "scheduled_date" TYPE DATE');
      }

      console.log('✅ inspection_schedule updated');
    } catch (e) {
      console.error('❌ Failed to update inspection_schedule:', e.message);
    }

    // Try to populate apiary_id from hive relation if possible
    console.log('Populating apiary_id in inspection_schedule...');
    try {
      await client.query(`
        UPDATE "inspection_schedule" s
        SET "apiary_id" = h."apiary_id"
        FROM "hive" h
        WHERE s."hive_id" = h."id" AND s."apiary_id" IS NULL
      `);
      console.log('✅ apiary_id populated');
    } catch (e) {
      console.warn('⚠️ Could not populate apiary_id:', e.message);
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    if (client) await client.end();
  }
}

fixDb();
