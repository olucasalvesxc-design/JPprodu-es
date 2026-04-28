import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { orderAPI } from '../../services/api';
import { Package, Mic2, Download, RefreshCw } from 'lucide-react';

const statusMap = {
  pending:   { label: 'Aguardando pagamento', badge: 'badge-pending' },
  paid:      { label: 'Pago',                  badge: 'badge-paid' },
  producing: { label: 'Em produção',           badge: 'badge-producing' },
  delivered: { label: 'Entregue',              badge: 'badge-delivered' },
  cancelled: { label: 'Cancelado',             badge: 'badge-cancelled' },
};

const statusFilters = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'paid', label: 'Pago' },
  { value: 'producing', label: 'Em produção' },
  { value: 'delivered', label: 'Entregue' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [expanded, setExpanded] = useState(null);

  function load() {
    setLoading(true);
    orderAPI.list({ status, page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [status, page]);

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Meus Pedidos</h1>
              <p className="text-gray-400 mt-1">{total} pedido{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={load} className="btn-ghost flex items-center gap-2">
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {statusFilters.map(f => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  status === f.value
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'bg-dark-700 text-gray-400 hover:text-white border border-dark-500 hover:border-brand-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-dark-600" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-16">
              <Package size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-gray-500">
                {status ? 'Tente outro filtro' : 'Faça seu primeiro pedido'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const s = statusMap[order.status] || statusMap.pending;
                const isOpen = expanded === order.id;
                return (
                  <div key={order.id} className="card">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                          <Mic2 size={18} className="text-brand-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{order.voice_name || 'Locução'}</p>
                            <span className={s.badge}>{s.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.characters} caracteres · {new Date(order.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-bold text-brand-400">
                          R$ {parseFloat(order.total_price).toFixed(2).replace('.', ',')}
                        </span>
                        {order.audio_final_url && (
                          <a
                            href={order.audio_final_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-all"
                          >
                            <Download size={12} />
                            Baixar
                          </a>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-dark-500 space-y-3 animate-fade-in">
                        <div className="bg-dark-600 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Texto da locução</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{order.text}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="bg-dark-600 rounded-xl p-3">
                            <p className="text-gray-500 text-xs">Método</p>
                            <p className="font-medium">{order.payment_method === 'credits' ? 'Créditos' : 'Cartão'}</p>
                          </div>
                          <div className="bg-dark-600 rounded-xl p-3">
                            <p className="text-gray-500 text-xs">Base</p>
                            <p className="font-medium">R$ {parseFloat(order.base_price).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="bg-dark-600 rounded-xl p-3">
                            <p className="text-gray-500 text-xs">Extras</p>
                            <p className="font-medium">R$ {parseFloat(order.extras_price).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="bg-dark-600 rounded-xl p-3">
                            <p className="text-gray-500 text-xs">Pedido #</p>
                            <p className="font-medium">#{order.id}</p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="bg-dark-600 rounded-xl p-3 text-sm">
                            <p className="text-gray-500 text-xs mb-1">Observações</p>
                            <p className="text-gray-300">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2">
                Anterior
              </button>
              <span className="text-sm text-gray-400">
                {page} de {pages}
              </span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-4 py-2">
                Próxima
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
