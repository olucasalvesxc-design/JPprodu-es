import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AudioPlayer from '../../components/AudioPlayer';
import { voiceAPI, orderAPI, paymentAPI, settingsAPI, creditAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, Mic2, Music, Zap, FileText, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function CheckoutForm({ clientSecret, orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/dashboard/orders' },
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full py-3.5">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processando...
          </span>
        ) : 'Confirmar pagamento'}
      </button>
    </form>
  );
}

const STEPS = ['Voz', 'Texto', 'Extras', 'Pagamento'];

export default function NewOrder() {
  const [step, setStep] = useState(0);
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState({});
  const [credits, setCredits] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [text, setText] = useState('');
  const [extras, setExtras] = useState({ soundtrack: false, urgency: false, revision: false });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [breakdown, setBreakdown] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      voiceAPI.list(),
      settingsAPI.public(),
      creditAPI.balance(),
    ]).then(([v, s, c]) => {
      setVoices(v.data.voices);
      setSettings(s.data.settings);
      setCredits(parseFloat(c.data.credits));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (text.length > 0) {
      orderAPI.calculate({ text, extras }).then(({ data }) => setBreakdown(data.breakdown)).catch(() => {});
    } else {
      setBreakdown(null);
    }
  }, [text, extras]);

  async function handleCreateOrder() {
    setLoading(true);
    setError('');
    try {
      const { data } = await orderAPI.create({
        voice_id: selectedVoice.id,
        text,
        extras,
        payment_method: paymentMethod,
      });
      setOrderId(data.order.id);

      if (paymentMethod === 'credits') {
        updateUser({ credits: credits - data.breakdown.total });
        setSuccess(true);
        setTimeout(() => navigate('/dashboard/orders'), 2000);
      } else {
        const intentRes = await paymentAPI.createIntent({ order_id: data.order.id });
        setClientSecret(intentRes.data.clientSecret);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  }

  function toggleExtra(key) {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const extrasList = [
    { key: 'soundtrack', icon: Music,    label: 'Trilha sonora', desc: 'Adicionar música de fundo', price: settings.extra_soundtrack },
    { key: 'urgency',    icon: Zap,      label: 'Urgência',      desc: 'Entrega prioritária em 6h', price: settings.extra_urgency },
    { key: 'revision',   icon: FileText, label: 'Revisão',       desc: 'Revisão do roteiro inclusa', price: settings.extra_revision },
  ];

  if (success) {
    return (
      <div className="flex min-h-screen bg-dark-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pedido realizado!</h2>
            <p className="text-gray-400">Redirecionando para seus pedidos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Novo Pedido</h1>
          <p className="text-gray-400 mb-8">Preencha as informações para solicitar sua locução</p>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-white' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-brand-500 text-white shadow-glow-sm' :
                    'bg-dark-600 text-gray-500'
                  }`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-green-500/50' : 'bg-dark-500'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Step 0: Escolher voz */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-lg mb-4">Escolha a voz</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {voices.map(voice => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`card cursor-pointer transition-all duration-200 ${
                      selectedVoice?.id === voice.id
                        ? 'border-brand-500 bg-brand-500/5 shadow-glow-sm'
                        : 'hover:border-dark-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{voice.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{voice.category} · {voice.gender}</p>
                      </div>
                      {selectedVoice?.id === voice.id && (
                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    {voice.description && <p className="text-sm text-gray-400 mb-3">{voice.description}</p>}
                    <AudioPlayer src={voice.audio_url} label="Ouvir demo" compact />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!selectedVoice}
                className="btn-primary w-full"
              >
                Continuar com {selectedVoice?.name || '...'}
              </button>
            </div>
          )}

          {/* Step 1: Texto */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-lg mb-4">Insira o texto da locução</h2>
              <div className="card mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Roteiro</label>
                  <span className="text-sm text-gray-400">
                    <span className={`font-semibold ${text.length > 0 ? 'text-white' : ''}`}>{text.length}</span> caracteres
                  </span>
                </div>
                <textarea
                  className="input h-48 resize-none"
                  placeholder="Cole ou escreva o texto da locução aqui..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                {breakdown && (
                  <div className="mt-4 pt-4 border-t border-dark-500 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estimativa base</span>
                    <span className="text-2xl font-black text-brand-400">
                      R$ {breakdown.base.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Voltar</button>
                <button onClick={() => setStep(2)} disabled={text.length < 10} className="btn-primary flex-1">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Extras */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-lg mb-4">Extras (opcional)</h2>
              <div className="space-y-3 mb-6">
                {extrasList.map(({ key, icon: Icon, label, desc, price }) => (
                  <div
                    key={key}
                    onClick={() => toggleExtra(key)}
                    className={`card cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      extras[key] ? 'border-brand-500 bg-brand-500/5' : 'hover:border-dark-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        extras[key] ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-600 text-gray-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-brand-400">+R$ {parseFloat(price || 0).toFixed(2).replace('.', ',')}</span>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        extras[key] ? 'border-brand-500 bg-brand-500' : 'border-dark-400'
                      }`}>
                        {extras[key] && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {breakdown && (
                <div className="card mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base ({text.length} chars)</span>
                    <span>R$ {breakdown.base.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {Object.entries(breakdown.extras || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-400">{extrasList.find(e => e.key === k)?.label}</span>
                      <span>+R$ {v.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-dark-500 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-brand-400 text-xl">R$ {breakdown.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Voltar</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continuar</button>
              </div>
            </div>
          )}

          {/* Step 3: Pagamento */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-lg mb-4">Pagamento</h2>

              {!clientSecret && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div
                      onClick={() => setPaymentMethod('stripe')}
                      className={`card cursor-pointer text-center transition-all ${
                        paymentMethod === 'stripe' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-dark-400'
                      }`}
                    >
                      <CreditCard size={24} className="mx-auto mb-2 text-brand-400" />
                      <p className="font-medium text-sm">Cartão</p>
                      <p className="text-xs text-gray-400">Via Stripe</p>
                    </div>
                    <div
                      onClick={() => credits >= (breakdown?.total || 0) && setPaymentMethod('credits')}
                      className={`card transition-all ${
                        credits >= (breakdown?.total || 0)
                          ? `cursor-pointer ${paymentMethod === 'credits' ? 'border-brand-500 bg-brand-500/5' : 'hover:border-dark-400'}`
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Wallet size={24} className="mx-auto mb-2 text-green-400" />
                      <p className="font-medium text-sm text-center">Créditos</p>
                      <p className="text-xs text-gray-400 text-center">
                        Saldo: R$ {credits.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  {breakdown && (
                    <div className="card mb-6 flex justify-between items-center">
                      <span className="text-gray-400">Total a pagar</span>
                      <span className="text-2xl font-black text-brand-400">
                        R$ {breakdown.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn-secondary flex-1">Voltar</button>
                    <button onClick={handleCreateOrder} disabled={loading} className="btn-primary flex-1">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processando...
                        </span>
                      ) : paymentMethod === 'credits' ? 'Pagar com créditos' : 'Ir para pagamento'}
                    </button>
                  </div>
                </>
              )}

              {clientSecret && (
                <div className="card">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      orderId={orderId}
                      onSuccess={() => { setSuccess(true); setTimeout(() => navigate('/dashboard/orders'), 2000); }}
                    />
                  </Elements>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
