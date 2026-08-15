const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await c.connect();
  console.log('Connecting to database...');

  // Add coexistence and OAuth columns to tenants table
  await c.query(`
    ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS coexistence_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS fb_user_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS system_user_token TEXT
  `);
  console.log('✅ Added coexistence_enabled, fb_user_id, system_user_token columns to tenants table');

  console.log('🎉 Migration complete!');
  await c.end();
}

migrate().catch(console.error);
