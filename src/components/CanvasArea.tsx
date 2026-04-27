import React, { useRef, useEffect } from 'react';

interface Props {
  canvas: HTMLCanvasElement | null;
  scale: number;
}

export default function CanvasArea({ canvas, scale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas || !displayRef.current) return;
    displayRef.current.width = canvas.width;
    displayRef.current.height = canvas.height;
    const ctx = displayRef.current.getContext('2d');
    if (ctx) ctx.drawImage(canvas, 0, 0);
  }, [canvas]);

  return (
    <div
      data-testid="canvas-area"
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        background: 'var(--bg2)',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.15s ease' }}>
        <canvas
          ref={displayRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}
