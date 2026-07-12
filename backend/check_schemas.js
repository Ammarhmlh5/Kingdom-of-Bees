
const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://postgres:Ammar1983hmlh##@localhost:5432/kingdom_of_bees?schema=public";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const res = await client.query('SELECT schema_name FROM information_schema.schemata');
    console.log('Schemas:', res.rows.map(r => r.schema_name));

    const res2 = await client.query("SELECT n.nspname, t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'schedule_status'");
    console.log('Type locations:', res2.rows);

    await client.end();
  } catch (err) {
    console.error(err);
  }
}

main();
