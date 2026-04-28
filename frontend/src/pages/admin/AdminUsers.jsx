import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminAPI } from '../../services/api';
import { Users, Search, Wallet, Package, X } from 'lucide-react';

function CreditModal({ user, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount)) return setError('Valor inválido');
    setLoading(true);
    setError('');
    try {
      await adminAPI.adjustCredits(user.id, { amount: parseFloat(amount), description });
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao ajustar créditos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 rounded-2xl border border-dark-500 w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold">Ajustar créditos</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-dark-600 rounded-xl p-3 text-sm">
            <p className="text-gray-400">Cliente: <span className="text-white font-medium">{user.name}</span></p>
            <p className="text-gray-400">Saldo atual: <span className="text-brand-400 font-bold">R$ {parseFloat(user.credits).toFixed(2).replace('.', ',')}</span></p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div>
            <label className="label">Valor (negativo para debitar)</label>
            <input type="number" step="0.01" className="input" placeholder="Ex: 50 ou -20"
              value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="label">Motivo</label>
            <input className="input" placeholder="Ex: Bônus de boas-vindas"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [creditModal, setCreditModal] = useState(null);

  function load() {
    setLoading(true);
    adminAPI.users({ search, page, limit: 20 })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [page]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      {creditModal && (
        <CreditModal
          user={creditModal}
          onClose={() => setCreditModal(null)}
          onSave={() => { setCreditModal(null); load(); }}
        />
      )}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Usuários</h1>
              <p className="text-gray-400 mt-1">{total} usuário(s) cadastrado(s)</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input className="input" placeholder="Buscar por nome ou email..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn-primary px-5 flex items-center gap-2">
              <Search size={16} /> Buscar
            </button>
          </form>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse bg-dark-600" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="card text-center py-16">
              <Users size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="card flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {user.role === 'admin' && (
                          <span className="badge bg-brand-500/20 text-brand-400 border-brand-500/30">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email} · cadastro {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-sm">
                        <Package size={14} className="text-gray-500" />
                        <span>{user.total_orders} pedidos</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <span>R$ {parseFloat(user.total_spent || 0).toFixed(2).replace('.', ',')} gasto</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Créditos</p>
                      <p className="font-bold text-brand-400">R$ {parseFloat(user.credits).toFixed(2).replace('.', ',')}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setCreditModal(user)}
                        className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                      >
                        <Wallet size={14} /> Créditos
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
