const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const whatsappService = require('../services/whatsapp');

router.use(authMiddleware);

// GET /stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    // Run all stat queries in parallel
    const [convCount, contactCount, activeCount, todayMsgCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM conversations WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM contacts WHERE tenant_id = $1', [tenantId]),
      pool.query("SELECT COUNT(*) FROM conversations WHERE tenant_id = $1 AND status = 'active'", [tenantId]),
      pool.query(
        "SELECT COUNT(*) FROM messages WHERE tenant_id = $1 AND created_at >= CURRENT_DATE",
        [tenantId]
      )
    ]);

    res.json({
      totalConversations: parseInt(convCount.rows[0].count),
      totalContacts: parseInt(contactCount.rows[0].count),
      activeConversations: parseInt(activeCount.rows[0].count),
      messagesToday: parseInt(todayMsgCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT c.*, ct.whatsapp_number, ct.name as contact_name 
       FROM conversations c
       JOIN contacts ct ON c.contact_id = ct.id
       WHERE c.tenant_id = $1
       ORDER BY c.last_message_at DESC
       LIMIT $2 OFFSET $3`,
      [req.tenant.id, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM conversations WHERE tenant_id = $1', [req.tenant.id]);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const convResult = await pool.query(
      `SELECT c.*, ct.whatsapp_number, ct.name as contact_name 
       FROM conversations c
       JOIN contacts ct ON c.contact_id = ct.id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [id, req.tenant.id]
    );
    
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const msgResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    
    res.json({
      ...convResult.rows[0],
      messages: msgResult.rows
    });
  } catch (error) {
    console.error('Get conversation details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:id/takeover
router.post('/:id/takeover', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE conversations SET is_human_takeover = true WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, req.tenant.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ message: 'Human takeover enabled', conversation: result.rows[0] });
  } catch (error) {
    console.error('Takeover error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:id/release
router.post('/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE conversations SET is_human_takeover = false WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, req.tenant.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ message: 'Human takeover released, AI is back in control', conversation: result.rows[0] });
  } catch (error) {
    console.error('Release error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:id/messages
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Get conversation and tenant details
    const convResult = await pool.query(
      `SELECT c.*, ct.whatsapp_number, t.whatsapp_phone_number_id, t.whatsapp_access_token 
       FROM conversations c
       JOIN contacts ct ON c.contact_id = ct.id
       JOIN tenants t ON c.tenant_id = t.id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [id, req.tenant.id]
    );
    
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const conv = convResult.rows[0];
    
    if (!conv.whatsapp_phone_number_id || !conv.whatsapp_access_token) {
      return res.status(400).json({ error: 'WhatsApp is not configured for this tenant' });
    }
    
    // Send via WhatsApp
    await whatsappService.sendTextMessage(
      conv.whatsapp_phone_number_id,
      conv.whatsapp_number,
      content,
      conv.whatsapp_access_token
    );
    
    // Save outbound message
    const msgResult = await pool.query(
      `INSERT INTO messages (conversation_id, tenant_id, direction, content) 
       VALUES ($1, $2, 'outbound', $3) RETURNING *`,
      [id, req.tenant.id, content]
    );
    
    // Update last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, message_count = message_count + 1 WHERE id = $1',
      [id]
    );
    
    res.status(201).json(msgResult.rows[0]);
  } catch (error) {
    console.error('Send manual message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
