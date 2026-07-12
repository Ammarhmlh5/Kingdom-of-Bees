
const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://postgres:Ammar1983hmlh%23%23@localhost:5432/kingdom_of_bees?schema=public";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const enumsToEnsure = [
        { name: 'schedule_status', values: ['PENDING', 'COMPLETED', 'SKIPPED', 'OVERDUE'] },
        { name: 'user_type', values: ['ADMIN', 'EXPLORER', 'OWNER', 'WORKER'] },
        { name: 'member_role', values: ['OWNER', 'WORKER', 'VIEWER'] },
        { name: 'membership_status', values: ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'] },
        { name: 'apiary_type', values: ['STATIONARY', 'MIGRATORY', 'RESEARCH', 'TREATMENT'] },
        { name: 'inspection_type', values: ['ROUTINE', 'DETAILED', 'QUICK_CHECK', 'DISEASE_CHECK', 'QUEEN_CHECK'] },
        { name: 'overall_assessment', values: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] }
    ];

    for (const enm of enumsToEnsure) {
        const checkRes = await client.query(`
            SELECT n.nspname as schema, t.typname as type
            FROM pg_type t
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE (t.typtype = 'e') AND t.typname = $1
        `, [enm.name]);

        if (checkRes.rows.length === 0) {
            console.log(`Creating enum ${enm.name}...`);
            const valuesStr = enm.values.map(v => `'${v}'`).join(', ');
            await client.query(`CREATE TYPE "public"."${enm.name}" AS ENUM (${valuesStr})`);
            console.log(`✅ Enum ${enm.name} created.`);
        } else {
            console.log(`ℹ️ Enum ${enm.name} found in schema: ${checkRes.rows[0].schema}`);
        }
    }

    console.log('Checking tables...');
    const tables = ['inspection_schedule', 'inspection_setting', 'inspection'];

    for (const tableName of tables) {
        const tableCheck = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = $1", [tableName]);
        if (tableCheck.rows.length === 0) {
            console.log(`⚠️ Table ${tableName} does not exist!`);
            continue;
        }
        console.log(`Checking columns for ${tableName}...`);

        if (tableName === 'inspection_schedule') {
             const columns = [
                { name: 'apiary_id', type: 'UUID' },
                { name: 'skipped', type: 'BOOLEAN', default: 'false' },
                { name: 'skip_reason', type: 'TEXT' },
                { name: 'inspection_id', type: 'UUID' }
            ];
            for (const col of columns) {
                const colCheck = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2", [tableName, col.name]);
                if (colCheck.rows.length === 0) {
                    console.log(`Adding ${col.name} to ${tableName}...`);
                    await client.query(`ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.type} ${col.default ? 'DEFAULT ' + col.default : ''}`);
                }
            }

            // Ensure status is enum
            const statusCol = await client.query("SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = 'status'", [tableName]);
            if (statusCol.rows.length > 0 && statusCol.rows[0].udt_name !== 'schedule_status') {
                console.log(`Converting ${tableName}.status to enum...`);
                await client.query(`ALTER TABLE "${tableName}" ALTER COLUMN "status" DROP DEFAULT`);
                await client.query(`ALTER TABLE "${tableName}" ALTER COLUMN "status" TYPE "public"."schedule_status" USING "status"::"public"."schedule_status"`);
                await client.query(`ALTER TABLE "${tableName}" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."schedule_status"`);
            }
        }
    }

    console.log('🏁 DB Fix Complete');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err);
    if (client) await client.end();
  }
}

main();
