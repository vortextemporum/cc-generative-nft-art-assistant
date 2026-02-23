import { useState } from 'react';
import PieceCanvas from './PieceCanvas';
import { SIZE } from '../engine/render-ink.js';
import { generateHash } from '../engine/prng.js';

export default function SingleView({ chain, setChain, renderer }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const idx = Math.min(selectedIdx, chain.length - 1);
  const hash = chain[idx];
  const leftHash = idx > 0 ? chain[idx - 1] : null;
  const features = renderer.generateFeatures(hash, leftHash);

  const regenerateCurrent = () => {
    const c = [...chain];
    c[idx] = generateHash();
    setChain(c);
  };

  const savePiece = () => {
    const canvas = document.querySelector('.single-piece canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `exquisite-corpse-${idx + 1}-${hash.slice(2, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex gap-8 items-start justify-center flex-wrap">
      <div className="single-piece">
        <PieceCanvas ownHash={hash} leftHash={leftHash} scale={0.7} renderer={renderer} />
      </div>

      <div className="w-72 space-y-6">
        <div>
          <div className="font-mono text-xs text-paper/50 mb-2">Piece</div>
          <div className="flex gap-1 flex-wrap">
            {chain.map((_, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)}
                className={`w-8 h-8 font-mono text-xs transition-colors ${
                  i === idx ? 'bg-paper text-ink' : 'border border-paper/20 hover:border-paper/50'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-xs text-paper/50 mb-1">Hash</div>
          <div className="font-mono text-[10px] text-paper/70 break-all bg-paper/5 p-2">{hash}</div>
          {leftHash && (
            <>
              <div className="font-mono text-xs text-paper/50 mb-1 mt-3">Left Neighbor</div>
              <div className="font-mono text-[10px] text-paper/40 break-all bg-paper/5 p-2">{leftHash}</div>
            </>
          )}
        </div>

        <div>
          <div className="font-mono text-xs text-paper/50 mb-2">Features</div>
          <div className="space-y-1">
            {Object.entries(features).map(([key, val]) => (
              <div key={key} className="flex justify-between font-mono text-xs">
                <span className="text-paper/50">{key}</span>
                <span className="text-paper/80">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={regenerateCurrent}
            className="px-3 py-1.5 border border-paper/30 font-mono text-xs hover:border-paper/60 transition-colors">
            Regenerate
          </button>
          <button onClick={savePiece}
            className="px-3 py-1.5 border border-paper/30 font-mono text-xs hover:border-paper/60 transition-colors">
            Save PNG
          </button>
        </div>
      </div>
    </div>
  );
}
