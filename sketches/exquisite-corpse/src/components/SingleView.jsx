import { useState } from 'react';
import PieceCanvas from './PieceCanvas';
import { generateFeatures, SIZE } from '../engine/render.js';
import { generateHash } from '../engine/prng.js';

export default function SingleView({ chain, setChain }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const hash = chain[selectedIdx];
  const leftHash = selectedIdx > 0 ? chain[selectedIdx - 1] : null;
  const features = generateFeatures(hash, leftHash);

  const regenerateCurrent = () => {
    const newChain = [...chain];
    newChain[selectedIdx] = generateHash();
    setChain(newChain);
  };

  const savePiece = () => {
    const canvas = document.querySelector('.single-piece canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `exquisite-corpse-${selectedIdx + 1}-${hash.slice(2, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex gap-8 items-start justify-center flex-wrap">
      <div className="single-piece">
        <PieceCanvas ownHash={hash} leftHash={leftHash} scale={0.7} />
      </div>

      <div className="w-72 space-y-6">
        {/* Piece selector */}
        <div>
          <div className="font-mono text-xs text-paper/50 mb-2">Piece</div>
          <div className="flex gap-1 flex-wrap">
            {chain.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`w-8 h-8 font-mono text-xs transition-colors ${
                  i === selectedIdx
                    ? 'bg-paper text-ink'
                    : 'border border-paper/20 hover:border-paper/50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Hash */}
        <div>
          <div className="font-mono text-xs text-paper/50 mb-1">Hash</div>
          <div className="font-mono text-[10px] text-paper/70 break-all bg-paper/5 p-2">
            {hash}
          </div>
          {leftHash && (
            <>
              <div className="font-mono text-xs text-paper/50 mb-1 mt-3">Left Neighbor</div>
              <div className="font-mono text-[10px] text-paper/40 break-all bg-paper/5 p-2">
                {leftHash}
              </div>
            </>
          )}
        </div>

        {/* Features */}
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

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={regenerateCurrent}
            className="px-3 py-1.5 border border-paper/30 font-mono text-xs hover:border-paper/60 transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={savePiece}
            className="px-3 py-1.5 border border-paper/30 font-mono text-xs hover:border-paper/60 transition-colors"
          >
            Save PNG
          </button>
        </div>
      </div>
    </div>
  );
}
