
const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://postgres:Ammar1983hmlh##@localhost:5432/kingdom_of_bees?schema=public";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const res = await client.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_name = 'inspection_schedule' AND column_name = 'status'
    `);
    console.log('Status Column Info:', res.rows);

    const res2 = await client.query(`
        SELECT typname, oid FROM pg_type WHERE typname = 'schedule_status'
    `);
    console.log('Enum Info:', res2.rows);

    await client.end();
  } catch (err) {
    console.error(err);
  }
}

main();
