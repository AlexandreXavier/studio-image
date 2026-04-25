import React, { useState } from 'react';
import EditorPage from './EditorPage';

export default function ResizeEditor() {
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [pct, setPct] = useState(100);

  return (
    <EditorPage title="Resize Image">
      {(canvas, ctx, setCanvas) => {
        if (!canvas || !ctx) return null;
        const apply = () => {
          const c = document.createElement('canvas');
          let nw = w, nh = h;
          if (mode === 'percent') {
            nw = Math.round(canvas.width * (pct / 100));
            nh = Math.round(canvas.height * (pct / 100));
          }
          if (nw < 1) nw = 1;
          if (nh < 1) nh = 1;
          c.width = nw;
          c.height = nh;
          const x = c.getContext('2d');
          if (x) x.drawImage(canvas, 0, 0, nw, nh);
          setCanvas(c);
        };
        return (
          <>
            <div className="control-row">
              <label>Mode</label>
              <select data-testid="resize-mode" value={mode} onChange={(e) => setMode(e.target.value as 'pixels' | 'percent')}>
                <option value="pixels">Pixels</option>
                <option value="percent">Percent</option>
              </select>
            </div>
            {mode === 'pixels' ? (
              <>
                <div className="control-row">
                  <label>Width (px)</label>
                  <input type="number" min={1} value={w || canvas.width} onChange={(e) => setW(parseInt(e.target.value) || 0)} />
                </div>
                <div className="control-row">
                  <label>Height (px)</label>
                  <input type="number" min={1} value={h || canvas.height} onChange={(e) => setH(parseInt(e.target.value) || 0)} />
                </div>
              </>
            ) : (
              <div className="control-row">
                <label>Scale (%)</label>
                <input type="range" min={1} max={200} value={pct} onChange={(e) => setPct(parseInt(e.target.value))} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)', color: 'var(--fg2)' }}>{pct}%</span>
              </div>
            )}
            <div className="editor-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={apply}>Apply Resize</button>
            </div>
            <p className="editor-info">Current: {canvas.width}×{canvas.height}</p>
          </>
        );
      }}
    </EditorPage>
  );
}
