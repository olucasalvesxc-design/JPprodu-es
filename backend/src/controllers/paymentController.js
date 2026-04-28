const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');
const { calculatePrice } = require('../utils/priceCalculator');

async function getSettings() {
  const result = await pool.query('SELECT key, value FROM settings');
  const s = {};
  result.rows.forEach(r => { s[r.key] = r.value; });
  return s;
}

async function createPaymentIntent(req, res) {
  const { order_id } = req.body;
  const userId = req.user.id;

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = $3',
      [order_id, userId, 'pending']
    );
    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou já pago' });
    }

    const o = order.rows[0];
    const amountCents = Math.round(parseFloat(o.total_price) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'brl',
      metadata: {
        order_id: String(o.id),
        user_id: String(userId),
      },
    });

    await pool.query(
      'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, o.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar intenção de pagamento' });
  }
}

async function createCreditIntent(req, res) {
  const { amount } = req.body; // valor em reais
  const userId = req.user.id;

  if (!amount || amount < 10) {
    return res.status(400).json({ error: 'Valor mínimo de R$10' });
  }

  try {
    const amountCents = Math.round(parseFloat(amount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'brl',
      metadata: {
        type: 'credit_add',
        user_id: String(userId),
        amount_brl: String(amount),
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar intenção de pagamento' });
  }
}

async function webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const { order_id, user_id, type, amount_brl } = pi.metadata;

    if (type === 'credit_add') {
      await pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [
        parseFloat(amount_brl), parseInt(user_id),
      ]);
      await pool.query(
        `INSERT INTO transactions (user_id, amount, type, description, stripe_payment_intent_id)
         VALUES ($1,$2,'credit_add','Recarga de créditos via Stripe',$3)`,
        [parseInt(user_id), parseFloat(amount_brl), pi.id]
      );
    } else if (order_id) {
      await pool.query(
        `UPDATE orders SET status = 'paid', updated_at = NOW()
         WHERE id = $1 AND stripe_payment_intent_id = $2`,
        [parseInt(order_id), pi.id]
      );
      const order = await pool.query('SELECT * FROM orders WHERE id = $1', [parseInt(order_id)]);
      if (order.rows.length > 0) {
        await pool.query(
          `INSERT INTO transactions (user_id, order_id, amount, type, description, stripe_payment_intent_id)
           VALUES ($1,$2,$3,'payment','Pagamento de pedido via Stripe',$4)`,
          [parseInt(user_id), parseInt(order_id), order.rows[0].total_price, pi.id]
        );
      }
    }
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, createCreditIntent, webhook };
