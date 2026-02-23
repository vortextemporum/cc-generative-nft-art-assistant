import { useRef, useEffect, useState } from 'react';
import PieceCanvas from './PieceCanvas';
import { SIZE } from '../engine/render.js';

export default function Gallery({ chain }) {
  const scrollRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Auto-fit: scale pieces so viewport height matches piece height
  useEffect(() => {
    const updateScale = () => {
      const vh = window.innerHeight - 160; // header + controls space
      setScale(Math.min(1, vh / SIZE));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Auto-scroll to newest piece
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [chain.length]);

  const displaySize = SIZE * scale;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="font-mono text-xs text-paper/40 mb-2">
        {chain.length} piece{chain.length > 1 ? 's' : ''} &middot; {Math.round(chain.length * displaySize)}px wide &middot; scroll to explore
      </div>

      <div
        ref={scrollRef}
        className="gallery-scroll w-full overflow-x-auto overflow-y-hidden"
        style={{ maxHeight: displaySize + 20 }}
      >
        <div className="flex" style={{ width: 'max-content' }}>
          {chain.map((hash, i) => (
            <div key={`${hash}-${i}`} className="gallery-piece relative group">
              <PieceCanvas
                ownHash={hash}
                leftHash={i > 0 ? chain[i - 1] : null}
                scale={scale}
              />
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-ink/80 backdrop-blur-sm px-2 py-1 font-mono text-[10px] text-paper/60 truncate">
                  #{i + 1} &middot; {hash.slice(0, 10)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
