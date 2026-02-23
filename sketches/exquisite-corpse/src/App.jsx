import { useState, useEffect, useCallback } from 'react';
import Gallery from './components/Gallery';
import SingleView from './components/SingleView';
import Controls from './components/Controls';
import { generateHash } from './engine/prng.js';
import { STYLES } from './engine/styles.js';

export default function App() {
  const [chain, setChain] = useState(() => [generateHash(), generateHash(), generateHash()]);
  const [view, setView] = useState('gallery');
  const [styleKey, setStyleKey] = useState('ink');
  const style = STYLES[styleKey];

  const handleKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'r' || e.key === 'R') {
      setChain((prev) => [...prev, generateHash()]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const bgClass = styleKey === 'circuit' ? 'bg-[#08080f]' : 'bg-ink';

  return (
    <div className={`min-h-screen flex flex-col text-paper ${bgClass} transition-colors duration-500`}>
      <header className="px-6 py-4 border-b border-paper/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-wide">
              Exquisite Corpse
            </h1>
            <p className="font-mono text-xs text-paper/40 mt-0.5">
              Collaborative generative chain &middot; {style.description}
            </p>
          </div>
          <div className="font-mono text-[10px] text-paper/30">v2.1.0</div>
        </div>
      </header>

      <div className="px-6 py-3 border-b border-paper/10">
        <Controls
          chain={chain} setChain={setChain}
          view={view} setView={setView}
          styleKey={styleKey} setStyleKey={setStyleKey}
        />
      </div>

      <main className="flex-1 px-6 py-6 flex items-center justify-center">
        {view === 'gallery' ? (
          <Gallery chain={chain} renderer={style.renderer} />
        ) : (
          <SingleView chain={chain} setChain={setChain} renderer={style.renderer} />
        )}
      </main>

      <footer className="px-6 py-3 border-t border-paper/10">
        <div className="flex justify-between font-mono text-[10px] text-paper/30">
          <span>R = add piece</span>
          <span>Hash-pair edge matching &middot; sfc32 PRNG</span>
        </div>
      </footer>
    </div>
  );
}
