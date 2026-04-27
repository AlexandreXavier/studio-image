import React, { useCallback, useRef, useState } from 'react';
import { Icon } from './Icons';
import { setImage } from '../lib/storage';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
const MAX_MB = 5;

export default function LandingPage() {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError('Format not accepted. Use PNG, JPG, GIF, BMP, or WebP.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await setImage(base64);
      window.location.href = '/editor';
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="landing-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
      <div
        data-testid="upload-dropzone"
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{ maxWidth: 400, width: '100%' }}
      >
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
        <div className="dropzone-icon">
          <Icon name="upload" size={48} />
        </div>
        <p className="dropzone-text" style={{ fontSize: '1.125rem', fontWeight: 500 }}>Abrir imagem</p>
        <p className="dropzone-hint">Arraste e solte ou clique para selecionar</p>
        <p className="dropzone-hint">PNG, JPG, GIF, BMP, WebP · max {MAX_MB} MB</p>
      </div>

      <button
        data-testid="ai-generator"
        disabled
        className="btn-secondary"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        <Icon name="image" size={18} /> Gerador AI — Em breve
      </button>

      {error && (
        <p style={{ color: '#e11d48', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  );
}
