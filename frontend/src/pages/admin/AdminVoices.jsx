import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AudioPlayer from '../../components/AudioPlayer';
import { voiceAPI } from '../../services/api';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Upload, X, Save } from 'lucide-react';

function VoiceModal({ voice, onClose, onSave }) {
  const [form, setForm] = useState({
    name: voice?.name || '',
    description: voice?.description || '',
    category: voice?.category || 'geral',
    gender: voice?.gender || 'neutro',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('audio', file);

      if (voice) {
        await voiceAPI.update(voice.id, fd);
      } else {
        await voiceAPI.create(fd);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-700 rounded-2xl border border-dark-500 w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-dark-500">
          <h2 className="font-bold text-lg">{voice ? 'Editar voz' : 'Nova voz'}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="label">Nome da voz *</label>
            <input className="input" placeholder="Ex: Ana Lima" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Descrição</label>
            <input className="input" placeholder="Ex: Voz feminina, suave e profissional" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['geral', 'comercial', 'institucional', 'digital', 'corporativo', 'entretenimento'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gênero</label>
              <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="neutro">Neutro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Áudio demo</label>
            <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 text-center hover:border-brand-500 transition-colors">
              <input type="file" accept="audio/*" className="hidden" id="audio-upload"
                onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-400">
                  {file ? file.name : voice?.audio_url ? 'Substituir áudio' : 'Clique para fazer upload'}
                </span>
              </label>
            </div>
            {voice?.audio_url && !file && <AudioPlayer src={voice.audio_url} label="Áudio atual" compact />}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | voice object
  const [deleting, setDeleting] = useState(null);

  function load() {
    voiceAPI.all().then(({ data }) => setVoices(data.voices)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(voice) {
    const fd = new FormData();
    fd.append('active', !voice.active);
    await voiceAPI.update(voice.id, fd);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta voz? Esta ação não pode ser desfeita.')) return;
    setDeleting(id);
    await voiceAPI.delete(id).catch(() => {});
    setDeleting(null);
    load();
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      {modal !== null && (
        <VoiceModal
          voice={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Vozes</h1>
              <p className="text-gray-400 mt-1">{voices.length} voz(es) cadastrada(s)</p>
            </div>
            <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Nova voz
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="card h-40 animate-pulse bg-dark-600" />)}
            </div>
          ) : voices.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <p className="mb-4">Nenhuma voz cadastrada</p>
              <button onClick={() => setModal('new')} className="btn-primary">Adicionar primeira voz</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {voices.map(voice => (
                <div key={voice.id} className={`card transition-all ${!voice.active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{voice.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{voice.category} · {voice.gender}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(voice)} className="btn-ghost p-1.5">
                        {voice.active
                          ? <ToggleRight size={22} className="text-green-400" />
                          : <ToggleLeft size={22} className="text-gray-500" />}
                      </button>
                      <button onClick={() => setModal(voice)} className="btn-ghost p-1.5">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(voice.id)}
                        disabled={deleting === voice.id}
                        className="btn-ghost p-1.5 hover:text-red-400"
                      >
                        {deleting === voice.id
                          ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                          : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                  {voice.description && <p className="text-sm text-gray-400 mb-3">{voice.description}</p>}
                  <AudioPlayer src={voice.audio_url} label={voice.audio_url ? 'Ouvir demo' : 'Sem demo'} compact />
                  <div className={`mt-3 text-xs font-medium ${voice.active ? 'text-green-400' : 'text-gray-500'}`}>
                    {voice.active ? '● Ativa' : '○ Inativa'}
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
