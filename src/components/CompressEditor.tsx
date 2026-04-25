import React, { useState } from 'react';
import EditorPage from './EditorPage';

export default function CompressEditor() {
  const [quality, setQuality] = useState(80);

  return (
    <EditorPage title="Compress Image">
      {(canvas, ctx, setCanvas) => {
        if (!canvas || !ctx) return null;
        const apply = () => {
          canvas.toBlob((blob) => {
            if (!blob) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              const img = new Image();
              img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                const x = c.getContext('2d');
                if (x) x.drawImage(img, 0, 0);
                setCanvas(c);
              };
              img.src = dataUrl;
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg', quality / 100);
        };
        return (
          <>
            <div className="control-row">
              <label>Quality ({quality}%)</label>
              <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} />
            </div>
            <div className="editor-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={apply}>Apply Compression</button>
            </div>
            <p className="editor-info">Lower quality = smaller file. Uses JPEG encoding for compression.</p>
          </>
        );
      }}
    </EditorPage>
  );
}
