const pool = require('../config/database');

async function getBalance(req, res) {
  try {
    const result = await pool.query('SELECT credits FROM users WHERE id = $1', [req.user.id]);
    res.json({ credits: result.rows[0].credits });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
}

async function getTransactions(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT t.*, o.voice_id
       FROM transactions t
       LEFT JOIN orders o ON t.order_id = o.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    const count = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
      [req.user.id]
    );
    res.json({
      transactions: result.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
}

module.exports = { getBalance, getTransactions };
