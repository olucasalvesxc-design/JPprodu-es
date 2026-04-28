import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Mail, MessageCircle, FileText, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function Support() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText('suporte@spottunner.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const faqs = [
    { q: 'Como funciona o cálculo de preço?', a: 'O preço é calculado dinamicamente pelo número de caracteres do seu texto. A base é R$35 para 70 caracteres, escalando proporcionalmente.' },
    { q: 'Qual o prazo de entrega?', a: 'Pedidos normais são entregues em até 24 horas úteis. Com o extra de urgência, em até 6 horas.' },
    { q: 'Como funciona o sistema de créditos?', a: 'Você pode recarregar créditos e usá-los nos pedidos. Créditos não expiram.' },
    { q: 'Posso pedir revisão da locução?', a: 'Sim! Adicione o extra "Revisão de Roteiro" ao criar o pedido para ter revisão gratuita inclusa.' },
    { q: 'Como recebo o áudio?', a: 'Quando seu pedido for marcado como "Entregue", um link de download aparecerá no seu painel.' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Suporte</h1>
          <p className="text-gray-400 mb-8">Como podemos te ajudar?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <a
              href="mailto:suporte@spottunner.com"
              className="card hover:border-brand-500 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Mail size={22} className="text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Email</p>
                <p className="text-sm text-gray-400">suporte@spottunner.com</p>
              </div>
              <ExternalLink size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
            </a>

            <button
              onClick={copyEmail}
              className="card hover:border-brand-500 transition-all flex items-center gap-4 group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <MessageCircle size={22} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Copiar e-mail</p>
                <p className="text-sm text-gray-400">Para usar no seu cliente</p>
              </div>
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-600 group-hover:text-green-400 transition-colors" />}
            </button>
          </div>

          {/* Informações do usuário */}
          <div className="card mb-8">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <FileText size={18} />
              Suas informações de suporte
            </h2>
            <div className="bg-dark-600 rounded-xl p-4 text-sm space-y-2">
              <p><span className="text-gray-400">Nome: </span>{user?.name}</p>
              <p><span className="text-gray-400">Email: </span>{user?.email}</p>
              <p><span className="text-gray-400">ID da conta: </span>#{user?.id}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Ao entrar em contato, informe seu ID de conta para agilizar o atendimento.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-bold text-lg mb-5">Perguntas frequentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-sm">{question}</span>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <p className="mt-3 pt-3 border-t border-dark-500 text-sm text-gray-400 leading-relaxed animate-fade-in">
          {answer}
        </p>
      )}
    </div>
  );
}
