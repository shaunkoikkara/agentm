const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, business_name, business_category, business_description, 
       address, phone, website, business_hours, receptionist_name, 
       receptionist_personality, system_prompt, whatsapp_phone_number_id, 
       whatsapp_waba_id, whatsapp_access_token, is_active, created_at, updated_at
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
      business_name, business_category, business_description,
      address, phone, website, business_hours, receptionist_name,
      receptionist_personality, system_prompt, whatsapp_phone_number_id,
      whatsapp_waba_id, whatsapp_access_token
    } = req.body;

    const result = await pool.query(
      `UPDATE tenants SET 
        business_name = COALESCE($1, business_name),
        business_category = COALESCE($2, business_category),
        business_description = COALESCE($3, business_description),
        address = COALESCE($4, address),
        phone = COALESCE($5, phone),
        website = COALESCE($6, website),
        business_hours = COALESCE($7, business_hours),
        receptionist_name = COALESCE($8, receptionist_name),
        receptionist_personality = COALESCE($9, receptionist_personality),
        system_prompt = COALESCE($10, system_prompt),
        whatsapp_phone_number_id = COALESCE($11, whatsapp_phone_number_id),
        whatsapp_waba_id = COALESCE($12, whatsapp_waba_id),
        whatsapp_access_token = COALESCE($13, whatsapp_access_token),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING id, email, business_name, business_category, business_description, 
       address, phone, website, business_hours, receptionist_name, 
       receptionist_personality, system_prompt, whatsapp_phone_number_id, 
       whatsapp_waba_id, whatsapp_access_token, is_active, created_at, updated_at`,
      [
        business_name, business_category, business_description, address, phone, 
        website, business_hours ? JSON.stringify(business_hours) : null, 
        receptionist_name, receptionist_personality, 
        system_prompt, whatsapp_phone_number_id, whatsapp_waba_id, 
        whatsapp_access_token, req.tenant.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
