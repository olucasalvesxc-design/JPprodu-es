import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { settingsAPI } from '../../services/api';
import { Save, Settings, DollarSign, Zap, Music, FileText, Info } from 'lucide-react';

const settingFields = [
  {
    group: 'Precificação Base',
    icon: DollarSign,
    fields: [
      { key: 'price_base', label: 'Preço base (R$)', desc: 'Valor cobrado pelo número base de caracteres', min: 1, step: 0.5 },
      { key: 'price_chars_base', label: 'Caracteres base', desc: 'Quantidade de caracteres que corresponde ao preço base', min: 1, step: 1 },
      { key: 'min_price', label: 'Preço mínimo (R$)', desc: 'Valor mínimo cobrado por qualquer pedido', min: 1, step: 0.5 },
    ],
  },
  {
    group: 'Extras',
    icon: Zap,
    fields: [
      { key: 'extra_soundtrack', label: 'Trilha sonora (R$)', desc: 'Adicional para incluir música de fundo', min: 0, step: 0.5, icon: Music },
      { key: 'extra_urgency', label: 'Urgência (R$)', desc: 'Adicional para entrega prioritária', min: 0, step: 0.5, icon: Zap },
      { key: 'extra_revision', label: 'Revisão de roteiro (R$)', desc: 'Adicional para revisão do texto', min: 0, step: 0.5, icon: FileText },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settingsAPI.get()
      .then(({ data }) => {
        setSettings(data.settings);
        setForm(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await settingsAPI.update(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const priceBase = parseFloat(form.price_base || 35);
  const charsBase = parseFloat(form.price_chars_base || 70);
  const minPrice = parseFloat(form.min_price || 35);

  const examples = [
    { label: '100 chars', chars: 100 },
    { label: '200 chars', chars: 200 },
    { label: '500 chars', chars: 500 },
  ].map(e => ({
    ...e,
    price: Math.max((e.chars / charsBase) * priceBase, minPrice).toFixed(2),
  }));

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Settings size={20} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configurações de Preços</h1>
              <p className="text-gray-400 text-sm">As alterações afetam todos os novos pedidos globalmente</p>
            </div>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 text-green-400 text-sm flex items-center gap-2">
              ✅ Configurações salvas com sucesso! Todos os novos pedidos usarão os novos valores.
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">{error}</div>
          )}

          {/* Preview dinâmico */}
          <div className="card mb-6 bg-brand-900/20 border-brand-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-brand-400" />
              <p className="text-sm font-medium text-brand-400">Preview em tempo real</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {examples.map(ex => (
                <div key={ex.label} className="bg-dark-700 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">{ex.label}</p>
                  <p className="font-bold text-brand-400 mt-1">R$ {ex.price.replace('.', ',')}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Fórmula: (caracteres ÷ {charsBase}) × R${priceBase.toFixed(2)} | Mínimo: R${minPrice.toFixed(2)}
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2].map(i => <div key={i} className="card h-40 animate-pulse bg-dark-600" />)}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {settingFields.map(group => (
                <div key={group.group} className="card">
                  <div className="flex items-center gap-2 mb-5">
                    <group.icon size={18} className="text-brand-400" />
                    <h2 className="font-bold">{group.group}</h2>
                  </div>
                  <div className="space-y-4">
                    {group.fields.map(field => (
                      <div key={field.key}>
                        <label className="label">{field.label}</label>
                        <input
                          type="number"
                          className="input"
                          min={field.min}
                          step={field.step}
                          value={form[field.key] || ''}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{field.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Importante:</strong> Os valores são calculados dinamicamente no backend.
                  Não há produtos fixos — alterar aqui atualiza todos os cálculos automaticamente.
                </span>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base">
                {saving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar configurações
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
