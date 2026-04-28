const pool = require('../config/database');

async function getSettings(req, res) {
  try {
    const result = await pool.query('SELECT key, value, description FROM settings ORDER BY key');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
}

async function getPublicSettings(req, res) {
  try {
    const result = await pool.query(
      `SELECT key, value FROM settings
       WHERE key IN ('price_base','price_chars_base','extra_soundtrack','extra_urgency','extra_revision','min_price')`
    );
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
}

async function updateSettings(req, res) {
  const updates = req.body; // { key: value, ... }
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Body inválido' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, String(value)]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings, message: 'Configurações atualizadas' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
}

module.exports = { getSettings, getPublicSettings, updateSettings };
