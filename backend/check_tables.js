require('dotenv').config();
const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );

    console.log('Tables in database:');
    res.rows.forEach(row => console.log('  -', row.tablename));

    // Check for _prisma_migrations
    const hasPrismaMigrations = res.rows.some(r => r.tablename === '_prisma_migrations');
    console.log('\n_prisma_migrations exists:', hasPrismaMigrations);

    if (hasPrismaMigrations) {
      const migrationRes = await client.query(
        "SELECT * FROM _prisma_migrations ORDER BY migration_name"
      );
      console.log('\nMigrations recorded:');
      migrationRes.rows.forEach(row => console.log('  -', row.migration_name));
      
      // Check for 20260702_add_inspection_settings
      const found = migrationRes.rows.find(r => r.migration_name === '20260702_add_inspection_settings');
      console.log('\n20260702_add_inspection_settings found:', !!found);
    }

    // Check for inspection_setting and inspection_schedule
    const hasInspectionSetting = res.rows.some(r => r.tablename === 'inspection_setting');
    const hasInspectionSchedule = res.rows.some(r => r.tablename === 'inspection_schedule');

    console.log('\ninspection_setting exists:', hasInspectionSetting);
    console.log('inspection_schedule exists:', hasInspectionSchedule);

    client.end();
  } catch (err) {
    console.error('Error:', err);
    client.end();
  }
}

checkTables();
