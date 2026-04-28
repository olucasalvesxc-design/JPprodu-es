import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminAPI } from '../../services/api';
import { DollarSign, Package, Users, Clock, Mic2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusMap = {
  pending:   { label: 'Aguardando', badge: 'badge-pending' },
  paid:      { label: 'Pago',       badge: 'badge-paid' },
  producing: { label: 'Produção',   badge: 'badge-producing' },
  delivered: { label: 'Entregue',   badge: 'badge-delivered' },
  cancelled: { label: 'Cancelado',  badge: 'badge-cancelled' },
};

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon size={20} className={`text-${color}-400`} />
        </div>
      </div>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Visão Geral</h1>
            <p className="text-gray-400 mt-1">Painel administrativo SpotTunner</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => <div key={i} className="card h-32 animate-pulse bg-dark-600" />)}
            </div>
          ) : data && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={DollarSign} label="Faturamento total" color="green"
                  value={`R$ ${parseFloat(data.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <StatCard
                  icon={Package} label="Pedidos hoje" color="brand"
                  value={data.ordersToday}
                />
                <StatCard
                  icon={Users} label="Usuários ativos (30d)" color="blue"
                  value={data.activeUsers}
                />
                <StatCard
                  icon={Clock} label="Status dos pedidos" color="yellow"
                  value={data.statusBreakdown?.find(s => s.status === 'producing')?.count || 0}
                  sub="em produção agora"
                />
              </div>

              {/* Status breakdown */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                {data.statusBreakdown?.map(s => {
                  const info = statusMap[s.status] || statusMap.pending;
                  return (
                    <div key={s.status} className="card text-center py-4">
                      <p className="text-2xl font-black mb-1">{s.count}</p>
                      <span className={info.badge}>{info.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Pedidos recentes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Pedidos recentes</h2>
                  <Link to="/admin/orders" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {data.recentOrders?.map(order => {
                    const s = statusMap[order.status] || statusMap.pending;
                    return (
                      <div key={order.id} className="card flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                            <Mic2 size={16} className="text-brand-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{order.user_name}</p>
                            <p className="text-xs text-gray-500">{order.voice_name} · #{order.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={s.badge}>{s.label}</span>
                          <span className="font-semibold text-sm">
                            R$ {parseFloat(order.total_price).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
