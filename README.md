# SpotTunner 🎙️

Plataforma SaaS para venda de locuções profissionais sob demanda com precificação dinâmica por caracteres.

---

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **Pagamentos**: Stripe (PaymentIntent — dinâmico)
- **Uploads**: Cloudinary

---

## Estrutura de Pastas

```
spottunner/
├── backend/
│   ├── src/
│   │   ├── config/         # database.js, cloudinary.js, migrate.js
│   │   ├── controllers/    # auth, voices, orders, payments, credits, settings, admin
│   │   ├── middleware/     # auth.js, admin.js
│   │   ├── routes/         # todas as rotas
│   │   └── utils/          # priceCalculator.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # layout (Sidebar, AdminSidebar), AudioPlayer
    │   ├── context/        # AuthContext
    │   ├── pages/
    │   │   ├── dashboard/  # Dashboard, NewOrder, Orders, Credits, Support
    │   │   └── admin/      # AdminDashboard, Voices, Orders, Users, Settings, Reports
    │   └── services/       # api.js (todos os endpoints)
    └── package.json
```

---

## Setup Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta Stripe (test keys)
- Conta Cloudinary

### 1. Clone e instale dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure variáveis de ambiente

```bash
# backend/.env (copie de .env.example)
cp backend/.env.example backend/.env
```

Edite `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spottunner
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=gere_um_secret_forte_aqui
JWT_REFRESH_SECRET=outro_secret_forte_aqui

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

CLOUDINARY_CLOUD_NAME=seu_cloud
CLOUDINARY_API_KEY=sua_key
CLOUDINARY_API_SECRET=seu_secret

FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@spottunner.com
ADMIN_PASSWORD=Admin@123456
```

Crie `frontend/.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

### 3. Crie o banco de dados

```bash
psql -U postgres -c "CREATE DATABASE spottunner;"
```

### 4. Execute as migrations

```bash
cd backend
npm run migrate
```

Isso cria todas as tabelas, configurações padrão, vozes demo e o usuário admin.

### 5. Inicie os servidores

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Acesse: http://localhost:5173

**Admin padrão**: admin@spottunner.com / Admin@123456

---

## Stripe — Webhooks Locais

Para testar pagamentos localmente use o Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copie o `whsec_` gerado para `STRIPE_WEBHOOK_SECRET` no `.env`.

---

## Lógica de Precificação

```
valor = (caracteres / chars_base) * price_base
valor_final = max(valor, min_price)
```

Valores padrão:
- `price_base` = R$ 35
- `price_chars_base` = 70 caracteres
- `min_price` = R$ 35

Editável em tempo real pelo admin em **Configurações → Preços**.

---

## API Endpoints

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar token |
| GET  | `/api/auth/me` | Usuário logado |
| POST | `/api/auth/logout` | Logout |

### Vozes (público: GET /)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/api/voices` | Listar ativas |
| GET  | `/api/voices/all` | Listar todas (admin) |
| POST | `/api/voices` | Criar (admin) |
| PUT  | `/api/voices/:id` | Editar (admin) |
| DELETE | `/api/voices/:id` | Remover (admin) |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/orders/calculate` | Calcular preço |
| POST | `/api/orders` | Criar pedido |
| GET  | `/api/orders` | Listar meus pedidos |
| GET  | `/api/orders/:id` | Detalhe do pedido |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/payments/intent` | Criar PaymentIntent |
| POST | `/api/payments/credit-intent` | Intent para créditos |
| POST | `/api/payments/webhook` | Webhook Stripe |

### Créditos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/api/credits/balance` | Saldo |
| GET  | `/api/credits/transactions` | Histórico |

### Configurações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/api/settings/public` | Config pública (calculadora) |
| GET  | `/api/settings` | Config completa (admin) |
| PUT  | `/api/settings` | Atualizar (admin) |

### Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/api/admin/dashboard` | Métricas |
| GET  | `/api/admin/orders` | Todos os pedidos |
| PATCH | `/api/admin/orders/:id/status` | Atualizar status |
| POST | `/api/admin/orders/:id/audio` | Upload áudio final |
| GET  | `/api/admin/users` | Listar usuários |
| PATCH | `/api/admin/users/:id/credits` | Ajustar créditos |
| GET  | `/api/admin/reports` | Relatórios |

---

## Deploy — Produção

### Backend (Railway / Render / Fly.io)

1. Suba o código do `/backend`
2. Configure todas as variáveis de ambiente do `.env.example`
3. Execute `npm run migrate` no ambiente de produção
4. Start command: `npm start`

### Frontend (Vercel / Netlify)

1. Suba o código do `/frontend`
2. Configure `VITE_STRIPE_PUBLIC_KEY` nas variáveis de ambiente
3. Configure o proxy ou altere `api.js` para apontar para a URL do backend
4. Build command: `npm run build`

### PostgreSQL

Use **Neon** (gratuito), **Supabase**, **Railway PostgreSQL** ou **RDS**.

### Webhook Stripe em produção

No Stripe Dashboard:
- Adicione o endpoint: `https://seu-backend.com/api/payments/webhook`
- Eventos: `payment_intent.succeeded`
- Copie o Signing Secret para `STRIPE_WEBHOOK_SECRET`

---

## Checklist de Funcionalidades

- [x] Autenticação JWT com refresh token
- [x] Cadastro e login
- [x] Listagem e player de vozes
- [x] Calculadora dinâmica por caracteres
- [x] Criação de pedidos com extras
- [x] Pagamento via Stripe (PaymentIntent)
- [x] Pagamento via créditos internos
- [x] Recarregar créditos via Stripe
- [x] Dashboard do usuário
- [x] Acompanhamento de pedidos com status
- [x] Download do áudio entregue
- [x] Dashboard admin completo
- [x] Gerenciar vozes (upload de demos)
- [x] Atualizar status de pedidos
- [x] Upload do áudio final pelo admin
- [x] Gerenciar usuários e créditos
- [x] Configuração de preços global (sem produtos fixos)
- [x] Relatórios com gráficos (Recharts)
- [x] Dark mode com design neon

---

Desenvolvido com ❤️ — SpotTunner © 2024
