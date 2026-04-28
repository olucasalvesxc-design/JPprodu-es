import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminAPI } from '../../services/api';
import { Mic2, Upload, ChevronDown, Search, RefreshCw, X } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Aguardando pagamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'producing', label: 'Em produção' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const statusMap = {
  pending:   { label: 'Aguardando', badge: 'badge-pending' },
  paid:      { label: 'Pago',       badge: 'badge-paid' },
  producing: { label: 'Produção',   badge: 'badge-producing' },
  delivered: { label: 'Entregue',   badge: 'badge-delivered' },
  cancelled: { label: 'Cancelado',  badge: 'badge-cancelled' },
};

function OrderDetail({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleStatusUpdate() {
    setLoading(true);
    await adminAPI.updateOrderStatus(order.id, { status, notes }).catch(() => {});
    setMsg('Status atualizado!');
    setLoading(false);
    setTimeout(() => { setMsg(''); onUpdate(); }, 1500);
  }

  async function handleAudioUpload() {
    if (!audioFile) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('audio', audioFile);
    await adminAPI.uploadAudio(order.id, fd).catch(() => {});
    setMsg('Áudio enviado! Pedido marcado como entregue.');
    setLoading(false);
    setTimeout(() => { setMsg(''); onUpdate(); }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 rounded-2xl border border-dark-500 w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-500">
          <h2 className="font-bold">Pedido #{order.id}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          {msg && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-green-400 text-sm">{msg}</div>}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Cliente</p><p className="font-medium">{order.user_name}</p></div>
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Email</p><p className="font-medium truncate">{order.user_email}</p></div>
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Voz</p><p className="font-medium">{order.voice_name || 'N/A'}</p></div>
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Total</p><p className="font-bold text-brand-400">R$ {parseFloat(order.total_price).toFixed(2).replace('.', ',')}</p></div>
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Caracteres</p><p className="font-medium">{order.characters}</p></div>
            <div className="bg-dark-600 rounded-xl p-3"><p className="text-gray-400 text-xs">Pagamento</p><p className="font-medium">{order.payment_method === 'credits' ? 'Créditos' : 'Cartão'}</p></div>
          </div>

          <div className="bg-dark-600 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">TEXTO DA LOCUÇÃO</p>
            <p className="text-sm text-gray-300 leading-relaxed">{order.text}</p>
          </div>

          {order.extras && Object.values(order.extras).some(Boolean) && (
            <div className="bg-dark-600 rounded-xl p-3 text-sm">
              <p className="text-gray-400 text-xs mb-2">EXTRAS</p>
              <div className="flex gap-2 flex-wrap">
                {order.extras.soundtrack && <span className="badge-producing">Trilha sonora</span>}
                {order.extras.urgency && <span className="badge-pending">Urgência</span>}
                {order.extras.revision && <span className="badge-paid">Revisão</span>}
              </div>
            </div>
          )}

          {/* Atualizar status */}
          <div className="border border-dark-500 rounded-xl p-4">
            <p className="font-medium mb-3">Atualizar status</p>
            <select className="input mb-3" value={status} onChange={e => setStatus(e.target.value)}>
              {statusOptions.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <textarea className="input h-24 resize-none mb-3" placeholder="Observações (opcional)"
              value={notes} onChange={e => setNotes(e.target.value)} />
            <button onClick={handleStatusUpdate} disabled={loading} className="btn-primary w-full">
              {loading ? 'Salvando...' : 'Atualizar status'}
            </button>
          </div>

          {/* Upload áudio final */}
          <div className="border border-dark-500 rounded-xl p-4">
            <p className="font-medium mb-3">Enviar áudio final</p>
            {order.audio_final_url && (
              <div className="mb-3 p-3 bg-green-500/10 rounded-xl text-sm text-green-400 border border-green-500/30">
                ✅ Áudio já enviado — <a href={order.audio_final_url} target="_blank" rel="noreferrer" className="underline">baixar</a>
              </div>
            )}
            <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 text-center hover:border-brand-500 transition-colors mb-3">
              <input type="file" accept="audio/*" className="hidden" id="final-audio"
                onChange={e => setAudioFile(e.target.files[0])} />
              <label htmlFor="final-audio" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-gray-400">{audioFile ? audioFile.name : 'Clique para selecionar o áudio'}</span>
              </label>
            </div>
            <button onClick={handleAudioUpload} disabled={!audioFile || loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload size={16} />
              {loading ? 'Enviando...' : 'Enviar e marcar como entregue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);

  function load() {
    setLoading(true);
    adminAPI.orders({ status, search, page, limit: 15 })
      .then(({ data }) => {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [status, page]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { setSelected(null); load(); }}
        />
      )}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
              <p className="text-gray-400 mt-1">{total} pedido(s)</p>
            </div>
            <button onClick={load} className="btn-ghost flex items-center gap-2">
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
              <input className="input" placeholder="Buscar por cliente ou email..." value={search}
                onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn-primary px-4"><Search size={16} /></button>
            </form>
            <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse bg-dark-600" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">Nenhum pedido encontrado</div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => {
                const s = statusMap[order.status] || statusMap.pending;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="card hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                        <Mic2 size={16} className="text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{order.user_name}</p>
                          <span className="text-xs text-gray-600">#{order.id}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {order.voice_name} · {order.characters} chars · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={s.badge}>{s.label}</span>
                      <span className="font-bold text-sm">R$ {parseFloat(order.total_price).toFixed(2).replace('.', ',')}</span>
                      {order.audio_final_url && <span className="text-xs text-green-400">● Áudio</span>}
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2">Anterior</button>
              <span className="text-sm text-gray-400">{page} de {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary px-4 py-2">Próxima</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
