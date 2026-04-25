import React, { useCallback, useRef, useState } from 'react';
import { Icon } from './Icons';
import { setImage } from '../lib/storage';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
const MAX_MB = 5;

interface Props {
  onUpload: () => void;
}

export default function UploadDropzone({ onUpload }: Props) {
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
      onUpload();
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
    <div
      className={`dropzone ${dragOver ? 'drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      <div className="dropzone-icon">
        <Icon name="upload" size={40} />
      </div>
      <p className="dropzone-text">Drag &amp; drop images here</p>
      <p className="dropzone-hint">PNG, JPG, GIF, BMP, WebP · max {MAX_MB} MB each</p>
      <button className="dropzone-btn" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Choose files
      </button>
      {error && <p style={{ color: '#e11d48', marginTop: 12, fontSize: '0.875rem' }}>{error}</p>}
    </div>
  );
}
