import { generateHash } from '../engine/prng.js';
import { STYLES, STYLE_KEYS } from '../engine/styles.js';

export default function Controls({ chain, setChain, view, setView, styleKey, setStyleKey }) {
  const addPiece = () => setChain((prev) => [...prev, generateHash()]);

  const removeLast = () => {
    if (chain.length > 1) setChain((prev) => prev.slice(0, -1));
  };

  const regenerateAll = () => setChain(chain.map(() => generateHash()));

  const saveGallery = () => {
    const pieces = document.querySelectorAll('.gallery-piece canvas');
    if (pieces.length === 0) return;
    const totalWidth = pieces.length * 1024;
    const merged = document.createElement('canvas');
    merged.width = totalWidth;
    merged.height = 1024;
    const ctx = merged.getContext('2d');
    pieces.forEach((c, i) => ctx.drawImage(c, i * 1024, 0));
    const link = document.createElement('a');
    link.download = `exquisite-corpse-${styleKey}-${chain.length}pcs-${Date.now()}.png`;
    link.href = merged.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button onClick={addPiece}
        className="px-4 py-2 bg-paper text-ink font-mono text-sm hover:bg-paper/80 transition-colors">
        + Add Piece
      </button>
      <button onClick={removeLast} disabled={chain.length <= 1}
        className="px-4 py-2 border border-paper/30 font-mono text-sm hover:border-paper/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        - Remove
      </button>
      <button onClick={regenerateAll}
        className="px-4 py-2 border border-paper/30 font-mono text-sm hover:border-paper/60 transition-colors">
        Regenerate
      </button>
      <button onClick={saveGallery}
        className="px-4 py-2 border border-paper/30 font-mono text-sm hover:border-paper/60 transition-colors">
        Save PNG
      </button>

      <div className="ml-auto flex items-center gap-4">
        {/* Style switcher */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-paper/50">Style:</span>
          {STYLE_KEYS.map((key) => (
            <button key={key} onClick={() => setStyleKey(key)}
              className={`px-3 py-1 font-mono text-xs transition-colors ${
                key === styleKey ? 'bg-paper text-ink' : 'border border-paper/30 hover:border-paper/60'
              }`}>
              {STYLES[key].name}
            </button>
          ))}
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-paper/50">View:</span>
          <button onClick={() => setView('gallery')}
            className={`px-3 py-1 font-mono text-xs transition-colors ${
              view === 'gallery' ? 'bg-paper text-ink' : 'border border-paper/30 hover:border-paper/60'
            }`}>
            Gallery
          </button>
          <button onClick={() => setView('single')}
            className={`px-3 py-1 font-mono text-xs transition-colors ${
              view === 'single' ? 'bg-paper text-ink' : 'border border-paper/30 hover:border-paper/60'
            }`}>
            Single
          </button>
        </div>
      </div>
    </div>
  );
}
