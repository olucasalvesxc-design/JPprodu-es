import { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPlayer({ src, label, compact = false }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  function toggle() {
    if (!src) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }

  function onEnded() {
    setPlaying(false);
    setProgress(0);
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
        <button
          onClick={toggle}
          disabled={!src}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            src
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm'
              : 'bg-dark-500 text-gray-600 cursor-not-allowed'
          }`}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        {label && <span className="text-sm text-gray-300">{label}</span>}
      </div>
    );
  }

  return (
    <div className="bg-dark-600 rounded-xl p-4 flex items-center gap-4">
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
      <button
        onClick={toggle}
        disabled={!src}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
          src
            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm'
            : 'bg-dark-500 text-gray-600 cursor-not-allowed'
        }`}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <div className="flex-1 min-w-0">
        {label && <p className="text-sm font-medium text-white mb-1 truncate">{label}</p>}
        <div
          className="h-1.5 bg-dark-400 rounded-full cursor-pointer overflow-hidden"
          onClick={src ? seek : undefined}
        >
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Volume2 size={16} className="text-gray-500 shrink-0" />
    </div>
  );
}
