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
       waba_id, coexistence_enabled, is_active, created_at, updated_at
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
      waba_id, coexistence_enabled
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
        coexistence_enabled = COALESCE($14, coexistence_enabled),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING id, email, client_name, business_name, business_category, business_description, 
       address, phone, website, business_hours, receptionist_name, 
       receptionist_personality, system_prompt, whatsapp_phone_number_id, 
       waba_id, coexistence_enabled, is_active, created_at, updated_at`,
      [
        client_name, business_name, business_category, business_description, address, phone, 
        website, business_hours ? JSON.stringify(business_hours) : null, 
        receptionist_name, receptionist_personality, 
        system_prompt, whatsapp_phone_number_id, waba_id,
        coexistence_enabled,
        req.tenant.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tenant profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /whatsapp-connect (Manual credentials entry)
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
        coexistence_enabled = true,
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

// POST /embedded-signup (Meta Facebook Embedded Signup SDK Callback)
router.post('/embedded-signup', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Support the demo fallback if no code is provided but fake IDs are
    if (!code && req.body.waba_id && req.body.phone_number_id) {
      const result = await pool.query(
        `UPDATE tenants SET waba_id = $1, whatsapp_phone_number_id = $2, coexistence_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, business_name, whatsapp_phone_number_id, waba_id, coexistence_enabled`,
        [req.body.waba_id, req.body.phone_number_id, req.tenant.id]
      );
      return res.json({ message: 'Demo WhatsApp Account linked!', tenant: result.rows[0] });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log("Meta Embedded Signup Callback Received. Exchanging code...");

    // 1. Exchange Code for User Access Token
    const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&code=${code}`);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("Token Exchange Error:", tokenData.error);
      throw new Error("Failed to exchange code for token.");
    }
    const userAccessToken = tokenData.access_token;

    // 2. Debug Token to find WABA ID from granular scopes
    const debugRes = await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${userAccessToken}&access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`);
    const debugData = await debugRes.json();
    
    if (debugData.error || !debugData.data) {
      throw new Error("Failed to debug token.");
    }

    const scopes = debugData.data.granular_scopes || [];
    const wabaScope = scopes.find(s => s.scope === 'whatsapp_business_management');
    if (!wabaScope || !wabaScope.target_ids || wabaScope.target_ids.length === 0) {
      throw new Error("No WhatsApp Business Account found in permissions.");
    }
    const realWabaId = wabaScope.target_ids[0];

    // 3. Fetch Phone Number ID
    const phoneRes = await fetch(`https://graph.facebook.com/v21.0/${realWabaId}/phone_numbers?access_token=${userAccessToken}`);
    const phoneData = await phoneRes.json();
    
    if (phoneData.error || !phoneData.data || phoneData.data.length === 0) {
      throw new Error("No phone numbers found! You must check ALL permission boxes (including messaging) during the Meta login popup.");
    }
    const realPhoneNumberId = phoneData.data[0].id;

    console.log("Successfully extracted real IDs:", { waba_id: realWabaId, phone_number_id: realPhoneNumberId });

    // 3.5 Subscribe the App to the WABA's webhooks
    console.log("Subscribing App to WABA webhooks...");
    const subRes = await fetch(`https://graph.facebook.com/v21.0/${realWabaId}/subscribed_apps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAccessToken}`
      }
    });
    const subData = await subRes.json();
    console.log("WABA Subscription Result:", JSON.stringify(subData));
    
    if (!subRes.ok || !subData.success) {
      throw new Error(`Failed to subscribe app to WABA webhooks: ${JSON.stringify(subData)}`);
    }

    // 4. Save Meta credentials to database
    const result = await pool.query(
      `UPDATE tenants SET 
        waba_id = $1,
        whatsapp_phone_number_id = $2,
        coexistence_enabled = true,
        system_user_token = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, business_name, whatsapp_phone_number_id, waba_id, coexistence_enabled, system_user_token`,
      [realWabaId, realPhoneNumberId, userAccessToken, req.tenant.id]
    );

    res.json({
      message: 'WhatsApp Business Account linked securely!',
      tenant: result.rows[0]
    });
  } catch (error) {
    console.error('Embedded signup OAuth error:', error);
    res.status(500).json({ error: error.message || 'Failed to process Meta Embedded Signup callback' });
  }
});

module.exports = router;
