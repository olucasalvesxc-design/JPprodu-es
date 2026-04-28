import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { creditAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const AMOUNTS = [25, 50, 100, 200];

function AddCreditsForm({ clientSecret, amount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/dashboard/credits' },
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="card">
      <h3 className="font-bold mb-4">Adicionar R$ {amount.toFixed(2).replace('.', ',')} em créditos</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={!stripe || loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </span>
            ) : `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Credits() {
  const { user, updateUser } = useAuth();
  const [balance, setBalance] = useState(parseFloat(user?.credits || 0));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([creditAPI.balance(), creditAPI.transactions()])
      .then(([b, t]) => {
        setBalance(parseFloat(b.data.credits));
        setTransactions(t.data.transactions);
      }).finally(() => setLoading(false));
  }, []);

  async function handleAddCredits() {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 10) return setError('Valor mínimo de R$10');
    setError('');
    setAddingCredits(true);
    try {
      const { data } = await paymentAPI.createCreditIntent({ amount });
      setClientSecret(data.clientSecret);
      setSelectedAmount(amount);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar');
    } finally {
      setAddingCredits(false);
    }
  }

  function handleSuccess() {
    const amount = selectedAmount;
    setBalance(prev => prev + amount);
    updateUser({ credits: balance + amount });
    setClientSecret('');
    setSuccess(true);
    setSelectedAmount(null);
    setCustomAmount('');
    setTimeout(() => setSuccess(false), 3000);
    creditAPI.transactions().then(({ data }) => setTransactions(data.transactions));
  }

  const typeLabels = {
    credit_add: { label: 'Recarga', icon: ArrowUpRight, color: 'text-green-400' },
    credit_use: { label: 'Uso',     icon: ArrowDownRight, color: 'text-red-400' },
    payment:    { label: 'Pagamento', icon: CreditCard,   color: 'text-blue-400' },
    refund:     { label: 'Reembolso', icon: ArrowUpRight, color: 'text-green-400' },
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Créditos</h1>

          {/* Saldo */}
          <div className="card bg-gradient-to-r from-brand-900/40 to-dark-700 border-brand-500/20 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Wallet size={26} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-0.5">Saldo disponível</p>
                  <p className="text-4xl font-black">
                    R$ {balance.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-green-400 text-sm">
              ✅ Créditos adicionados com sucesso!
            </div>
          )}

          {/* Adicionar créditos */}
          {!clientSecret ? (
            <div className="card mb-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Plus size={18} /> Adicionar créditos
              </h2>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedAmount === a
                        ? 'bg-brand-500 text-white shadow-glow-sm'
                        : 'bg-dark-600 text-gray-300 hover:bg-dark-500 border border-dark-400 hover:border-brand-500'
                    }`}
                  >
                    R$ {a}
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <label className="label">Outro valor</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Ex: 75"
                  min="10"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button
                onClick={handleAddCredits}
                disabled={addingCredits || (!selectedAmount && !customAmount)}
                className="btn-primary w-full"
              >
                {addingCredits ? 'Processando...' : `Adicionar${selectedAmount || customAmount ? ` R$ ${(selectedAmount || customAmount)}` : ''}`}
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <AddCreditsForm
                  clientSecret={clientSecret}
                  amount={selectedAmount}
                  onSuccess={handleSuccess}
                  onCancel={() => { setClientSecret(''); setSelectedAmount(null); }}
                />
              </Elements>
            </div>
          )}

          {/* Histórico */}
          <div>
            <h2 className="font-bold mb-4">Histórico de transações</h2>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="card h-14 animate-pulse bg-dark-600" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">Nenhuma transação ainda</div>
            ) : (
              <div className="space-y-2">
                {transactions.map(t => {
                  const type = typeLabels[t.type] || typeLabels.payment;
                  const Icon = type.icon;
                  const isPositive = t.type === 'credit_add' || t.type === 'refund';
                  return (
                    <div key={t.id} className="card flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          <Icon size={16} className={type.color} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.description || type.label}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(t.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : '-'}R$ {parseFloat(t.amount).toFixed(2).replace('.', ',')}
                      </span>
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
