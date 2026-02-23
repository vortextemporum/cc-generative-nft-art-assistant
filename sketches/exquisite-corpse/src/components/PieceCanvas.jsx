import { useRef, useEffect } from 'react';
import { renderPiece, SIZE } from '../engine/render.js';

export default function PieceCanvas({ ownHash, leftHash, scale = 1, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !ownHash) return;
    renderPiece(canvasRef.current, ownHash, leftHash || null);
  }, [ownHash, leftHash]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className={className}
      style={{
        width: SIZE * scale,
        height: SIZE * scale,
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
