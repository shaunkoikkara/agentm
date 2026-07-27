const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const aiService = require('../services/ai');
const whatsappService = require('../services/whatsapp');
require('dotenv').config();

// GET / - Webhook verification
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifiedChallenge = whatsappService.verifyWebhook(mode, token, challenge);
  
  if (verifiedChallenge) {
    console.log('Webhook verified');
    res.status(200).send(verifiedChallenge);
  } else {
    res.sendStatus(403);
  }
});

// POST / - Receive WhatsApp message
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    
    console.log("🔥 WEBHOOK HIT SUCCESSFUL! Raw data payload received from Meta:", JSON.stringify(req.body, null, 2));
    
    console.log('📩 Webhook POST received:', JSON.stringify(body, null, 2));
    
    if (body.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp event, ignoring. Object:', body.object);
      return res.sendStatus(404);
    }
    
    // Acknowledge receipt quickly to WhatsApp
    res.status(200).send('EVENT_RECEIVED');
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    
    if (!messages || messages.length === 0) {
      console.log('⚠️ Not a message event, it might be a status update (delivered/read). Skipping.');
      return;
    }
    
    const phoneNumberId = value.metadata.phone_number_id;
    const message = messages[0];
    const customerNumber = message.from;
    const messageBody = message.text?.body;
    const whatsappMessageId = message.id;
    
    if (!messageBody) {
      console.log('⚠️ Received non-text message, ignoring for now');
      return;
    }
    
    console.log(`✅ Message parsed! From: ${customerNumber}, To ID: ${phoneNumberId}, Text: ${messageBody}`);
    
    // 2. Find tenant by whatsapp_phone_number_id
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE whatsapp_phone_number_id = $1 AND is_active = true',
      [phoneNumberId]
    );
    
    if (tenantResult.rows.length === 0) {
      console.log(`⚠️ UNMAPPED LIVE WEBHOOK RECEIVED FROM ID: ${phoneNumberId}`);
      console.log(`❌ No active tenant found in database matching this phone_number_id.`);
      return;
    }
    
    const tenant = tenantResult.rows[0];
    console.log(`✅ Tenant matched: ${tenant.business_name}`);
    
    // 3. Find or create contact
    let contactId;
    const contactResult = await pool.query(
      'SELECT id FROM contacts WHERE tenant_id = $1 AND whatsapp_number = $2',
      [tenant.id, customerNumber]
    );
    
    if (contactResult.rows.length > 0) {
      contactId = contactResult.rows[0].id;
    } else {
      const newContact = await pool.query(
        'INSERT INTO contacts (tenant_id, whatsapp_number, name) VALUES ($1, $2, $3) RETURNING id',
        [tenant.id, customerNumber, value.contacts?.[0]?.profile?.name || 'Unknown']
      );
      contactId = newContact.rows[0].id;
    }
    
    // 4. Find or create active conversation
    let conversationId;
    let isHumanTakeover = false;
    
    const convResult = await pool.query(
      `SELECT id, is_human_takeover FROM conversations 
       WHERE tenant_id = $1 AND contact_id = $2 AND status = 'active'
       ORDER BY last_message_at DESC LIMIT 1`,
      [tenant.id, contactId]
    );
    
    if (convResult.rows.length > 0) {
      conversationId = convResult.rows[0].id;
      isHumanTakeover = convResult.rows[0].is_human_takeover;
      
      // Update last_message_at
      await pool.query(
        'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, message_count = message_count + 1 WHERE id = $1',
        [conversationId]
      );
    } else {
      const newConv = await pool.query(
        'INSERT INTO conversations (tenant_id, contact_id, message_count) VALUES ($1, $2, 1) RETURNING id',
        [tenant.id, contactId]
      );
      conversationId = newConv.rows[0].id;
    }
    
    // 5. Save inbound message
    await pool.query(
      `INSERT INTO messages (conversation_id, tenant_id, direction, content, whatsapp_message_id) 
       VALUES ($1, $2, 'inbound', $3, $4)`,
      [conversationId, tenant.id, messageBody, whatsappMessageId]
    );
    
    // 6. If conversation is in human_takeover mode, skip AI response
    if (isHumanTakeover) {
      console.log(`Conversation ${conversationId} is in human takeover mode. Skipping AI.`);
      return;
    }
    
    // 7. Generate AI response
    // Fetch knowledge items and conversation history
    const knowledgeResult = await pool.query(
      'SELECT * FROM knowledge_items WHERE tenant_id = $1 AND is_active = true ORDER BY sort_order',
      [tenant.id]
    );
    
    const historyResult = await pool.query(
      `SELECT direction, content FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC LIMIT 20`,
      [conversationId]
    );
    
    const aiResponseText = await aiService.generateResponse(
      tenant,
      knowledgeResult.rows,
      historyResult.rows,
      messageBody
    );
    
    if (!aiResponseText) {
      console.error('Failed to generate AI response');
      return;
    }
    
    // 8. Save outbound message
    await pool.query(
      `INSERT INTO messages (conversation_id, tenant_id, direction, content) 
       VALUES ($1, $2, 'outbound', $3)`,
      [conversationId, tenant.id, aiResponseText]
    );
    
    // 9. Send via WhatsApp API
    await whatsappService.sendTextMessage(
      phoneNumberId,
      customerNumber,
      aiResponseText
    );
    
    console.log(`Successfully processed and replied to message from ${customerNumber}`);
  } catch (error) {
    console.error('Webhook error:', error);
    // Already sent 200 OK or 404
  }
});

module.exports = router;
