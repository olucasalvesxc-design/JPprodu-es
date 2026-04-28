import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mic2, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    referral_code: params.get('ref') || '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ['', 'Fraca', 'Regular', 'Boa', 'Forte', 'Muito forte'];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-400'];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Senha deve ter no mínimo 6 caracteres');
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.referral_code);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Mic2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">SpotTunner</h1>
              <p className="text-xs text-gray-500">Plataforma de locuções</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Criar conta grátis</h2>
          <p className="text-sm text-gray-400 mb-6">Sem mensalidade. Pague apenas quando solicitar.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nome completo</label>
              <input
                type="text"
                className="input"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor[strength] : 'bg-dark-400'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Força: {strengthLabel[strength]}</p>
                </div>
              )}
            </div>
            {form.referral_code !== undefined && (
              <div>
                <label className="label">Código de indicação (opcional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: ABC12345"
                  value={form.referral_code}
                  onChange={e => setForm({ ...form, referral_code: e.target.value.toUpperCase() })}
                />
              </div>
            )}

            <div className="bg-dark-600 rounded-xl p-3 space-y-2 text-xs text-gray-400">
              {['Sem mensalidade', 'Preço justo por caractere', 'Entrega em até 24h'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <Check size={12} className="text-green-400 shrink-0" />
                  {t}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
