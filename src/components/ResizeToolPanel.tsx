import React, { useState } from 'react';

interface Props {
  canvas: HTMLCanvasElement;
  onApply: (newCanvas: HTMLCanvasElement) => void;
}

export default function ResizeToolPanel({ canvas, onApply }: Props) {
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [width, setWidth] = useState(canvas.width);
  const [height, setHeight] = useState(canvas.height);
  const [percent, setPercent] = useState(100);

  const apply = () => {
    let w = width;
    let h = height;
    if (mode === 'percent') {
      w = Math.round((canvas.width * percent) / 100);
      h = Math.round((canvas.height * percent) / 100);
    }
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (ctx) ctx.drawImage(canvas, 0, 0, w, h);
    onApply(c);
  };

  return (
    <div data-testid="tool-panel" style={{ padding: 12, borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Resize</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <select
          data-testid="resize-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as 'pixels' | 'percent')}
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--fg1)' }}
        >
          <option value="pixels">Pixels</option>
          <option value="percent">Percent</option>
        </select>
      </div>

      {mode === 'pixels' ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Width
            <input type="number" min={1} value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
              style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Height
            <input type="number" min={1} value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
              style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
            />
          </label>
        </div>
      ) : (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Percent
          <input type="number" min={1} max={1000} value={percent}
            onChange={(e) => setPercent(parseInt(e.target.value) || 1)}
            style={{ width: 70, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--fg1)' }}
          />
        </label>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={apply} className="btn-primary" style={{ padding: '6px 14px' }}>Apply Resize</button>
      </div>
    </div>
  );
}
