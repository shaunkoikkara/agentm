require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function subscribeWaba() {
  try {
    const result = await pool.query('SELECT waba_id, business_name FROM tenants WHERE waba_id IS NOT NULL LIMIT 1');
    if (result.rows.length === 0) {
      console.log('No WABA ID found in DB.');
      process.exit(1);
    }
    
    const wabaId = result.rows[0].waba_id;
    console.log(`Checking subscriptions for WABA: ${wabaId} (${result.rows[0].business_name})`);

    const token = process.env.META_PERMANENT_SYSTEM_TOKEN;

    const getRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps?access_token=${token}`);
    const getData = await getRes.json();
    console.log('Current Subscriptions:', JSON.stringify(getData, null, 2));

    console.log('Subscribing app to WABA...');
    const postRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const postData = await postRes.json();
    console.log('Subscribe Result:', JSON.stringify(postData, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

subscribeWaba();
