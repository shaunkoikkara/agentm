require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const knowledgeRoutes = require('./routes/knowledge');
const conversationRoutes = require('./routes/conversations');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'] : '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/webhooks/whatsapp', webhookRoutes);

// Privacy Policy (required by Meta)
app.get('/privacy', (req, res) => {
  res.send(`<html><head><title>Privacy Policy - AI Receptionist</title></head><body>
    <h1>Privacy Policy</h1>
    <p>Last updated: July 2026</p>
    <p>AI Receptionist ("we", "us") operates a WhatsApp-based AI receptionist service.</p>
    <h2>Information We Collect</h2>
    <p>We collect WhatsApp phone numbers and message content solely to provide automated customer service responses on behalf of our business clients.</p>
    <h2>How We Use Information</h2>
    <p>Information is used only to respond to customer inquiries. We do not sell or share personal data with third parties.</p>
    <h2>Data Retention</h2>
    <p>Conversation data is retained for service improvement and can be deleted upon request.</p>
    <h2>Contact</h2>
    <p>For questions about this policy, contact us through our platform.</p>
  </body></html>`);
});

// Data Deletion Instructions (required by Meta for Live Mode)
app.get('/data-deletion-instructions', (req, res) => {
  res.send(`<html><head><title>Data Deletion Instructions</title></head><body>
    <h1>Data Deletion Instructions</h1>
    <p>To request the deletion of data processed by this application, please email your account request to our support inbox.</p>
  </body></html>`);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`AI Receptionist Backend is running on port ${PORT}`);
});
