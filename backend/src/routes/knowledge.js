const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM knowledge_items WHERE tenant_id = $1 ORDER BY sort_order ASC, created_at DESC',
      [req.tenant.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get knowledge items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /
router.post('/', async (req, res) => {
  try {
    const { type, title, content, metadata, sort_order } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO knowledge_items (tenant_id, type, title, content, metadata, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.tenant.id, type || 'general', title, content, metadata ? JSON.stringify(metadata) : '{}', sort_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create knowledge item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, content, metadata, sort_order, is_active } = req.body;
    
    const check = await pool.query('SELECT id FROM knowledge_items WHERE id = $1 AND tenant_id = $2', [id, req.tenant.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge item not found' });
    }

    const result = await pool.query(
      `UPDATE knowledge_items SET
        type = COALESCE($1, type),
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        metadata = COALESCE($4, metadata),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND tenant_id = $8 RETURNING *`,
      [type, title, content, metadata ? JSON.stringify(metadata) : null, sort_order, is_active, id, req.tenant.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update knowledge item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM knowledge_items WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.tenant.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge item not found' });
    }
    
    res.json({ message: 'Knowledge item deleted successfully' });
  } catch (error) {
    console.error('Delete knowledge item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
