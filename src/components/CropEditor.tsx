import React, { useState, useCallback } from 'react';
import EditorPage from './EditorPage';

export default function CropEditor() {
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });

  return (
    <EditorPage title="Crop Image">
      {(canvas, ctx, setCanvas) => {
        if (!canvas || !ctx) return null;
        const apply = () => {
          const c = document.createElement('canvas');
          c.width = crop.w;
          c.height = crop.h;
          const x = c.getContext('2d');
          if (x) x.drawImage(canvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
          setCanvas(c);
        };
        return (
          <>
            <div className="control-row">
              <label>X</label>
              <input type="number" min={0} max={canvas.width - 1} value={crop.x} onChange={(e) => setCrop(s => ({ ...s, x: Math.min(parseInt(e.target.value) || 0, canvas.width - s.w) }))} />
              <label>Y</label>
              <input type="number" min={0} max={canvas.height - 1} value={crop.y} onChange={(e) => setCrop(s => ({ ...s, y: Math.min(parseInt(e.target.value) || 0, canvas.height - s.h) }))} />
            </div>
            <div className="control-row">
              <label>Width</label>
              <input type="number" min={1} max={canvas.width - crop.x} value={crop.w} onChange={(e) => setCrop(s => ({ ...s, w: Math.min(parseInt(e.target.value) || 1, canvas.width - s.x) }))} />
              <label>Height</label>
              <input type="number" min={1} max={canvas.height - crop.y} value={crop.h} onChange={(e) => setCrop(s => ({ ...s, h: Math.min(parseInt(e.target.value) || 1, canvas.height - s.y) }))} />
            </div>
            <div className="editor-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={apply}>Apply Crop</button>
            </div>
            <p className="editor-info">Canvas: {canvas.width}×{canvas.height} | Crop: {crop.w}×{crop.h}</p>
          </>
        );
      }}
    </EditorPage>
  );
}
