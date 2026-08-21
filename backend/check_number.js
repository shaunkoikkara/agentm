require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkNumber() {
  try {
    const result = await pool.query('SELECT whatsapp_phone_number_id, email FROM tenants WHERE whatsapp_phone_number_id IS NOT NULL ORDER BY updated_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      console.log('No WhatsApp phone number ID found in database.');
      process.exit(0);
    }

    const { whatsapp_phone_number_id, email } = result.rows[0];
    console.log(`Found connected phone number ID: ${whatsapp_phone_number_id} for tenant ${email}`);
    
    // Fetch display phone number from Meta
    const token = process.env.META_PERMANENT_SYSTEM_TOKEN;
    const response = await fetch(`https://graph.facebook.com/v21.0/${whatsapp_phone_number_id}?access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Error fetching phone number from Meta:', data.error);
    } else {
      console.log('====================================');
      console.log(`✅ EXACT PHONE NUMBER TO TEXT: +${data.display_phone_number}`);
      console.log('====================================');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkNumber();
