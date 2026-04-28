import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, creditAPI } from '../../services/api';
import { Package, Wallet, Plus, Clock, CheckCircle, Mic2, ArrowRight } from 'lucide-react';

const statusMap = {
  pending:   { label: 'Aguardando pagamento', badge: 'badge-pending' },
  paid:      { label: 'Pago',                  badge: 'badge-paid' },
  producing: { label: 'Em produção',           badge: 'badge-producing' },
  delivered: { label: 'Entregue',              badge: 'badge-delivered' },
  cancelled: { label: 'Cancelado',             badge: 'badge-cancelled' },
};

function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon size={22} className={`text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderAPI.list({ limit: 5 }),
      creditAPI.balance(),
    ]).then(([ordersRes, creditsRes]) => {
      setOrders(ordersRes.data.orders);
      setCredits(creditsRes.data.credits);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(o => ['paid', 'producing'].includes(o.status)).length;

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Olá, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 mt-1">Bem-vindo ao seu painel SpotTunner</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Clock}  label="Pedidos ativos"       value={activeOrders} color="brand" />
            <StatCard icon={Wallet} label="Créditos disponíveis" value={`R$ ${parseFloat(credits).toFixed(2).replace('.', ',')}`} color="green" />
            <StatCard icon={Package} label="Total de pedidos"    value={orders.length > 0 ? `${orders.length}+` : '0'} color="blue" />
          </div>

          {/* CTA novo pedido */}
          <div className="card bg-gradient-to-r from-brand-900/40 to-dark-700 border-brand-500/20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Mic2 size={22} className="text-brand-400" />
                </div>
                <div>
                  <p className="font-bold">Novo pedido de locução</p>
                  <p className="text-sm text-gray-400">Escolha uma voz e insira seu texto</p>
                </div>
              </div>
              <Link to="/dashboard/new-order" className="btn-primary flex items-center gap-2">
                <Plus size={18} />
                Solicitar
              </Link>
            </div>
          </div>

          {/* Últimos pedidos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Últimos pedidos</h2>
              <Link to="/dashboard/orders" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse bg-dark-600" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="card text-center py-12">
                <Package size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Nenhum pedido ainda</p>
                <Link to="/dashboard/new-order" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={18} /> Fazer primeiro pedido
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const s = statusMap[order.status] || statusMap.pending;
                  return (
                    <div key={order.id} className="card flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                          <Mic2 size={16} className="text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{order.voice_name || 'Voz'}</p>
                          <p className="text-xs text-gray-500 truncate">{order.characters} chars · {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={s.badge}>{s.label}</span>
                        <span className="font-semibold text-sm">
                          R$ {parseFloat(order.total_price).toFixed(2).replace('.', ',')}
                        </span>
                        {order.audio_final_url && (
                          <a href={order.audio_final_url} target="_blank" rel="noreferrer"
                             className="text-xs text-brand-400 hover:text-brand-300">
                            Baixar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
