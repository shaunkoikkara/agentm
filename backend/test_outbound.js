require('dotenv').config();
const { sendTextMessage } = require('./src/services/whatsapp');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testOutbound() {
  try {
    const result = await pool.query('SELECT whatsapp_phone_number_id FROM tenants WHERE whatsapp_phone_number_id IS NOT NULL LIMIT 1');
    if (result.rows.length === 0) {
      console.log('No Phone Number ID found in DB.');
      process.exit(1);
    }
    
    const phoneNumberId = '1244748925386918';
    const to = '919562438602';
    const text = 'Hello from the API! This is a test outbound message to verify Cloud API connectivity.';

    console.log(`Sending message from ${phoneNumberId} to ${to}...`);
    
    const response = await sendTextMessage(phoneNumberId, to, text);
    console.log('Response:', response);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testOutbound();
