require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool = require('./database');
const bcrypt = require('bcryptjs');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Iniciando migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        credits DECIMAL(10,2) DEFAULT 0.00,
        referral_code VARCHAR(20) UNIQUE,
        referred_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS voices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        audio_url VARCHAR(500),
        category VARCHAR(100) DEFAULT 'geral',
        gender VARCHAR(20) DEFAULT 'neutro',
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        voice_id INTEGER REFERENCES voices(id),
        text TEXT NOT NULL,
        characters INTEGER NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        extras_price DECIMAL(10,2) DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL,
        extras JSONB DEFAULT '{}',
        status VARCHAR(30) DEFAULT 'pending'
          CHECK (status IN ('pending','paid','producing','delivered','cancelled')),
        payment_method VARCHAR(20) DEFAULT 'stripe'
          CHECK (payment_method IN ('stripe','credits')),
        stripe_payment_intent_id VARCHAR(255),
        audio_final_url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id),
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('credit_add','credit_use','payment','refund')),
        description TEXT,
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Índices de performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);

    // Configurações padrão
    const defaultSettings = [
      { key: 'price_base', value: '35', description: 'Valor base para 70 caracteres (R$)' },
      { key: 'price_chars_base', value: '70', description: 'Quantidade de caracteres para o preço base' },
      { key: 'extra_soundtrack', value: '15', description: 'Adicional de trilha sonora (R$)' },
      { key: 'extra_urgency', value: '20', description: 'Adicional de urgência (R$)' },
      { key: 'extra_revision', value: '10', description: 'Adicional de revisão de roteiro (R$)' },
      { key: 'min_price', value: '35', description: 'Preço mínimo do pedido (R$)' },
    ];

    for (const setting of defaultSettings) {
      await client.query(`
        INSERT INTO settings (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO NOTHING;
      `, [setting.key, setting.value, setting.description]);
    }

    // Vozes demo
    const demoVoices = [
      { name: 'Ana Lima', description: 'Voz feminina, suave e profissional', category: 'comercial', gender: 'feminino' },
      { name: 'Carlos Mendes', description: 'Voz masculina, grave e impactante', category: 'institucional', gender: 'masculino' },
      { name: 'Julia Santos', description: 'Voz jovem, dinâmica e moderna', category: 'digital', gender: 'feminino' },
      { name: 'Roberto Silva', description: 'Voz masculina, clara e objetiva', category: 'corporativo', gender: 'masculino' },
    ];

    for (const voice of demoVoices) {
      await client.query(`
        INSERT INTO voices (name, description, category, gender)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [voice.name, voice.description, voice.category, voice.gender]);
    }

    // Admin padrão
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spottunner.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminExists = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (adminExists.rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      const code = 'ADMIN' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await client.query(`
        INSERT INTO users (name, email, password, role, referral_code)
        VALUES ('Admin SpotTunner', $1, $2, 'admin', $3);
      `, [adminEmail, hash, code]);
      console.log(`✅ Admin criado: ${adminEmail} / ${adminPassword}`);
    }

    console.log('✅ Migrations concluídas com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migration:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
