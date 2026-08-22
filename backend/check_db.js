require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDb() {
  try {
    const res = await pool.query('SELECT direction, content, created_at FROM messages ORDER BY created_at DESC LIMIT 5');
    console.log("Recent Messages:");
    console.table(res.rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkDb();
