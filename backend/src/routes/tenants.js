const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, client_name, business_name, business_category, business_description, 
       address, phone, website, business_hours, receptionist_name, 
       receptionist_personality, system_prompt, whatsapp_phone_number_id, 
       waba_id, is_active, created_at, updated_at
       FROM tenants WHERE id = $1`,
      [req.tenant.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tenant profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /me
router.put('/me', async (req, res) => {
  try {
    const {
      client_name, business_name, business_category, business_description,
      address, phone, website, business_hours, receptionist_name,
      receptionist_personality, system_prompt, whatsapp_phone_number_id,
      waba_id
    } = req.body;

    const result = await pool.query(
      `UPDATE tenants SET 
        client_name = COALESCE($1, client_name),
        business_name = COALESCE($2, business_name),
        business_category = COALESCE($3, business_category),
        business_description = COALESCE($4, business_description),
        address = COALESCE($5, address),
        phone = COALESCE($6, phone),
        website = COALESCE($7, website),
        business_hours = COALESCE($8, business_hours),
        receptionist_name = COALESCE($9, receptionist_name),
        receptionist_personality = COALESCE($10, receptionist_personality),
        system_prompt = COALESCE($11, system_prompt),
        whatsapp_phone_number_id = COALESCE($12, whatsapp_phone_number_id),
        waba_id = COALESCE($13, waba_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING id, email, client_name, business_name, business_category, business_description, 
       address, phone, website, business_hours, receptionist_name, 
       receptionist_personality, system_prompt, whatsapp_phone_number_id, 
       waba_id, is_active, created_at, updated_at`,
      [
        client_name, business_name, business_category, business_description, address, phone, 
        website, business_hours ? JSON.stringify(business_hours) : null, 
        receptionist_name, receptionist_personality, 
        system_prompt, whatsapp_phone_number_id, waba_id, 
        req.tenant.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /whatsapp-connect
router.post('/whatsapp-connect', async (req, res) => {
  try {
    const { client_name, whatsapp_phone_number_id, waba_id } = req.body;
    
    if (!whatsapp_phone_number_id) {
      return res.status(400).json({ error: 'WhatsApp Phone Number ID is required' });
    }

    console.log("Configuring Manual WhatsApp Account:", { client_name, whatsapp_phone_number_id, waba_id });

    const result = await pool.query(
      `UPDATE tenants SET 
        client_name = COALESCE($1, client_name),
        whatsapp_phone_number_id = $2,
        waba_id = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [client_name, whatsapp_phone_number_id, waba_id, req.tenant.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('WhatsApp connect error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
