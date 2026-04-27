import React, { useState, useEffect } from 'react';

interface Props {
  canvas: HTMLCanvasElement;
  onApply: (newCanvas: HTMLCanvasElement) => void;
  crop?: { x: number; y: number; w: number; h: number };
}

export default function CropToolPanel({ canvas, onApply, crop: cropProp }: Props) {
  const defaultCrop = cropProp || { x: 0, y: 0, w: Math.min(100, canvas.width), h: Math.min(100, canvas.height) };
  const [crop, setCrop] = useState(defaultCrop);

  useEffect(() => {
    if (cropProp) setCrop(cropProp);
  }, [cropProp]);

  const apply = () => {
    const c = document.createElement('canvas');
    c.width = crop.w;
    c.height = crop.h;
    const ctx = c.getContext('2d');
    if (ctx) ctx.drawImage(canvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    onApply(c);
  };

  return (
    <div data-testid="tool-panel" style={{ padding: 12, borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Crop</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          X
          <input type="number" min={0} max={canvas.width - 1} value={crop.x}
            onChange={(e) => setCrop(s => ({ ...s, x: Math.min(parseInt(e.target.value) || 0, canvas.width - s.w) }))}
            style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Y
          <input type="number" min={0} max={canvas.height - 1} value={crop.y}
            onChange={(e) => setCrop(s => ({ ...s, y: Math.min(parseInt(e.target.value) || 0, canvas.height - s.h) }))}
            style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Width
          <input type="number" min={1} max={canvas.width - crop.x} value={crop.w}
            onChange={(e) => setCrop(s => ({ ...s, w: Math.min(parseInt(e.target.value) || 1, canvas.width - s.x) }))}
            style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Height
          <input type="number" min={1} max={canvas.height - crop.y} value={crop.h}
            onChange={(e) => setCrop(s => ({ ...s, h: Math.min(parseInt(e.target.value) || 1, canvas.height - s.y) }))}
            style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
          />
        </label>
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={apply} className="btn-primary" style={{ padding: '6px 14px' }}>Apply Crop</button>
      </div>
      <p style={{ color: 'var(--fg3)', fontSize: '0.75rem', marginTop: 6 }}>Canvas: {canvas.width}×{canvas.height} | Crop: {crop.w}×{crop.h}</p>
    </div>
  );
}
