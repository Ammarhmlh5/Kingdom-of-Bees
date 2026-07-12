
const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Ammar1983hmlh##',
    port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('Databases:', res.rows.map(r => r.datname));
    await client.end();
  } catch (err) {
    console.error(err);
    if (client) await client.end();
  }
}

main();
