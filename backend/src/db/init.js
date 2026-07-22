const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log("Connecting to Supabase PostgreSQL database...");
  const dbClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await dbClient.connect();
    console.log("Connected successfully!");

    console.log("Applying database schema...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await dbClient.query(schemaSql);
    console.log("✅ Schema created successfully.");

    console.log("Applying demo seed data...");
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await dbClient.query(seedSql);
    console.log("✅ Seed data inserted successfully.");

    console.log("🎉 Database initialization complete!");
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
  } finally {
    await dbClient.end();
  }
}

initDb();
