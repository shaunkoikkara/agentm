const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, business_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if tenant exists
    const existing = await pool.query('SELECT id FROM tenants WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert tenant
    const result = await pool.query(
      `INSERT INTO tenants (email, password_hash, business_name) 
       VALUES ($1, $2, $3) RETURNING id, email, business_name`,
      [email, password_hash, business_name]
    );

    const tenant = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: tenant.id, email: tenant.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`New tenant signed up: ${email}`);
    res.status(201).json({ token, tenant });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT id, email, password_hash FROM tenants WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tenant = result.rows[0];
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
