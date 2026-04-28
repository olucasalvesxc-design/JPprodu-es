require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const voiceRoutes = require('./routes/voices');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const creditRoutes = require('./routes/credits');
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://spottunner.online',
  'https://www.spottunner.online',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS não permitido'));
  },
  credentials: true,
}));

// Stripe webhook precisa do body raw antes do JSON parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/voices', voiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'SpotTunner API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎙️  SpotTunner API rodando na porta ${PORT}`);
});

module.exports = app;
