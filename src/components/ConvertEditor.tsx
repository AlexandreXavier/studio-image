import React, { useState } from 'react';
import EditorPage from './EditorPage';

export default function ConvertEditor() {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');

  return (
    <EditorPage title="Convert Image">
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
          }, format, format === 'image/jpeg' ? 0.92 : undefined);
        };
        return (
          <>
            <div className="control-row">
              <label>Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as 'image/png' | 'image/jpeg' | 'image/webp')}>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            <div className="editor-actions" style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={apply}>Apply Convert</button>
            </div>
            <p className="editor-info">Select format and apply. Download to export in chosen format.</p>
          </>
        );
      }}
    </EditorPage>
  );
}
