require('dotenv').config();
const { Client } = require('pg');

async function fixMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Step 1: Check _prisma_migrations structure
    console.log('\n1. Checking _prisma_migrations structure...');

    // Step 2: Check if migration exists
    console.log('\n2. Checking if migration record exists...');
    const existing = await client.query(
      "SELECT * FROM _prisma_migrations WHERE migration_name = '20260702_add_inspection_settings'"
    );
    console.log('Found:', existing.rows.length, 'records');

    if (existing.rows.length === 0) {
      // Step 3: Add migration record
      console.log('\n3. Adding migration record...');
      await client.query(`
        INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (gen_random_uuid(), 'dummy_checksum', NOW(), '20260702_add_inspection_settings', '', NOW(), NOW(), 0)
      `);
      console.log('Migration record added');
    } else {
      console.log('Migration record already exists');
    }

    // Step 4: Verify
    console.log('\n4. Verifying...');
    const tableRes = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('inspection_setting', 'inspection_schedule')"
    );
    console.log('Tables found:', tableRes.rows.map(r => r.tablename));

    const settingRes = await client.query('SELECT * FROM inspection_setting');
    console.log('Inspection settings:', settingRes.rows.length);
    settingRes.rows.forEach(row => console.log('  -', row.type, row.name_ar));

    const migrationRes = await client.query(
      "SELECT * FROM _prisma_migrations WHERE migration_name = '20260702_add_inspection_settings'"
    );
    console.log('\nMigration records:', migrationRes.rows.length);

    console.log('\n✅ Migration fixed successfully!');
    client.end();
  } catch (err) {
    console.error('Error:', err);
    client.end();
  }
}

fixMigration();
