import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic2, Play, ChevronRight, Star, Zap, Shield, Clock, ArrowRight, Check } from 'lucide-react';
import { settingsAPI } from '../services/api';

const testimonials = [
  { name: 'Marcos Oliveira', role: 'Diretor de Marketing', text: 'Qualidade incrível! Recebi a locução em menos de 24h. O preço é justo e o processo super simples.', stars: 5 },
  { name: 'Fernanda Costa', role: 'Produtora de Conteúdo', text: 'Uso o SpotTunner para todos os meus clientes. As vozes são profissionais e o sistema de créditos é muito prático.', stars: 5 },
  { name: 'Ricardo Lima', role: 'Agência de Publicidade', text: 'Finalmente uma plataforma que cobra por caractere! Muito mais justo do que preços fixos. Recomendo.', stars: 5 },
];

const steps = [
  { icon: '1', title: 'Escolha a voz', desc: 'Selecione entre vozes profissionais masculinas e femininas com demos para ouvir.' },
  { icon: '2', title: 'Insira seu texto', desc: 'Cole ou escreva o roteiro. O valor é calculado automaticamente por caractere.' },
  { icon: '3', title: 'Pague e receba', desc: 'Pague com cartão ou créditos e receba sua locução em até 24h.' },
];

export default function Landing() {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState({ price_base: 35, price_chars_base: 70 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    settingsAPI.public()
      .then(({ data }) => setSettings(data.settings))
      .catch(() => {});
  }, []);

  const chars = text.length;
  const price = chars > 0
    ? Math.max((chars / parseFloat(settings.price_chars_base)) * parseFloat(settings.price_base), parseFloat(settings.price_base))
    : 0;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Mic2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">SpotTunner</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-gray-400 hover:text-white transition-colors">Como funciona</a>
            <a href="#precos" className="text-sm text-gray-400 hover:text-white transition-colors">Preços</a>
            <a href="#depoimentos" className="text-sm text-gray-400 hover:text-white transition-colors">Depoimentos</a>
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Entrar</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Solicitar agora</Link>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-dark-600 bg-dark-800 px-6 py-4 space-y-4">
            <Link to="/login" className="block text-gray-300">Entrar</Link>
            <Link to="/register" className="btn-primary block text-center">Solicitar agora</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-brand-800/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-400 font-medium mb-8">
            <Zap size={14} />
            <span>Locuções profissionais em até 24h</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Voz profissional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-brand">
              sob demanda
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Locuções de alta qualidade com preço justo por caractere. Sem mensalidades,
            sem produtos fixos — você paga exatamente pelo que usa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Solicitar agora
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              Entrar na plataforma
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Sem mensalidade</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Entrega em 24h</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Vozes profissionais</div>
          </div>
        </div>
      </section>

      {/* Demos de vozes */}
      <section className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Ouça as nossas vozes</h2>
            <p className="text-gray-400">Escolha a voz perfeita para o seu projeto</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Ana Lima', category: 'Comercial', gender: 'F' },
              { name: 'Carlos Mendes', category: 'Institucional', gender: 'M' },
              { name: 'Julia Santos', category: 'Digital', gender: 'F' },
              { name: 'Roberto Silva', category: 'Corporativo', gender: 'M' },
            ].map((v) => (
              <div key={v.name} className="card-hover group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    v.gender === 'F' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {v.gender}
                  </div>
                  <button className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-all shadow-glow-sm">
                    <Play size={14} className="text-white ml-0.5" />
                  </button>
                </div>
                <p className="font-semibold">{v.name}</p>
                <p className="text-xs text-gray-500 mt-1">{v.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-gray-400">Três passos simples para ter a sua locução</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px bg-gradient-to-r from-brand-500/50 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black text-brand-400">{step.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section id="precos" className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Calculadora de preços</h2>
            <p className="text-gray-400">
              R$ {settings.price_base} para {settings.price_chars_base} caracteres. Escala proporcional.
            </p>
          </div>
          <div className="card">
            <label className="label">Cole ou escreva seu roteiro</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Digite ou cole o texto da locução aqui..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-500">
              <div className="text-sm text-gray-400">
                <span className="text-white font-semibold">{chars}</span> caracteres
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Estimativa</p>
                <p className="text-3xl font-black text-brand-400">
                  R$ {chars > 0 ? price.toFixed(2).replace('.', ',') : '--'}
                </p>
              </div>
            </div>
            {chars > 0 && (
              <div className="mt-4">
                <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2">
                  Solicitar esta locução
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap,    title: 'Preço dinâmico',    desc: 'Você paga apenas pelos caracteres que usa. Sem taxas fixas.' },
              { icon: Clock,  title: 'Entrega rápida',    desc: 'Locuções entregues em até 24 horas úteis.' },
              { icon: Shield, title: 'Qualidade garantida', desc: 'Revisão gratuita caso não esteja satisfeito.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">O que dizem nossos clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card bg-gradient-to-br from-brand-900/50 to-dark-700 border-brand-500/20">
            <h2 className="text-4xl font-black mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Crie sua conta gratuitamente e solicite sua primeira locução hoje.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                Solicitar agora
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-base">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic2 size={14} className="text-white" />
            </div>
            <span className="font-bold">SpotTunner</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 SpotTunner. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
