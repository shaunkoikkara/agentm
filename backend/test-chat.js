require('dotenv').config();
const readline = require('readline');
const pool = require('./src/config/database');
const aiService = require('./src/services/ai');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  console.log("\n🤖 Starting AI Chat Tester...");
  
  // 1. Fetch demo tenant
  const tenantRes = await pool.query("SELECT * FROM tenants WHERE email = 'demo@clinic.com'");
  if (tenantRes.rows.length === 0) {
    console.error("Demo tenant not found.");
    process.exit(1);
  }
  const tenant = tenantRes.rows[0];
  
  // 2. Fetch knowledge base
  const kbRes = await pool.query("SELECT * FROM knowledge_items WHERE tenant_id = $1 AND is_active = true", [tenant.id]);
  const knowledgeItems = kbRes.rows;

  // 3. Setup a mock contact and conversation for the dashboard
  const mockNumber = 'terminal_user_' + Date.now().toString().slice(-4);
  
  // Create contact
  const contactRes = await pool.query(
    `INSERT INTO contacts (tenant_id, whatsapp_number, name) 
     VALUES ($1, $2, $3) RETURNING id`,
    [tenant.id, mockNumber, 'Terminal Tester']
  );
  const contactId = contactRes.rows[0].id;

  // Create conversation
  const convRes = await pool.query(
    `INSERT INTO conversations (tenant_id, contact_id, status, is_human_takeover) 
     VALUES ($1, $2, 'active', false) RETURNING id`,
    [tenant.id, contactId]
  );
  const conversationId = convRes.rows[0].id;
  
  console.log(`✅ Loaded tenant: ${tenant.business_name}`);
  console.log(`✅ Loaded ${knowledgeItems.length} knowledge base items`);
  console.log(`✅ Created test conversation (ID: ${conversationId.split('-')[0]}...) so you can see it in the dashboard!`);
  console.log("--------------------------------------------------");
  console.log("Chat with the AI! (Type 'exit' to quit)\n");

  const conversationHistory = [];

  const askQuestion = () => {
    rl.question('You: ', async (message) => {
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        console.log("Bye!");
        await pool.end();
        process.exit(0);
      }

      try {
        // Save user message to DB
        await pool.query(
          `INSERT INTO messages (conversation_id, tenant_id, direction, content) VALUES ($1, $2, 'inbound', $3)`,
          [conversationId, tenant.id, message]
        );

        process.stdout.write('AI is thinking...');
        
        // Generate response using the exact same service the webhook uses
        const response = await aiService.generateResponse(tenant, knowledgeItems, conversationHistory, message);
        
        // Save AI response to DB
        await pool.query(
          `INSERT INTO messages (conversation_id, tenant_id, direction, content, message_type) VALUES ($1, $2, 'outbound', $3, 'text')`,
          [conversationId, tenant.id, response]
        );

        // Update conversation last activity
        await pool.query(
          `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, message_count = message_count + 2 WHERE id = $1`,
          [conversationId]
        );
        
        // Clear the "thinking..." line
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        
        // Print AI response in green
        console.log(`\x1b[32mAI (${tenant.receptionist_name}):\x1b[0m ${response}\n`);
        
        // Add to history so it remembers context for the next turn
        conversationHistory.push({ direction: 'inbound', content: message });
        conversationHistory.push({ direction: 'outbound', content: response });
        
      } catch (err) {
        console.error("\nError:", err.message);
      }
      
      askQuestion();
    });
  };

  askQuestion();
}

run();
