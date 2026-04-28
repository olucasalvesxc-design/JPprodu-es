const pool = require('../config/database');
const { calculatePrice } = require('../utils/priceCalculator');

async function getSettings() {
  const result = await pool.query('SELECT key, value FROM settings');
  const settings = {};
  result.rows.forEach(r => { settings[r.key] = r.value; });
  return settings;
}

async function calculateOrder(req, res) {
  const { text, extras = {} } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto é obrigatório' });

  try {
    const settings = await getSettings();
    const characters = text.length;
    const breakdown = calculatePrice(characters, extras, settings);
    res.json({ characters, breakdown });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao calcular preço' });
  }
}

async function createOrder(req, res) {
  const { voice_id, text, extras = {}, payment_method = 'stripe' } = req.body;
  const userId = req.user.id;

  if (!voice_id || !text) {
    return res.status(400).json({ error: 'Voz e texto são obrigatórios' });
  }

  try {
    const voice = await pool.query('SELECT id FROM voices WHERE id = $1 AND active = true', [voice_id]);
    if (voice.rows.length === 0) return res.status(404).json({ error: 'Voz não encontrada' });

    const settings = await getSettings();
    const characters = text.length;
    const breakdown = calculatePrice(characters, extras, settings);

    if (payment_method === 'credits') {
      const user = await pool.query('SELECT credits FROM users WHERE id = $1', [userId]);
      if (parseFloat(user.rows[0].credits) < breakdown.total) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }
    }

    const result = await pool.query(
      `INSERT INTO orders
         (user_id, voice_id, text, characters, base_price, extras_price, total_price, extras, payment_method, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        userId, voice_id, text, characters,
        breakdown.base, breakdown.extrasTotal, breakdown.total,
        JSON.stringify(extras), payment_method,
        payment_method === 'credits' ? 'paid' : 'pending',
      ]
    );

    const order = result.rows[0];

    if (payment_method === 'credits') {
      await pool.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [breakdown.total, userId]);
      await pool.query(
        `INSERT INTO transactions (user_id, order_id, amount, type, description)
         VALUES ($1,$2,$3,'credit_use','Pagamento via créditos')`,
        [userId, order.id, breakdown.total]
      );
    }

    res.status(201).json({ order, breakdown });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
}

async function getUserOrders(req, res) {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT o.*, v.name as voice_name, v.audio_url as voice_demo_url
      FROM orders o
      LEFT JOIN voices v ON o.voice_id = v.id
      WHERE o.user_id = $1
    `;
    const params = [userId];
    if (status) {
      query += ` AND o.status = $${params.length + 1}`;
      params.push(status);
    }
    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const count = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE user_id = $1${status ? ' AND status = $2' : ''}`,
      status ? [userId, status] : [userId]
    );

    res.json({
      orders: result.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(count.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
}

async function getOrderById(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT o.*, v.name as voice_name, v.audio_url as voice_demo_url
       FROM orders o LEFT JOIN voices v ON o.voice_id = v.id
       WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')`,
      [id, userId, req.user.role]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
}

module.exports = { calculateOrder, createOrder, getUserOrders, getOrderById };
