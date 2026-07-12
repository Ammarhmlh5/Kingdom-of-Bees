
const { Client } = require('pg');

async function fixEnums() {
  const client = new Client({
    connectionString: "postgresql://postgres:Ammar1983hmlh%23%23@localhost:5432/kingdom_of_bees?schema=public"
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Checking for missing schedule_status enum...');
    const checkEnumRes = await client.query(`
        SELECT n.nspname as schema, t.typname as type
        FROM pg_type t
        LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE (t.typtype = 'e') AND t.typname = 'schedule_status'
    `);

    if (checkEnumRes.rows.length === 0) {
        console.log('Creating schedule_status enum...');
        await client.query(`CREATE TYPE "public"."schedule_status" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED', 'OVERDUE')`);
        console.log('✅ schedule_status created');
    } else {
        console.log('ℹ️ schedule_status already exists');
    }

    console.log('Checking inspection_schedule.status column type...');
    const colRes = await client.query(`
        SELECT data_type, udt_name
        FROM information_schema.columns
        WHERE table_name = 'inspection_schedule' AND column_name = 'status'
    `);

    if (colRes.rows.length > 0 && colRes.rows[0].udt_name !== 'schedule_status') {
        console.log('Converting status column to schedule_status enum...');

        // 1. Drop default
        await client.query('ALTER TABLE "inspection_schedule" ALTER COLUMN "status" DROP DEFAULT');

        // 2. Convert type
        await client.query(`
            ALTER TABLE "inspection_schedule"
            ALTER COLUMN "status" TYPE "public"."schedule_status"
            USING "status"::"public"."schedule_status"
        `);

        // 3. Set default again with proper casting
        await client.query('ALTER TABLE "inspection_schedule" ALTER COLUMN "status" SET DEFAULT \'PENDING\'::"public"."schedule_status"');

        console.log('✅ status column converted successfully');
    } else {
        console.log(`ℹ️ status column type is already correct: ${colRes.rows[0]?.udt_name}`);
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    if (client) await client.end();
  }
}

fixEnums();
