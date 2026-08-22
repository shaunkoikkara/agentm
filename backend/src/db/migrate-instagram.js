const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await c.connect();
  console.log('Connecting to database...');

  // Add Instagram fields to tenants table
  await c.query(`
    ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS instagram_account_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS instagram_access_token TEXT
  `);
  console.log('✅ Added instagram_account_id & instagram_access_token columns to tenants table');

  // Add channel column to conversations table
  await c.query(`
    ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'whatsapp'
  `);
  console.log('✅ Added channel column to conversations table');

  // Add channel column to messages table
  await c.query(`
    ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'whatsapp'
  `);
  console.log('✅ Added channel column to messages table');

  console.log('🎉 Instagram migration complete!');
  await c.end();
}

migrate().catch(console.error);
