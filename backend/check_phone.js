require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkPhone() {
  try {
    const result = await pool.query('SELECT whatsapp_phone_number_id FROM tenants WHERE whatsapp_phone_number_id IS NOT NULL LIMIT 1');
    if (result.rows.length === 0) {
      console.log('No Phone Number ID found in DB.');
      process.exit(1);
    }
    
    const phoneId = result.rows[0].whatsapp_phone_number_id;
    const token = process.env.META_PERMANENT_SYSTEM_TOKEN;

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}?access_token=${token}`);
    const data = await res.json();
    console.log('Phone Number Status:', JSON.stringify(data, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPhone();
