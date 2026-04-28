const pool = require('../config/database');
const { cloudinary } = require('../config/cloudinary');

async function getDashboard(req, res) {
  try {
    const [revenue, ordersToday, activeUsers, recentOrders, statusBreakdown] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_price),0) as total FROM orders WHERE status != 'cancelled' AND status != 'pending'`),
      pool.query(`SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE`),
      pool.query(`SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'`),
      pool.query(`
        SELECT o.id, o.status, o.total_price, o.created_at, u.name as user_name, v.name as voice_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN voices v ON o.voice_id = v.id
        ORDER BY o.created_at DESC LIMIT 10
      `),
      pool.query(`SELECT status, COUNT(*) FROM orders GROUP BY status`),
    ]);

    res.json({
      revenue: parseFloat(revenue.rows[0].total),
      ordersToday: parseInt(ordersToday.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      recentOrders: recentOrders.rows,
      statusBreakdown: statusBreakdown.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
}

async function getAllOrders(req, res) {
  const { status, page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let params = [];
    let where = [];

    if (status) {
      params.push(status);
      where.push(`o.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const query = `
      SELECT o.*, u.name as user_name, u.email as user_email, v.name as voice_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN voices v ON o.voice_id = v.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    const countParams = where.length > 0 ? params.slice(0, -2) : [];
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      countParams
    );

    res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['pending', 'paid', 'producing', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
}

async function uploadAudioFinal(req, res) {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo de áudio é obrigatório' });

    const result = await pool.query(
      `UPDATE orders SET audio_final_url = $1, status = 'delivered', updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [req.file.path, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ order: result.rows[0], message: 'Áudio enviado e pedido marcado como entregue' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer upload do áudio' });
  }
}

async function getAllUsers(req, res) {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let params = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR email ILIKE $1`;
    }

    const result = await pool.query(
      `SELECT id, name, email, role, credits, created_at,
              (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders,
              (SELECT COALESCE(SUM(total_price),0) FROM orders WHERE user_id = users.id AND status != 'cancelled') as total_spent
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);

    res.json({
      users: result.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

async function adjustCredits(req, res) {
  const { id } = req.params;
  const { amount, description } = req.body;

  if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valor inválido' });

  try {
    const result = await pool.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING id, name, credits',
      [parseFloat(amount), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description)
       VALUES ($1,$2,$3,$4)`,
      [id, Math.abs(amount), amount > 0 ? 'credit_add' : 'credit_use', description || 'Ajuste manual pelo admin']
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ajustar créditos' });
  }
}

async function getReports(req, res) {
  const { period = '30' } = req.query;
  const days = parseInt(period);

  try {
    const [dailyRevenue, topVoices, avgTicket, totalStats] = await Promise.all([
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '${days} days' AND status != 'cancelled' AND status != 'pending'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      pool.query(`
        SELECT v.name, COUNT(o.id) as orders, COALESCE(SUM(o.total_price),0) as revenue
        FROM orders o JOIN voices v ON o.voice_id = v.id
        WHERE o.status != 'cancelled'
        GROUP BY v.id, v.name ORDER BY orders DESC LIMIT 5
      `),
      pool.query(`
        SELECT COALESCE(AVG(total_price),0) as avg_ticket
        FROM orders WHERE status != 'cancelled' AND status != 'pending'
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER(WHERE status != 'cancelled') as total_orders,
          COALESCE(SUM(total_price) FILTER(WHERE status != 'cancelled' AND status != 'pending'),0) as total_revenue,
          COUNT(DISTINCT user_id) as total_users
        FROM orders WHERE created_at >= NOW() - INTERVAL '${days} days'
      `),
    ]);

    res.json({
      dailyRevenue: dailyRevenue.rows,
      topVoices: topVoices.rows,
      avgTicket: parseFloat(avgTicket.rows[0].avg_ticket),
      stats: totalStats.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatórios' });
  }
}

module.exports = {
  getDashboard, getAllOrders, updateOrderStatus, uploadAudioFinal,
  getAllUsers, adjustCredits, getReports,
};
