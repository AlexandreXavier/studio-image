import React, { useRef, useEffect, useState } from 'react';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  canvas: HTMLCanvasElement | null;
  scale: number;
  showCropOverlay?: boolean;
  cropRect?: Rect;
  onCropChange?: (rect: Rect) => void;
}

export default function CanvasArea({ canvas, scale, showCropOverlay, cropRect, onCropChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [internalRect, setInternalRect] = useState<Rect>({ x: 10, y: 10, w: 80, h: 80 });
  const [dragMode, setDragMode] = useState<'move' | number | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const rectStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const isControlled = cropRect !== undefined && onCropChange !== undefined;
  const activeRect = isControlled ? cropRect : internalRect;

  const updateRect = (next: Rect) => {
    setInternalRect(next);
    if (isControlled && onCropChange) onCropChange(next);
  };

  // Initialize crop rect when canvas changes
  useEffect(() => {
    if (!canvas || !showCropOverlay) return;
    const init = {
      x: 10,
      y: 10,
      w: Math.max(20, canvas.width - 20),
      h: Math.max(20, canvas.height - 20),
    };
    if (isControlled) {
      onCropChange(init);
    } else {
      setInternalRect(init);
    }
  }, [canvas, showCropOverlay]);

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
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.15s ease', position: 'relative' }}>
        <canvas
          ref={displayRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
        />
        {showCropOverlay && canvas && (
          <svg
            ref={svgRef}
            data-testid="crop-overlay"
            style={{ position: 'absolute', top: 0, left: 0, width: canvas.width, height: canvas.height, pointerEvents: 'auto' }}
            viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            onMouseMove={(e) => {
              if (dragMode === null || !canvas) return;
              const dx = (e.clientX - dragStart.current.x) / scale;
              const dy = (e.clientY - dragStart.current.y) / scale;
              let next: Rect;
              if (dragMode === 'move') {
                next = {
                  ...activeRect,
                  x: Math.max(0, Math.min(canvas.width - activeRect.w, rectStart.current.x + dx)),
                  y: Math.max(0, Math.min(canvas.height - activeRect.h, rectStart.current.y + dy)),
                };
              } else {
                // Handle resize — dragMode is handle index 0..7
                const idx = dragMode as number;
                let nx = rectStart.current.x;
                let ny = rectStart.current.y;
                let nw = rectStart.current.w;
                let nh = rectStart.current.h;
                // Handle index mapping (same as render order):
                // 0:top-left  1:top-mid  2:top-right
                // 3:mid-left             4:mid-right
                // 5:bot-left  6:bot-mid  7:bot-right
                if (idx === 0 || idx === 3 || idx === 5) nx += dx;          // left side moves
                if (idx === 2 || idx === 4 || idx === 7) nw += dx;          // right side grows
                if (idx === 0 || idx === 1 || idx === 2) ny += dy;          // top side moves
                if (idx === 5 || idx === 6 || idx === 7) nh += dy;          // bottom side grows
                if (idx === 0 || idx === 3 || idx === 5) nw -= dx;          // left side shrinks width
                if (idx === 2 || idx === 4 || idx === 7) nx = rectStart.current.x; // right side stays x
                if (idx === 0 || idx === 1 || idx === 2) nh -= dy;          // top side shrinks height
                if (idx === 5 || idx === 6 || idx === 7) ny = rectStart.current.y; // bottom side stays y

                // Clamp
                const minSize = 10;
                nx = Math.max(0, Math.min(canvas.width - minSize, nx));
                ny = Math.max(0, Math.min(canvas.height - minSize, ny));
                nw = Math.max(minSize, Math.min(canvas.width - nx, nw));
                nh = Math.max(minSize, Math.min(canvas.height - ny, nh));
                next = { x: nx, y: ny, w: nw, h: nh };
              }
              updateRect(next);
            }}
            onMouseUp={() => setDragMode(null)}
            onMouseLeave={() => setDragMode(null)}
          >
            {/* Dimmed area outside crop */}
            <defs>
              <mask id="crop-mask">
                <rect x="0" y="0" width={canvas.width} height={canvas.height} fill="white" />
                <rect x={activeRect.x} y={activeRect.y} width={activeRect.w} height={activeRect.h} fill="black" />
              </mask>
            </defs>
            <rect x="0" y="0" width={canvas.width} height={canvas.height} fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
            {/* Crop area + border */}
            <rect
              data-testid="crop-rect"
              x={activeRect.x}
              y={activeRect.y}
              width={activeRect.w}
              height={activeRect.h}
              fill="rgba(255,255,255,0.05)"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 4"
              style={{ cursor: 'move' }}
              onMouseDown={(e) => {
                e.preventDefault();
                dragStart.current = { x: e.clientX, y: e.clientY };
                rectStart.current = { x: activeRect.x, y: activeRect.y, w: activeRect.w, h: activeRect.h };
                setDragMode('move');
              }}
            />
            {/* Grid lines */}
            <line x1={activeRect.x + activeRect.w / 3} y1={activeRect.y} x2={activeRect.x + activeRect.w / 3} y2={activeRect.y + activeRect.h} stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <line x1={activeRect.x + 2 * activeRect.w / 3} y1={activeRect.y} x2={activeRect.x + 2 * activeRect.w / 3} y2={activeRect.y + activeRect.h} stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <line x1={activeRect.x} y1={activeRect.y + activeRect.h / 3} x2={activeRect.x + activeRect.w} y2={activeRect.y + activeRect.h / 3} stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <line x1={activeRect.x} y1={activeRect.y + 2 * activeRect.h / 3} x2={activeRect.x + activeRect.w} y2={activeRect.y + 2 * activeRect.h / 3} stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            {/* 8 handles */}
            {(() => {
              const cx = [activeRect.x, activeRect.x + activeRect.w / 2, activeRect.x + activeRect.w];
              const cy = [activeRect.y, activeRect.y + activeRect.h / 2, activeRect.y + activeRect.h];
              const pts: [number, number][] = [];
              for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                  if (x === 1 && y === 1) continue;
                  pts.push([cx[x], cy[y]]);
                }
              }
              return pts.map(([x, y], i) => (
                <circle
                  key={i}
                  data-testid="crop-handle"
                  cx={x} cy={y} r="6"
                  fill="white" stroke="#333" strokeWidth="1"
                  style={{ cursor: i % 2 === 0 ? 'nwse-resize' : i === 1 || i === 6 ? 'ns-resize' : 'ew-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    dragStart.current = { x: e.clientX, y: e.clientY };
                    rectStart.current = { x: activeRect.x, y: activeRect.y, w: activeRect.w, h: activeRect.h };
                    setDragMode(i);
                  }}
                />
              ));
            })()}
          </svg>
        )}
      </div>
    </div>
  );
}
