import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getImage, setImage, clearImage } from '../lib/storage';
import { Icon } from './Icons';

interface Props {
  title: string;
  children: (canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null, setCanvas: (c: HTMLCanvasElement) => void) => React.ReactNode;
}

export default function EditorPage({ title, children }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [originalName, setOriginalName] = useState('image');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getImage().then((img) => {
      if (img) {
        setSrc(img);
        loadImageToCanvas(img);
      }
    });
  }, []);

  const loadImageToCanvas = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      setCanvas(c);
      if (canvasRef.current) {
        canvasRef.current.width = c.width;
        canvasRef.current.height = c.height;
        const previewCtx = canvasRef.current.getContext('2d');
        if (previewCtx) previewCtx.drawImage(c, 0, 0);
      }
    };
    img.src = dataUrl;
  };

  const refreshPreview = useCallback(() => {
    if (canvas && canvasRef.current) {
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0);
    }
  }, [canvas]);

  useEffect(() => {
    refreshPreview();
  }, [canvas, refreshPreview]);

  const handleApply = async () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    await setImage(dataUrl);
    window.location.href = '/';
  };

  const handleDownload = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${originalName}-edited.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = async () => {
    await clearImage();
    window.location.href = '/';
  };

  if (!src) {
    return (
      <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--fg3)', fontFamily: 'var(--font-mono)' }}>No image loaded. <a href="/" style={{ color: 'var(--accent)' }}>Upload one first</a>.</p>
      </div>
    );
  }

  const ctx = canvas?.getContext('2d') ?? null;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xl)', margin: 0, color: 'var(--fg1)' }}>{title}</h2>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)' }}>
          <Icon name="arrowLeft" size={16} /> Back
        </a>
      </div>

      <div className="editor-layout">
        <div className="editor-preview-wrapper">
          <canvas ref={canvasRef} className="editor-canvas" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
        </div>

        <div className="editor-controls">
          {children(canvas, ctx, (c) => { setCanvas(c); })}
        </div>

        <div className="editor-actions">
          <button className="btn-primary" onClick={handleApply}>
            <Icon name="check" size={16} /> Apply &amp; Continue
          </button>
          <button className="btn-secondary" onClick={handleDownload}>
            <Icon name="download" size={16} /> Download
          </button>
          <button className="btn-danger" onClick={handleReset}>
            <Icon name="x" size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
