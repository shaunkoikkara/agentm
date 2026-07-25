const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await c.connect();
  console.log('Connected to database...');

  // Add is_verified column to tenants
  await c.query(`
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false
  `);
  console.log('✅ Added is_verified column to tenants');

  // Create otp_codes table
  await c.query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      is_used BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Created otp_codes table');

  // Mark existing demo tenant as verified
  await c.query("UPDATE tenants SET is_verified = true WHERE email = 'demo@clinic.com'");
  console.log('✅ Marked demo tenant as verified');

  console.log('🎉 Migration complete!');
  await c.end();
}

migrate().catch(console.error);
