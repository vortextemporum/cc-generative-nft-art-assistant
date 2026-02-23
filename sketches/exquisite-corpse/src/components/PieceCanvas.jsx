import { useRef, useEffect } from 'react';
import { SIZE } from '../engine/render-ink.js';

export default function PieceCanvas({ ownHash, leftHash, scale = 1, className = '', renderer }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !ownHash || !renderer) return;
    renderer.renderPiece(canvasRef.current, ownHash, leftHash || null);
  }, [ownHash, leftHash, renderer]);

  // Floor to integer pixels to prevent sub-pixel gaps between pieces
  const w = Math.floor(SIZE * scale);
  const h = Math.floor(SIZE * scale);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className={className}
      style={{ width: w, height: h, display: 'block', flexShrink: 0, margin: 0, padding: 0 }}
    />
  );
}
