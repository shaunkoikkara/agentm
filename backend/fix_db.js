require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDb() {
  try {
    const res = await pool.query(`
      UPDATE tenants 
      SET whatsapp_phone_number_id = '1244748925386918' 
      WHERE waba_id = '1043575618030648' 
      RETURNING *
    `);
    console.log("Fixed DB Row:", res.rows[0]);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fixDb();
