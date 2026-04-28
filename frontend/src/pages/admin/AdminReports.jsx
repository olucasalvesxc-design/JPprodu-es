import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';

const PERIODS = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
];

const customTooltipStyle = {
  backgroundColor: '#1a1a24',
  border: '1px solid #3d3d58',
  borderRadius: '12px',
  color: '#fff',
};

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.reports({ period })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const chartData = data?.dailyRevenue?.map(d => ({
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    receita: parseFloat(d.revenue),
    pedidos: parseInt(d.orders),
  })) || [];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Relatórios</h1>
              <p className="text-gray-400 mt-1">Análise de desempenho da plataforma</p>
            </div>
            <div className="flex gap-2">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === p.value
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'bg-dark-700 text-gray-400 border border-dark-500 hover:border-brand-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse bg-dark-600" />)}
              </div>
              <div className="card h-80 animate-pulse bg-dark-600" />
            </div>
          ) : data && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: DollarSign, label: 'Faturamento', value: `R$ ${parseFloat(data.stats.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'green' },
                  { icon: Package,    label: 'Pedidos',     value: data.stats.total_orders,  color: 'brand' },
                  { icon: Users,      label: 'Usuários',    value: data.stats.total_users,   color: 'blue' },
                  { icon: TrendingUp, label: 'Ticket médio',value: `R$ ${parseFloat(data.avgTicket || 0).toFixed(2).replace('.', ',')}`, color: 'yellow' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="card">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}-500/10 border border-${color}-500/20`}>
                      <Icon size={18} className={`text-${color}-400`} />
                    </div>
                    <p className="text-2xl font-black mb-1">{value}</p>
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-xs text-gray-600 mt-1">últimos {period} dias</p>
                  </div>
                ))}
              </div>

              {/* Gráfico de receita */}
              <div className="card mb-6">
                <h2 className="font-bold mb-6">Receita diária</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B3FE4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7B3FE4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d42" />
                      <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `R$${v}`} />
                      <Tooltip contentStyle={customTooltipStyle} formatter={v => [`R$ ${v.toFixed(2)}`, 'Receita']} />
                      <Area type="monotone" dataKey="receita" stroke="#7B3FE4" fill="url(#colorReceita)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Sem dados no período selecionado
                  </div>
                )}
              </div>

              {/* Pedidos por dia */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="font-bold mb-6">Pedidos por dia</h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d42" />
                        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={customTooltipStyle} />
                        <Bar dataKey="pedidos" fill="#7B3FE4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">Sem dados</div>
                  )}
                </div>

                {/* Top vozes */}
                <div className="card">
                  <h2 className="font-bold mb-6">Top vozes</h2>
                  {data.topVoices?.length > 0 ? (
                    <div className="space-y-3">
                      {data.topVoices.map((v, i) => (
                        <div key={v.name} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-sm font-bold text-brand-400">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">{v.name}</p>
                              <span className="text-xs text-gray-400 shrink-0 ml-2">{v.orders} pedidos</span>
                            </div>
                            <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${(v.orders / (data.topVoices[0]?.orders || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-brand-400 shrink-0">
                            R$ {parseFloat(v.revenue).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">Sem dados</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
