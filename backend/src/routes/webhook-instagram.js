const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const aiService = require('../services/ai');
const instagramService = require('../services/instagram');
require('dotenv').config();

// GET /api/webhook/instagram - Instagram Webhook Verification
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ai_receptionist_verify_token_123';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ Instagram Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Instagram Webhook verification failed');
    res.sendStatus(403);
  }
});

// POST /api/webhook/instagram - Receive Instagram DMs
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    console.log('📸 INSTAGRAM WEBHOOK PAYLOAD RECEIVED:', JSON.stringify(body, null, 2));

    if (body.object !== 'instagram' && body.object !== 'page') {
      return res.sendStatus(404);
    }

    // Acknowledge event to Meta quickly
    res.status(200).send('EVENT_RECEIVED');

    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging || !messaging.message) {
      console.log('⚠️ Not a message event. Skipping.');
      return;
    }

    const senderId = messaging.sender.id;
    const recipientId = messaging.recipient.id; // Instagram Business Account ID
    const messageText = messaging.message.text;

    if (!messageText) {
      console.log('⚠️ Non-text Instagram DM received, skipping');
      return;
    }

    console.log(`✅ Instagram DM parsed! From User ID: ${senderId}, To IG Account ID: ${recipientId}, Text: "${messageText}"`);

    // 1. Find tenant by instagram_account_id (or fallback to active demo tenant)
    let tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE instagram_account_id = $1 AND is_active = true',
      [recipientId]
    );

    if (tenantResult.rows.length === 0) {
      // Fallback to primary tenant for testing
      tenantResult = await pool.query('SELECT * FROM tenants WHERE is_active = true ORDER BY created_at ASC LIMIT 1');
    }

    if (tenantResult.rows.length === 0) {
      console.log('❌ No active tenant found for Instagram DM');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`✅ Tenant matched for Instagram DM: ${tenant.business_name}`);

    // 2. Find or create contact
    let contactId;
    const contactResult = await pool.query(
      'SELECT id FROM contacts WHERE tenant_id = $1 AND whatsapp_number = $2',
      [tenant.id, `ig_${senderId}`]
    );

    if (contactResult.rows.length > 0) {
      contactId = contactResult.rows[0].id;
    } else {
      const newContact = await pool.query(
        'INSERT INTO contacts (tenant_id, whatsapp_number, name) VALUES ($1, $2, $3) RETURNING id',
        [tenant.id, `ig_${senderId}`, `Instagram User (${senderId.slice(-4)})`]
      );
      contactId = newContact.rows[0].id;
    }

    // 3. Find or create active conversation for Instagram channel
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
      await pool.query(
        "UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, message_count = message_count + 1, channel = 'instagram' WHERE id = $1",
        [conversationId]
      );
    } else {
      const newConv = await pool.query(
        "INSERT INTO conversations (tenant_id, contact_id, message_count, channel) VALUES ($1, $2, 1, 'instagram') RETURNING id",
        [tenant.id, contactId]
      );
      conversationId = newConv.rows[0].id;
    }

    // 4. Save inbound Instagram message
    await pool.query(
      `INSERT INTO messages (conversation_id, tenant_id, direction, content, channel) 
       VALUES ($1, $2, 'inbound', $3, 'instagram')`,
      [conversationId, tenant.id, messageText]
    );

    // 5. Check human takeover mode
    if (isHumanTakeover) {
      console.log(`Instagram conversation ${conversationId} is in human takeover mode. Skipping AI.`);
      return;
    }

    // 6. Generate Gemini AI Response using tenant FAQs
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

    const aiReplyText = await aiService.generateResponse(
      tenant,
      knowledgeResult.rows,
      historyResult.rows,
      messageText
    );

    if (!aiReplyText) {
      console.error('Failed to generate AI response for Instagram DM');
      return;
    }

    // 7. Save outbound message
    await pool.query(
      `INSERT INTO messages (conversation_id, tenant_id, direction, content, channel) 
       VALUES ($1, $2, 'outbound', $3, 'instagram')`,
      [conversationId, tenant.id, aiReplyText]
    );

    // 8. Send reply via Instagram Messaging API
    await instagramService.sendInstagramMessage(
      senderId,
      aiReplyText,
      tenant.instagram_access_token
    );

    console.log(`🎉 Successfully processed and replied to Instagram DM from ${senderId}`);
  } catch (error) {
    console.error('Error handling Instagram webhook:', error);
  }
});

module.exports = router;
