
const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://postgres:Ammar1983hmlh##@localhost:5432/kingdom_of_bees?schema=public";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const res = await client.query("SELECT 'PENDING'::public.schedule_status");
    console.log('Cast Success:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Cast Failed:', err.message);
    if (client) await client.end();
  }
}

main();
