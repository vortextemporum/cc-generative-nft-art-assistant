import { useState, useEffect, useCallback } from 'react';
import Gallery from './components/Gallery';
import SingleView from './components/SingleView';
import Controls from './components/Controls';
import { generateHash } from './engine/prng.js';

export default function App() {
  const [chain, setChain] = useState(() => [generateHash(), generateHash(), generateHash()]);
  const [view, setView] = useState('gallery');

  // Keyboard shortcuts
  const handleKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'r' || e.key === 'R') {
      setChain((prev) => [...prev, generateHash()]);
    }
    if (e.key === 's' || e.key === 'S') {
      document.querySelector('[data-action="save"]')?.click();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-paper/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-wide">
              Exquisite Corpse
            </h1>
            <p className="font-mono text-xs text-paper/40 mt-0.5">
              Collaborative generative chain &middot; monochrome ink
            </p>
          </div>
          <div className="font-mono text-[10px] text-paper/30">
            v2.0.0
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-paper/10">
        <Controls chain={chain} setChain={setChain} view={view} setView={setView} />
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-6 flex items-center justify-center">
        {view === 'gallery' ? (
          <Gallery chain={chain} />
        ) : (
          <SingleView chain={chain} setChain={setChain} />
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-paper/10">
        <div className="flex justify-between font-mono text-[10px] text-paper/30">
          <span>R = add piece &middot; S = save</span>
          <span>Hash-pair edge matching &middot; sfc32 PRNG</span>
        </div>
      </footer>
    </div>
  );
}
