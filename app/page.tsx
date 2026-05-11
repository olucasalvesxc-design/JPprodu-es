'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Play,
  Pause,
  Mic2,
  Music,
  Headphones,
  Radio,
  Tv,
  CheckCircle2,
  Waves,
  MessageSquare,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  Search,
  Clock,
  Package,
  Cpu,
} from 'lucide-react';

const voices = [
  { id: 1, name: 'AMÓS HENRIQUE', tone: 'Impacto / Jovem', type: 'Varejo / Spots', demoUrl: '/audio/amos-henrique-20.mp4', category: 'Varejo' },
  { id: 2, name: 'CAIO DOLGLAS', tone: 'Suave / Versátil', type: 'Institucional / Narração', demoUrl: '/audio/caio-dolglas-8.mp4', category: 'Institucional' },
  { id: 3, name: 'FLY DULTRA', tone: 'Impacto / Forte', type: 'Comercial / Varejo', demoUrl: '/audio/fly-dultra-impacto.mp4', category: 'Varejo' },
  { id: 4, name: 'ESTER SUFALATE', tone: 'Narrativa / Clara', type: 'Documentário / Podcast', demoUrl: '/audio/ester-sufalate-gs.mp4', category: 'Narrativa' },
  { id: 5, name: 'EXDRAS LUIZ', tone: 'Jovem / Versátil', type: 'Podcasts / Spots', demoUrl: '/audio/exdras-luiz-27.mp4', category: 'Jovem' },
  { id: 6, name: 'CLAUDIA LAOMEDIA', tone: 'Elegante / Calma', type: 'Audiobook / Treinamento', demoUrl: '/audio/claudia-laomedia-gs.mp4', category: 'Institucional' },
  { id: 7, name: 'MARCO LEANDRO', tone: 'Energético / Impacto', type: 'Varejo / Spots', demoUrl: '/audio/marco-leandro-energetico.mp4', category: 'Varejo' },
  { id: 8, name: 'SONIA DISPINA', tone: 'Suave / Versátil', type: 'Institucional / Narração', demoUrl: '/audio/sonia-dispina-gs.mp4', category: 'Institucional' },
  { id: 9, name: 'RICARDO DULTRA', tone: 'Grave / Sóbrio', type: 'Institucional / Político', demoUrl: '/audio/ricardo-dultra-4.mp4', category: 'Grave' },
  { id: 10, name: 'ROSA EDI', tone: 'Pop / Jovem', type: 'Podcasts / Spots', demoUrl: '/audio/rosa-edi-26.mp4', category: 'Jovem' },
  { id: 11, name: 'JOAB TRINDADE', tone: 'Versátil / Comercial', type: 'Varejo / Chamadas', demoUrl: '/audio/joab-trindade-5.mp4', category: 'Varejo' },
  { id: 12, name: 'MICHAEL DOLGLAS', tone: 'Dinâmico / Jovem', type: 'Games / Streaming', demoUrl: '/audio/michael-dolglas-32.mp4', category: 'Jovem' },
  { id: 13, name: 'MISS JÔ', tone: 'Expressiva / Forte', type: 'Comercial / Spots', demoUrl: '/audio/miss-jo-19.mp4', category: 'Varejo' },
  { id: 14, name: 'JUNIOR TRINDADE', tone: 'Impacto / Grave', type: 'Varejo / Chamadas', demoUrl: '/audio/junior-trindade-15.mp4', category: 'Grave' },
  { id: 15, name: 'GEOVANE DULTRA', tone: 'Sério / Confiável', type: 'Institucional / Notícias', demoUrl: '/audio/geovane-dultra-12.mp4', category: 'Narrativa' },
  { id: 16, name: 'MARRI GACRUX', tone: 'Versátil / Madura', type: 'Institucional / Narração', demoUrl: '/audio/marri-gacrux-gs.mp4', category: 'Institucional' },
  { id: 17, name: 'KELY VINDEMIATRIX', tone: 'Suave / Elegante', type: 'Comercial / Varejo', demoUrl: '/audio/kely-vindemiatrix-gs.mp4', category: 'Varejo' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [script, setScript] = useState('');
  const [orderStyle, setOrderStyle] = useState('Varejo (Impacto)');
  const [selectedService, setSelectedService] = useState('Spot Comercial');
  const [clientName, setClientName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<{ id: number; name: string; audio: HTMLAudioElement } | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoDuration, setDemoDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aiNiche, setAiNiche] = useState('');
  const [aiPromotion, setAiPromotion] = useState('');
  const [aiProduct, setAiProduct] = useState('');
  const [aiCity, setAiCity] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [voiceCategory, setVoiceCategory] = useState('Todos');

  const selectServiceAndScroll = (serviceName: string, style: string) => {
    setSelectedService(serviceName);
    setOrderStyle(style);
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const calculatedPrice = selectedService === 'Spot com Jingle (Completo)' ? 'R$ 100,00' : 'R$ 50,00';

  const generateScript = async () => {
    if (!aiNiche.trim() || !aiPromotion.trim()) {
      setAiError('Preencha ao menos o nicho e a promoção.');
      return;
    }
    setIsGeneratingScript(true);
    setAiError(null);
    setGeneratedScript('');
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: aiNiche, promotion: aiPromotion, product: aiProduct, city: aiCity }),
      });
      const data = await res.json();
      if (data.script) setGeneratedScript(data.script);
      else setAiError(data.error || 'Erro ao gerar roteiro. Tente novamente.');
    } catch {
      setAiError('Erro de conexão. Tente novamente.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const searchOrder = () => {
    setFoundOrder(null);
    setTrackingError(null);
    if (!trackingSearch.trim()) return;
    const allOrders: any[] = JSON.parse(localStorage.getItem('jp_orders') || '[]');
    const q = trackingSearch.trim();
    const found = allOrders.find(o =>
      o.id === q.toUpperCase() ||
      o.whatsapp?.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
    if (found) setFoundOrder(found);
    else setTrackingError('Pedido não encontrado. Verifique o ID ou WhatsApp.');
  };

  const ORDER_STEPS = ['Novo pedido', 'Em análise', 'Em produção', 'Aguardando aprovação', 'Finalizado', 'Entregue'];
  const STEP_LABELS = ['Pedido Recebido', 'Em Análise', 'Em Produção', 'Prévia Enviada', 'Finalizado', 'Entregue'];
  const STEP_ICONS = ['📥', '🔍', '🎙️', '✉️', '✅', '🎧'];

  const saveOrder = (newOrder: any) => {
    const existingOrders = JSON.parse(localStorage.getItem('jp_orders') || '[]');
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('jp_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('jp_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const sendToWhatsApp = () => {
    if (!clientName.trim() || !script.trim() || !whatsapp.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp e Script).");
      return;
    }

    setIsSubmitting(true);

    const orderId = `JP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder = {
      id: orderId,
      nomeCliente: clientName,
      whatsapp: whatsapp,
      script: script,
      vozSelecionada: selectedVoice.name,
      tipoServico: selectedService,
      estiloLocucao: orderStyle,
      valorEstimado: calculatedPrice,
      status: "Novo pedido",
      dataCriacao: new Date().toISOString(),
      origem: "Landing Page"
    };

    saveOrder(newOrder);
    
    const message = `Olá, tenho interesse em produzir um áudio com a JP PRODUÇÕES.%0A%0A` +
      `*Nome:* ${clientName}%0A` +
      `*WhatsApp:* ${whatsapp}%0A` +
      `*Voz escolhida:* ${selectedVoice.name}%0A` +
      `*Tipo de serviço:* ${selectedService}%0A` +
      `*Estilo da locução:* ${orderStyle}%0A` +
      `*Valor estimado:* ${calculatedPrice}%0A%0A` +
      `*Script:*%0A${script}%0A%0A` +
      `Quero confirmar esse orçamento.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=558192993013&text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  useEffect(() => {
    setMounted(true);
    const savedOrders = localStorage.getItem('jp_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-[#FF2D2D] selection:text-white noise-overlay relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#FF2D2D]/[0.03] blur-[140px] rounded-full animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#FF2D2D]/[0.03] blur-[140px] rounded-full animate-pulse-soft" style={{ animationDelay: '3s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-transparent">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 bg-[#FF2D2D] text-white rounded-lg flex items-center justify-center font-black italic tracking-tighter text-lg">
            JP
          </div>
          <span className="font-display font-medium text-xl tracking-tight text-white/90">
            JP PRODUÇÕES
          </span>
        </motion.div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-8">
            {[['Serviços','serviços'],['IA','ia'],['Vozes','vozes'],['Pedidos','pedidos'],['Studio','studio']].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                {label === 'IA' ? <span className="text-[#FF2D2D]/80 hover:text-[#FF2D2D]">{label}</span> : label}
              </a>
            ))}
          </div>

          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>


        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full px-6 py-8 md:hidden z-40"
            >
              <div className="glass-dark rounded-[2rem] border border-white/5 p-8 flex flex-col gap-6 shadow-2xl">
                {[['Serviços','serviços'],['IA','ia'],['Vozes','vozes'],['Pedidos','pedidos'],['Studio','studio']].map(([label, id], idx) => (
                  <motion.a
                    key={id}
                    href={`#${id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-display font-medium text-white/60 hover:text-[#FF2D2D] transition-colors flex items-center justify-between group"
                  >
                    {label}
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </motion.a>
                ))}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {isAdminView ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="min-h-screen pt-32 pb-20 px-6 md:px-12"
            >
              <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                  <div>
                    <span className="text-[#FF2D2D] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">PAINEL DO PRODUTOR</span>
                    <h2 className="text-5xl font-display font-medium text-white">Pedidos <span className="text-white/30">Recebidos.</span></h2>
                  </div>
                  <div className="flex gap-4">
                    <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Total de Pedidos</p>
                      <p className="text-2xl font-display font-medium text-white">{orders.length}</p>
                    </div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="glass rounded-[3rem] p-20 text-center border border-white/5">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <p className="text-white/40 font-medium">Nenhum pedido recebido ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {orders.map((order) => (
                      <motion.div 
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-dark rounded-[2rem] border border-white/5 p-8 relative group overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6">
                           <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                             order.status === 'Novo pedido' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                             order.status === 'Em produção' ? 'bg-[#FF2D2D]/10 text-[#FF2D2D] border-[#FF2D2D]/20' :
                             order.status === 'Finalizado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                             'bg-white/10 text-white/40 border-white/10'
                           }`}>
                             {order.status}
                           </div>
                        </div>

                        <div className="mb-8">
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">#ID {order.id}</p>
                          <h3 className="text-xl font-display font-medium text-white uppercase">{order.nomeCliente}</h3>
                          <p className="text-sm text-white/40 mt-1 font-medium italic">{order.whatsapp}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 bg-white/5 rounded-2xl">
                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Voz</p>
                            <p className="text-sm font-display font-medium text-white">{order.vozSelecionada}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl">
                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Palavras</p>
                            <p className="text-sm font-display font-medium text-white">{order.quantidadePalavras}</p>
                          </div>
                        </div>

                        <div className="mb-8">
                          <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-2">Script</p>
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl max-h-32 overflow-y-auto">
                            <p className="text-xs text-white/60 leading-relaxed font-medium whitespace-pre-wrap">{order.script}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-6 border-y border-white/5 mb-8">
                          <div>
                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Valor Estimado</p>
                            <p className="text-xl font-display font-medium text-[#FF2D2D]">{order.valorEstimado}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Data</p>
                             <p className="text-xs text-white/40 font-medium">{new Date(order.dataCriacao).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button 
                            onClick={() => {
                              const message = `Olá ${order.nomeCliente}, estou entrando em contato sobre seu pedido #${order.id} feito na JP PRODUÇÕES.`;
                              window.open(`https://wa.me/55${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-white/5"
                          >
                            <MessageSquare className="w-3 h-3 text-green-500" />
                            WhatsApp
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.script);
                            }}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-white/5"
                          >
                            Copiar Script
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Em produção')}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[#FF2D2D]/20 hover:text-[#FF2D2D] text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-white/5"
                          >
                            Em Produção
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Finalizado')}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-green-500/20 hover:text-green-500 text-white rounded-xl text-[10px] font-bold uppercase transition-all border border-white/5"
                          >
                            Finalizar
                          </button>
                        </div>

                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="w-full py-3 px-4 bg-[#FF2D2D]/10 hover:bg-[#FF2D2D]/20 text-[#FF2D2D] rounded-xl text-[10px] font-bold uppercase outline-none transition-all appearance-none text-center cursor-pointer"
                        >
                          <option value="Novo pedido" className="bg-[#111]">Alterar Status</option>
                          <option value="Em análise" className="bg-[#111]">Em análise</option>
                          <option value="Em produção" className="bg-[#111]">Em produção</option>
                          <option value="Aguardando aprovação" className="bg-[#111]">Aguardando aprovação</option>
                          <option value="Finalizado" className="bg-[#111]">Finalizado</option>
                          <option value="Entregue" className="bg-[#111]">Entregue</option>
                        </select>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
            </motion.div>
          )}
        </AnimatePresence>

        {/* GLOBAL DEMO PLAYER (FLOATING) */}
        <AnimatePresence>
          {activeDemo && (
            <motion.div 
              initial={{ opacity: 0, y: 100, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 100, x: "-50%" }}
              className="fixed bottom-8 left-1/2 z-[100] w-[90%] max-w-md"
            >
              <div className="glass-dark rounded-3xl p-3 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(255,45,45,0.1)] overflow-hidden">
                {/* Progress Bar (at the top edge) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(demoProgress / demoDuration) * 100}%` }}
                    className="h-full bg-[#FF2D2D] shadow-[0_0_10px_#FF2D2D]"
                  />
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-4 px-3 overflow-hidden">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#FF2D2D] shrink-0 border border-white/5">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-[#FF2D2D] uppercase font-black tracking-[0.2em] mb-1">Tocando Demo</p>
                      <p className="text-base font-display font-medium text-white truncate uppercase tracking-tight">{activeDemo.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pr-1">
                    <button 
                      onClick={() => {
                        if (isPlayingDemo) activeDemo.audio.pause();
                        else activeDemo.audio.play();
                        setIsPlayingDemo(!isPlayingDemo);
                      }}
                      className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-[#FF2D2D] hover:text-white transition-all shadow-xl"
                    >
                      {isPlayingDemo ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    <button 
                      onClick={() => {
                        activeDemo.audio.pause();
                        setActiveDemo(null);
                        setIsPlayingDemo(false);
                        setDemoProgress(0);
                      }}
                      className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PREMIUM HERO */}
        <section className="min-h-screen flex items-center pt-20 relative px-6 md:px-12 overflow-hidden">
          {/* Background Image Wrapper */}
          <div className="absolute inset-0 z-0">
            {/* The main atmospheric background */}
            <div className="absolute inset-0 bg-[#0a0a0a]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF2D2D]/[0.02] blur-[150px] rounded-full" />
            
            {/* Atmospheric gradient accent */}
            <div className="absolute right-0 top-0 w-full h-full lg:w-3/4 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#FF2D2D]/[0.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF2D2D]/[0.05] blur-[120px] rounded-full" />
            </div>
          </div>

          <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-20">
            
            {/* Left Content */}
            <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/40 text-[11px] font-medium tracking-wide mb-8"
              >
                <div className="w-1 h-1 bg-[#FF2D2D] rounded-full animate-pulse" />
                ÁUDIO DE ALTA PERFORMANCE
              </motion.div>
 
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight mb-8 leading-[1.05] text-gradient"
              >
                Áudio profissional para sua marca, <br className="hidden xl:block" />
                <span className="text-white/40 italic">em minutos.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "circOut" }}
                className="text-lg md:text-xl text-white/40 mb-10 leading-relaxed font-normal"
              >
                Criamos jingles e spots com qualidade de estúdio, prontos para usar no seu negócio. Transparência total e entrega recorde.
              </motion.p>
 
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.45, ease: "circOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary"
                >
                  Gerar meu áudio
                </button>
                <button className="btn-secondary">
                  Ouvir exemplos
                </button>
              </motion.div>
            </div>

            {/* Right Visual - Price Calculator Card */}
            <div className="relative group">
              <motion.div 
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 glass rounded-[2.5rem] p-8 md:p-10 shadow-3xl border border-white/[0.05]"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D]">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Orçamento Instantâneo</h3>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">Calculado por palavra</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 h-3 items-end">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [8, 16, 8] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-0.5 bg-[#FF2D2D] rounded-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Planos Fixos */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">Escolha seu plano</label>
                  {[
                    { name: 'Spot Padrão', value: 'Spot Comercial', price: 'R$ 50,00', badge: 'Mais vendido', badgeColor: 'bg-white/10 text-white/50', desc: 'Locução profissional pronto!' },
                    { name: 'Spot com Jingle', value: 'Spot com Jingle (Completo)', price: 'R$ 100,00', badge: 'Premium', badgeColor: 'bg-[#FF2D2D] text-white', desc: 'Spot completo para impressionar!' },
                  ].map((plan) => (
                    <button
                      key={plan.value}
                      onClick={() => setSelectedService(plan.value)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                        selectedService === plan.value
                          ? 'bg-[#FF2D2D]/10 border-[#FF2D2D]/40 shadow-[0_0_20px_rgba(255,45,45,0.1)]'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${plan.badgeColor}`}>{plan.badge}</span>
                        </div>
                        <p className="text-sm font-bold text-white">{plan.name}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{plan.desc}</p>
                      </div>
                      <p className={`text-2xl font-black tracking-tighter transition-colors ${selectedService === plan.value ? 'text-[#FF2D2D]' : 'text-white/60'}`}>{plan.price}</p>
                    </button>
                  ))}
                </div>

                {/* Micro Features */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="glass-dark rounded-xl p-3 flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/30">
                      <Mic2 className="w-3 h-3" />
                    </div>
                    <span className="text-[9px] font-bold text-white/40">Locução IA Dual</span>
                  </div>
                  <div className="glass-dark rounded-xl p-3 flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/30">
                      <Radio className="w-3 h-3" />
                    </div>
                    <span className="text-[9px] font-bold text-white/40">Mix Especializada</span>
                  </div>
                </div>
              </motion.div>

              {/* Aesthetic Accents */}
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#FF2D2D]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
            </div>
          </div>

          {/* Hero waveform */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-[3px] opacity-20 pointer-events-none">
            {[3,5,9,14,9,16,11,7,4,9,13,20,13,9,6,22,15,9,5,11,18,11,7,4,13,9,6,16,11,7,4,9,13,18,11,7,4,9,6,3].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [h, h * 2 + 4, h] }}
                transition={{ duration: 1.2 + (i % 7) * 0.15, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
                className="w-[3px] bg-[#FF2D2D] rounded-full"
                style={{ height: h }}
              />
            ))}
          </div>
        </section>

        {/* BRANDS MARQUEE (CREDIBILITY) */}
        <section className="py-12 border-y border-white/5 bg-black overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 md:gap-24 items-center px-12">
                {["REDE GLOBO", "SBT", "COCA-COLA", "BRADESCO", "VIVO", "IF_FOOD", "BMW"].map((brand) => (
                  <span key={brand} className="text-xl md:text-3xl font-black text-white/10 uppercase italic tracking-widest hover:text-[#FF2D2D]/40 transition-colors cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* AI SCRIPT GENERATOR */}
        <section id="ia" className="py-32 px-6 md:px-12 bg-[#060606] relative">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2D2D]/10 border border-[#FF2D2D]/20 text-[#FF2D2D] text-[10px] font-black tracking-[0.3em] uppercase mb-6">
                  <Sparkles className="w-3 h-3" />
                  IA GENERATIVA
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white leading-tight mb-4">
                  Gere seu roteiro <br /><span className="text-white/30">com inteligência artificial.</span>
                </h2>
                <p className="text-white/40 text-lg max-w-xl mx-auto">Descreva seu negócio e a IA cria um roteiro comercial profissional em segundos.</p>
              </div>

              <div className="glass rounded-[3rem] p-8 md:p-12 border border-white/[0.05] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF2D2D]/30 to-transparent" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Nicho / Negócio', placeholder: 'Ex: Pizzaria, Academia, Loja de roupas...', value: aiNiche, set: setAiNiche, required: true },
                    { label: 'Promoção / Oferta', placeholder: 'Ex: 50% off, Compre 1 leve 2...', value: aiPromotion, set: setAiPromotion, required: true },
                    { label: 'Produto', placeholder: 'Ex: Pizza Família, Camisetas...', value: aiProduct, set: setAiProduct, required: false },
                    { label: 'Cidade', placeholder: 'Ex: Recife, São Paulo...', value: aiCity, set: setAiCity, required: false },
                  ].map(({ label, placeholder, value, set, required }) => (
                    <div key={label} className="p-4 glass-dark rounded-2xl border border-white/5 focus-within:border-[#FF2D2D]/30 transition-all">
                      <label className="text-[9px] text-white/20 uppercase font-black tracking-widest block mb-2">
                        {label} {!required && <span className="text-white/10">(opcional)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && generateScript()}
                        className="bg-transparent text-white font-medium outline-none w-full placeholder:text-white/10 text-sm"
                      />
                    </div>
                  ))}
                </div>

                {aiError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FF2D2D] text-xs font-bold uppercase tracking-wider mb-4">{aiError}</motion.p>}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={generateScript}
                  disabled={isGeneratingScript}
                  className="w-full py-5 bg-[#FF2D2D] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_rgba(255,45,45,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGeneratingScript ? (
                    <>
                      <div className="flex gap-1 items-end h-5">
                        {[4,8,12,8,14,8,4,10,6,4].map((h, i) => (
                          <motion.div key={i} animate={{ height: [h, h * 1.8, h] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} className="w-1 bg-white rounded-full" style={{ height: h }} />
                        ))}
                      </div>
                      Gerando roteiro...
                    </>
                  ) : (
                    <><Cpu className="w-4 h-4" /> Gerar Roteiro com IA</>
                  )}
                </motion.button>

                <AnimatePresence>
                  {generatedScript && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[9px] text-[#FF2D2D] uppercase font-black tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3" /> Roteiro Gerado</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="p-6 bg-[#FF2D2D]/[0.04] border border-[#FF2D2D]/20 rounded-2xl relative">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF2D2D]/40 to-transparent rounded-t-2xl" />
                        <p className="text-white/85 leading-relaxed font-medium text-sm whitespace-pre-wrap">{generatedScript}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setScript(generatedScript); document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="mt-4 w-full py-4 glass-dark border border-[#FF2D2D]/30 text-[#FF2D2D] rounded-2xl font-bold uppercase tracking-[0.15em] text-sm hover:bg-[#FF2D2D]/10 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Usar esse roteiro no pedido
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES BENTO GRID */}
        <section id="serviços" className="py-32 px-6 md:px-12 bg-black relative">
          <div className="container mx-auto">
            <div className="mb-20 text-center lg:text-left">
              <span className="text-[#FF2D2D] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">CAPACIDADES</span>
              <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white leading-tight">Soluções de áudio de <br className="hidden md:block" /> <span className="text-white/30">alta performance.</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BentoCard 
                icon={<Mic2 className="w-6 h-6" />}
                title="Spot Comercial"
                desc="Locução impactante com trilhas exclusivas para converter seu ouvinte em cliente."
                span="md:col-span-2"
                image="https://images.unsplash.com/photo-1551522435-a13afa10f103?q=80&w=2670"
                onAction={() => selectServiceAndScroll('Spot Comercial', 'Varejo (Impacto)')}
              />
              <BentoCard 
                icon={<Music className="w-6 h-6" />}
                title="Jingles"
                desc="Melodias memoráveis que criam identidade sonora única."
                image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2670"
                onAction={() => selectServiceAndScroll('Jingles', 'Varejo (Impacto)')}
              />
              <BentoCard 
                icon={<Tv className="w-6 h-6" />}
                title="Institucional"
                desc="Vozes sóbrias para narrar a história e valores da sua empresa."
                image="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2670"
                onAction={() => selectServiceAndScroll('Institucional', 'Institucional (Sóbrio)')}
              />
              <BentoCard 
                icon={<Radio className="w-6 h-6" />}
                title="Espera Telefônica"
                desc="Sua empresa nunca para. Atendimento profissional enquanto o cliente aguarda."
                span="md:col-span-2"
                image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2670"
                onAction={() => selectServiceAndScroll('Espera Telefônica', 'Suave / Emocional')}
              />
            </div>
          </div>
        </section>

        {/* TALENT GALLERY */}
        <section id="vozes" className="py-32 px-6 md:px-12 bg-[#060606] relative">
          <div className="container mx-auto relative">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="text-[#FF2D2D] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">GALERIA DE TALENTOS</span>
                <h2 className="text-5xl md:text-6xl font-display font-medium tracking-tight text-white leading-tight">Vozes que trazem <br className="hidden md:block" /> <span className="text-white/30">sua marca à vida.</span></h2>
              </div>
              <div className="flex flex-col items-end gap-4">
                <p className="max-w-sm text-white/30 text-sm font-medium leading-relaxed text-right">
                  Curadoria rigorosa de profissionais com estúdios de nível mundial.
                </p>
                <div className="w-32 h-[1px] bg-white/10" />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {['Todos', 'Varejo', 'Institucional', 'Jovem', 'Narrativa', 'Grave'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVoiceCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    voiceCategory === cat
                      ? 'bg-[#FF2D2D] text-white shadow-[0_0_15px_rgba(255,45,45,0.4)]'
                      : 'glass text-white/40 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 pr-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {voices.filter(v => voiceCategory === 'Todos' || v.category === voiceCategory).map((voice, i) => (
                <div key={voice.id} className="flex-shrink-0 w-[300px] snap-start">
                <VoiceCard
                  voice={voice}
                  index={i} 
                  isSelected={selectedVoice.id === voice.id}
                  onSelect={() => setSelectedVoice(voice)}
                  isPlayingGlobal={activeDemo?.id === voice.id && isPlayingDemo}
                  progress={activeDemo?.id === voice.id ? (demoProgress / demoDuration) : 0}
                  onTogglePlay={(playing) => {
                    if (playing) {
                      if (activeDemo) {
                        activeDemo.audio.pause();
                        activeDemo.audio.onended = null;
                        activeDemo.audio.ontimeupdate = null;
                        activeDemo.audio.onloadedmetadata = null;
                        activeDemo.audio.onerror = null;
                      }
                      
                      const audio = new Audio();
                      audio.src = encodeURI(voice.demoUrl);
                      
                      audio.onerror = (e) => {
                        console.error("Erro ao carregar áudio:", voice.demoUrl, e);
                        setError(`Não foi possível carregar o áudio de ${voice.name}. Verifique se o arquivo existe.`);
                        setIsPlayingDemo(false);
                        setActiveDemo(null);
                      };
                      
                      audio.onended = () => {
                        setIsPlayingDemo(false);
                        setActiveDemo(null);
                        setDemoProgress(0);
                      };
                      
                      audio.ontimeupdate = () => {
                        setDemoProgress(audio.currentTime);
                      };
                      
                      audio.onloadedmetadata = () => {
                        setDemoDuration(audio.duration);
                      };
                      
                      // Play with a promise to catch play() errors (like auto-play blocks)
                      audio.play().catch(err => {
                        console.error("Playback failed:", err);
                        setIsPlayingDemo(false);
                        setActiveDemo(null);
                      });
                      
                      setActiveDemo({ id: voice.id, name: voice.name, audio });
                      setIsPlayingDemo(true);
                      setDemoProgress(0);
                    } else {
                      if (activeDemo?.audio) {
                        activeDemo.audio.pause();
                      }
                      setIsPlayingDemo(false);
                    }
                  }}
                />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ORDER FORM SECTION */}
        <section id="studio" className="py-32 px-6 md:px-12 bg-black relative">
          <div className="container mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="glass rounded-[3rem] p-8 md:p-16 border border-white/[0.05] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Waves className="w-64 h-64 text-[#FF2D2D]" />
              </div>

              <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
                <div className="w-full lg:w-1/2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D2D]/10 text-[#FF2D2D] text-[10px] font-bold tracking-[0.2em] mb-6 uppercase">
                    Solicitar Orçamento
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-6 leading-tight">
                    Escolha as vozes e <br /> <span className="text-white/30">feche seu pedido.</span>
                  </h2>
                  <p className="text-white/40 mb-10 leading-relaxed font-medium">
                    Escolha a voz desejada na galeria acima, ajuste a quantidade de palavras no topo e preencha os detalhes abaixo. Nossa equipe entrará em contato via WhatsApp com a sua prévia profissional.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 glass-dark rounded-2xl border border-white/5">
                      <div className="w-12 h-12 bg-[#FF2D2D]/20 rounded-xl flex items-center justify-center text-[#FF2D2D]">
                        <Mic2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1 leading-none">Locutor Selecionado</p>
                        <p className="text-lg font-display font-medium text-white">{selectedVoice.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-3">
                        <label className="text-[10px] text-white/20 uppercase font-black tracking-widest block">Escolha o Plano</label>
                        {[
                          { name: 'Spot Padrão', value: 'Spot Comercial', price: 'R$ 50,00', badge: 'Mais vendido', badgeColor: 'bg-white/10 text-white/50', desc: 'Locução profissional pronto!' },
                          { name: 'Spot com Jingle', value: 'Spot com Jingle (Completo)', price: 'R$ 100,00', badge: 'Premium', badgeColor: 'bg-[#FF2D2D] text-white', desc: 'Spot completo para impressionar!' },
                        ].map((plan) => (
                          <button
                            key={plan.value}
                            type="button"
                            onClick={() => setSelectedService(plan.value)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                              selectedService === plan.value
                                ? 'bg-[#FF2D2D]/10 border-[#FF2D2D]/40 shadow-[0_0_20px_rgba(255,45,45,0.1)]'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${plan.badgeColor}`}>{plan.badge}</span>
                              </div>
                              <p className="text-sm font-bold text-white">{plan.name}</p>
                              <p className="text-[10px] text-white/40 mt-0.5">{plan.desc}</p>
                            </div>
                            <p className={`text-2xl font-black tracking-tighter transition-colors ${selectedService === plan.value ? 'text-[#FF2D2D]' : 'text-white/50'}`}>{plan.price}</p>
                          </button>
                        ))}
                      </div>

                      <div className="sm:col-span-2 p-4 glass-dark rounded-2xl border border-white/5">
                         <label className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2 block">Nome do Cliente (Obrigatório)</label>
                         <input 
                            type="text" 
                            placeholder="Ex: João Silva"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="bg-transparent text-white font-display font-medium outline-none w-full placeholder:text-white/10"
                            required
                         />
                      </div>
                      <div className="sm:col-span-2 p-4 glass-dark rounded-2xl border border-white/5">
                         <label className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2 block">WhatsApp (Obrigatório)</label>
                         <input 
                            type="text" 
                            placeholder="Ex: (81) 99999-9999"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="bg-transparent text-white font-display font-medium outline-none w-full placeholder:text-white/10"
                            required
                         />
                      </div>
                    </div>

                    <div className="p-1 glass-dark rounded-[2rem] border border-white/5 focus-within:border-[#FF2D2D]/30 transition-all">
                      <textarea 
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Cole seu texto ou descreva como deseja o áudio..."
                        className="w-full h-40 bg-transparent p-6 text-white/80 placeholder:text-white/10 outline-none resize-none font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap className="w-32 h-32 text-white" />
                     </div>
                     
                     <h3 className="text-2xl font-display font-medium text-white mb-2">Resumo do Pedido</h3>
                     <p className="text-white/30 text-sm mb-10">Confira os valores estimados antes de enviar.</p>

                     <div className="space-y-3 mb-10">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                           <span className="text-white/40 text-sm">Tipo de Serviço</span>
                           <div className="flex items-center gap-2">
                             {selectedService === 'Spot com Jingle (Completo)' && (
                               <span className="text-[7px] bg-[#FF2D2D] text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Premium</span>
                             )}
                             <span className="text-white font-display font-medium text-sm text-right max-w-[160px] leading-tight">{selectedService}</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                           <span className="text-white/40 text-sm">Valor Estimado</span>
                           <motion.span
                             key={calculatedPrice}
                             initial={{ scale: 0.9, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="text-2xl font-display font-medium text-[#FF2D2D]"
                           >{calculatedPrice}</motion.span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                           <span className="text-white/40 text-sm">Prazo de Entrega</span>
                           <span className="font-black uppercase tracking-wider text-sm text-[#FF2D2D]" style={{ textShadow: '0 0 10px rgba(255,45,45,0.6)' }}>EM ATÉ 2 HORAS</span>
                        </div>
                        {clientName && (
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-white/40 text-sm">Cliente</span>
                             <span className="text-white font-display font-medium">{clientName}</span>
                          </div>
                        )}
                        {whatsapp && (
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-white/40 text-sm">WhatsApp</span>
                             <span className="text-white font-display font-medium">{whatsapp}</span>
                          </div>
                        )}
                     </div>

                     <AnimatePresence>
                       {error && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="mb-6 p-4 bg-[#FF2D2D]/10 border border-[#FF2D2D]/20 rounded-xl overflow-hidden"
                         >
                           <p className="text-xs text-[#FF2D2D] font-bold uppercase tracking-wider">{error}</p>
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={sendToWhatsApp}
                       disabled={isSubmitting}
                       className="w-full flex items-center justify-center gap-4 py-6 bg-[#FF2D2D] text-white rounded-2xl text-sm font-bold uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,45,45,0.3)] hover:brightness-110 transition-all font-sans"
                     >
                       <MessageSquare className="w-5 h-5" />
                       {isSubmitting ? 'Enviando...' : 'Pedir via WhatsApp'}
                     </motion.button>

                     <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                           A produção física só inicia após a sua aprovação final.
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* RASTREAMENTO DE PEDIDO */}
        <section id="pedidos" className="py-32 px-6 md:px-12 bg-[#060606] relative">
          <div className="container mx-auto max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-[#FF2D2D] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">RASTREAMENTO</span>
              <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white leading-tight">
                Acompanhe seu <span className="text-white/30">pedido.</span>
              </h2>
              <p className="text-white/40 text-lg mt-4">Informe o ID do pedido ou seu WhatsApp para ver o status.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-[2rem] p-6 md:p-8 border border-white/[0.05] mb-6">
              <div className="flex gap-3">
                <div className="flex-1 p-4 glass-dark rounded-2xl border border-white/5 focus-within:border-[#FF2D2D]/30 transition-all">
                  <input
                    type="text"
                    placeholder="Ex: JP-ABC123 ou (81) 99999-9999"
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                    className="bg-transparent text-white font-medium outline-none w-full placeholder:text-white/20 text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={searchOrder}
                  className="px-6 py-4 bg-[#FF2D2D] text-white rounded-2xl font-bold uppercase tracking-wider text-sm shadow-[0_10px_30px_rgba(255,45,45,0.3)] hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </motion.button>
              </div>
              {trackingError && <p className="text-[#FF2D2D] text-xs font-bold uppercase tracking-wider mt-3">{trackingError}</p>}
            </motion.div>

            <AnimatePresence>
              {foundOrder && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-[2rem] p-8 border border-white/[0.05]">
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-white/5">
                    <div>
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">{foundOrder.id}</p>
                      <h3 className="text-2xl font-display font-medium text-white uppercase">{foundOrder.nomeCliente}</h3>
                      <p className="text-sm text-white/40 mt-1">{foundOrder.tipoServico} · {foundOrder.valorEstimado}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border self-start ${
                      foundOrder.status === 'Novo pedido' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      foundOrder.status === 'Em produção' ? 'bg-[#FF2D2D]/10 text-[#FF2D2D] border-[#FF2D2D]/20' :
                      ['Finalizado','Entregue'].includes(foundOrder.status) ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      'bg-white/10 text-white/40 border-white/10'
                    }`}>{foundOrder.status}</div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-5 mb-8">
                    {ORDER_STEPS.map((stepStatus, i) => {
                      const currentIdx = ORDER_STEPS.indexOf(foundOrder.status);
                      const isActive = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={stepStatus} className="flex items-center gap-4">
                          <motion.div
                            animate={isCurrent ? { boxShadow: ['0 0 0px rgba(255,45,45,0)', '0 0 16px rgba(255,45,45,0.5)', '0 0 0px rgba(255,45,45,0)'] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 transition-all ${isActive ? 'bg-[#FF2D2D]/20' : 'bg-white/5'}`}
                          >
                            <span>{STEP_ICONS[i]}</span>
                          </motion.div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-white/20'}`}>{STEP_LABELS[i]}</p>
                            {isCurrent && <p className="text-[10px] text-[#FF2D2D] uppercase font-black tracking-widest mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Status atual</p>}
                          </div>
                          {isActive && <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#FF2D2D] animate-pulse' : 'bg-[#FF2D2D]/30'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="pt-6 border-t border-white/5">
                    {(() => {
                      const pct = Math.round((ORDER_STEPS.indexOf(foundOrder.status) + 1) / ORDER_STEPS.length * 100);
                      return (
                        <>
                          <div className="flex justify-between text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">
                            <span>Progresso</span><span>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, ease: 'circOut' }}
                              className="h-full bg-[#FF2D2D] rounded-full shadow-[0_0_10px_rgba(255,45,45,0.6)]"
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-40 px-6">
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-32 text-center relative overflow-hidden"
          >
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#FF2D2D]/10 blur-[120px] rounded-full pointer-events-none" />
            
            <h2 className="text-4xl md:text-7xl font-display font-medium tracking-tighter mb-8 leading-tight">
              Sua marca merece <br className="hidden md:block" /> <span className="text-white/30">som de alto nível.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium">
              Sua marca merece ser ouvida. Comece agora seu primeiro projeto e sinta a diferença que uma produção profissional faz nos seus resultados.
            </p>
            
            <button 
              onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary scale-110"
            >
              Fazer meu pedido agora
            </button>
          </motion.div>
        </section>
      </main>

      <footer className="py-32 px-6 md:px-12 border-t border-white/[0.05] bg-black">
         <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-32">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-[#FF2D2D] text-white rounded-lg flex items-center justify-center font-black italic tracking-tighter text-base">
                    JP
                  </div>
                  <span className="font-display font-medium text-xl tracking-tight text-white/90">JP PRODUÇÕES</span>
                </div>
                <p className="text-white/30 max-w-sm leading-relaxed text-sm font-medium">
                  Elevando o padrão da comunicação sonora global através de tecnologia e talento excepcional.
                </p>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/20 mb-8">PRODUTO</h4>
                <div className="flex flex-col gap-4">
                  {['Funcionalidades', 'Locutores', 'Preços', 'Exemplos'].map(h => (
                    <a key={h} href="#" className="text-sm font-medium text-white/40 hover:text-white transition-colors">{h}</a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/20 mb-8">CONTATO</h4>
                <div className="flex flex-col gap-4 text-sm font-medium text-white/40 transition-colors uppercase">
                  <p>contato@jpproducoes.com</p>
                  <p>+55 81 9299-3013</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-white/[0.05]">
              <div className="text-xs font-medium text-white/20 uppercase tracking-widest">© 2026 JP PRODUÇÕES. TODOS OS DIREITOS RESERVADOS.</div>
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setIsAdminView(!isAdminView)}
                  className="text-[10px] font-bold text-white/20 hover:text-[#FF2D2D] transition-colors tracking-widest uppercase"
                >
                  {isAdminView ? 'Ver Landing Page' : 'Área do Produtor'}
                </button>
                <div className="h-4 w-px bg-white/10" />
                <a href="#" className="text-[10px] font-bold text-white/20 hover:text-[#FF2D2D] transition-colors tracking-widest">INSTAGRAM</a>
                <a href="#" className="text-[10px] font-bold text-white/20 hover:text-[#FF2D2D] transition-colors tracking-widest">LINKEDIN</a>
                <a href="https://wa.me/558192993013" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-white/20 hover:text-[#FF2D2D] transition-colors tracking-widest">WHATSAPP</a>
              </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

function BentoCard({ icon, title, desc, span = "", image = "", onAction }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`glass rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden group min-h-[300px] md:min-h-[350px] flex flex-col justify-between transition-all duration-500 hover:border-white/20 ${span}`}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-[#FF2D2D]/[0.03] group-hover:to-[#FF2D2D]/[0.06] transition-all duration-700" />
      </div>
      
      <div className="relative z-10 text-center lg:text-left mx-auto lg:mx-0 w-full mb-8">
        <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-[#FF2D2D] mb-8 mx-auto lg:mx-0 group-hover:bg-[#FF2D2D] group-hover:text-white transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,45,45,0.3)]">
          {icon}
        </div>
        <h3 className="text-2xl font-display font-medium text-white mb-3">
          {title}
        </h3>
        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-full mx-auto lg:mx-0">
          {desc}
        </p>
      </div>
      
      <div className="relative z-10 flex items-end justify-center lg:justify-start w-full">
         <button 
           onClick={onAction}
           className="px-8 py-4 bg-white/5 hover:bg-[#FF2D2D] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:border-transparent transition-all shadow-lg overflow-hidden group/btn relative"
         >
           <span className="relative z-10">Fazer Pedido</span>
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
         </button>
      </div>
    </motion.div>
  );
}

function VoiceCard({ 
  voice, 
  index, 
  isSelected, 
  onSelect,
  isPlayingGlobal,
  progress = 0,
  onTogglePlay
}: { 
  voice: any, 
  index: number, 
  isSelected?: boolean, 
  onSelect?: () => void,
  isPlayingGlobal?: boolean,
  progress?: number,
  onTogglePlay?: (playing: boolean) => void
}) {
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePlay) {
      onTogglePlay(!isPlayingGlobal);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      transition={{ delay: index * 0.05 }}
      className={`p-8 glass rounded-[2.5rem] transition-all group flex flex-col gap-8 cursor-pointer relative hover:bg-white/[0.04] ${isSelected ? 'border-[#FF2D2D] bg-[#FF2D2D]/5 shadow-[0_0_40px_rgba(255,45,45,0.1)]' : 'hover:border-white/20'}`}
    >
      <div className="flex justify-between items-start w-full relative z-10">
          <div className="flex gap-2 items-center">
              <div className={`w-1.5 h-1.5 rounded-full ${isPlayingGlobal ? 'bg-[#FF2D2D] animate-pulse shadow-[0_0_10px_rgba(255,45,45,0.5)]' : isSelected ? 'bg-[#FF2D2D]' : 'bg-white/10'}`} />
              <Mic2 className={`w-5 h-5 transition-colors ${isSelected ? 'text-[#FF2D2D]' : 'text-white/20 group-hover:text-[#FF2D2D]'}`} />
          </div>
          <span className={`px-3 py-1 glass rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-[#FF2D2D] border-[#FF2D2D]/20 shadow-[0_0_20px_rgba(255,45,45,0.1)]' : 'text-white/30 group-hover:text-[#FF2D2D]/70'}`}>{voice.tone}</span>
      </div>
      
      <div className="flex flex-col gap-1 relative z-10">
          <h3 className={`text-2xl font-display font-medium transition-colors ${isSelected ? 'text-white' : 'text-white group-hover:text-[#FF2D2D]'}`}>
            {voice.name}
          </h3>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{voice.type}</p>
      </div>

      {/* Realistic Waveform Visualizer */}
      <div className="flex items-center gap-1 h-12 w-full px-1 mb-2 relative">
          {isPlayingGlobal && (
             <div className="absolute inset-0 bg-[#FF2D2D]/5 blur-xl pointer-events-none" />
          )}
          {Array.from({ length: 32 }).map((_, i) => {
              const h = [2, 4, 3, 6, 8, 4, 2, 7, 5, 3, 9, 4, 2, 6, 8, 3, 5, 7, 4, 2, 6, 9, 3, 5, 2, 8, 4, 6, 3, 7, 2, 4][i];
              const barProgress = i / 32;
              const isPassed = progress > barProgress;

              return (
              <motion.div 
                key={i}
                animate={isPlayingGlobal ? {
                    height: [h * 1.5 + 4, h * 3 + 8, h * 1.5 + 4],
                    opacity: [0.3, 1, 0.3],
                } : { 
                  height: h * 1.5 + 4,
                  opacity: isSelected ? 0.4 : 0.1
                }}
                transition={isPlayingGlobal ? { 
                  repeat: Infinity, 
                  duration: 0.8 + (Math.random() * 0.4), 
                  delay: i * 0.05,
                  ease: "easeInOut"
                } : { duration: 0.3 }}
                className={`flex-1 rounded-full transition-all duration-300 ${isPlayingGlobal && isPassed ? 'bg-[#FF2D2D]' : isSelected ? 'bg-[#FF2D2D]/40' : 'bg-white/10'}`}
                style={{ height: h * 2 }}
              />
          )})}
      </div>
      
      <motion.button
        onClick={togglePlay}
        className={`flex items-center justify-center gap-4 py-4 rounded-2xl border transition-all w-full ${isSelected ? 'bg-[#FF2D2D] border-transparent text-white' : 'bg-white/5 border-white/[0.05] group-hover:border-[#FF2D2D]/30 group-hover:bg-[#FF2D2D]/5 text-white/40'}`}
      >
        <div className={`w-8 h-8 glass rounded-full flex items-center justify-center ${isSelected ? 'text-white bg-black/20' : 'text-white'}`}>
          {isPlayingGlobal ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-white' : 'group-hover:text-white'}`}>{isPlayingGlobal ? 'Tocando' : isSelected ? 'Selecionado' : 'Ouvir Demo'}</span>
      </motion.button>
    </motion.div>
  );
}
