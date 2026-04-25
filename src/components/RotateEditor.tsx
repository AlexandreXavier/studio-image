import React, { useState } from 'react';
import EditorPage from './EditorPage';

export default function RotateEditor() {
  const [angle, setAngle] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  return (
    <EditorPage title="Rotate & Flip">
      {(canvas, ctx, setCanvas) => {
        if (!canvas || !ctx) return null;
        const apply = () => {
          const c = document.createElement('canvas');
          const rad = (angle * Math.PI) / 180;
          let w = canvas.width, h = canvas.height;
          if (angle === 90 || angle === 270) { w = canvas.height; h = canvas.width; }
          c.width = w;
          c.height = h;
          const x = c.getContext('2d');
          if (!x) return;
          x.translate(w / 2, h / 2);
          x.rotate(rad);
          x.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          x.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          setCanvas(c);
        };
        return (
          <>
            <div className="control-row">
              <label>Rotate</label>
              <select value={angle} onChange={(e) => setAngle(parseInt(e.target.value) as 0 | 90 | 180 | 270)}>
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </div>
            <div className="control-row">
              <label>Flip Horizontal</label>
              <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
            </div>
            <div className="control-row">
              <label>Flip Vertical</label>
              <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
            </div>
            <div className="editor-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={apply}>Apply</button>
            </div>
            <p className="editor-info">Rotation is applied around center; flips are relative to result.</p>
          </>
        );
      }}
    </EditorPage>
  );
}
