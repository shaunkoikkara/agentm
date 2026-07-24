const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendOtpEmail } = require('../services/email');

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /signup — Create unverified tenant + send OTP
router.post('/signup', async (req, res) => {
  try {
    const { email, password, business_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if tenant exists and is verified
    const existing = await pool.query('SELECT id, is_verified FROM tenants WHERE email = $1', [email]);
    if (existing.rows.length > 0 && existing.rows[0].is_verified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If unverified tenant exists, delete it (they're re-signing up)
    if (existing.rows.length > 0 && !existing.rows[0].is_verified) {
      await pool.query('DELETE FROM tenants WHERE id = $1', [existing.rows[0].id]);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert unverified tenant
    await pool.query(
      `INSERT INTO tenants (email, password_hash, business_name, is_verified) 
       VALUES ($1, $2, $3, false)`,
      [email, password_hash, business_name]
    );

    // Generate OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate any existing OTPs for this email
    await pool.query('UPDATE otp_codes SET is_used = true WHERE email = $1 AND is_used = false', [email]);

    // Save new OTP
    await pool.query(
      'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    // Send OTP email
    const sent = await sendOtpEmail(email, code);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    console.log(`OTP sent to ${email}`);
    res.status(201).json({ message: 'Verification code sent to your email', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /verify-otp — Verify OTP code and activate tenant
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Find valid OTP
    const otpResult = await pool.query(
      `SELECT * FROM otp_codes 
       WHERE email = $1 AND code = $2 AND is_used = false AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Mark OTP as used
    await pool.query('UPDATE otp_codes SET is_used = true WHERE id = $1', [otpResult.rows[0].id]);

    // Mark tenant as verified
    const tenantResult = await pool.query(
      'UPDATE tenants SET is_verified = true WHERE email = $1 RETURNING id, email, business_name',
      [email]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(400).json({ error: 'Account not found' });
    }

    const tenant = tenantResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: tenant.id, email: tenant.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Tenant verified: ${email}`);
    res.json({ token, tenant });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// POST /resend-otp — Resend OTP code
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check tenant exists and is not verified
    const tenant = await pool.query('SELECT id, is_verified FROM tenants WHERE email = $1', [email]);
    if (tenant.rows.length === 0) {
      return res.status(400).json({ error: 'Account not found' });
    }
    if (tenant.rows[0].is_verified) {
      return res.status(400).json({ error: 'Account already verified' });
    }

    // Rate limit: check last OTP was sent more than 60 seconds ago
    const lastOtp = await pool.query(
      `SELECT created_at FROM otp_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (lastOtp.rows.length > 0) {
      const secondsSinceLast = (Date.now() - new Date(lastOtp.rows[0].created_at).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        return res.status(429).json({ error: `Please wait ${Math.ceil(60 - secondsSinceLast)} seconds before requesting a new code` });
      }
    }

    // Invalidate old OTPs
    await pool.query('UPDATE otp_codes SET is_used = true WHERE email = $1 AND is_used = false', [email]);

    // Generate new OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    const sent = await sendOtpEmail(email, code);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    console.log(`OTP resent to ${email}`);
    res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login — Block unverified tenants
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT id, email, password_hash, is_verified FROM tenants WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tenant = result.rows[0];

    if (!tenant.is_verified) {
      return res.status(403).json({ error: 'Please verify your email first', needsVerification: true, email: tenant.email });
    }

    const isMatch = await bcrypt.compare(password, tenant.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: tenant.id, email: tenant.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Tenant logged in: ${email}`);
    res.json({ token, tenant: { id: tenant.id, email: tenant.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
