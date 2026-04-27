import React from 'react';
import { Icon } from './Icons';

interface Props {
  scale: number;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onDownload: () => void;
}

export default function FooterBar({ scale, canUndo, canRedo, onZoomIn, onZoomOut, onUndo, onRedo, onClose, onDownload }: Props) {
  return (
    <footer data-testid="footer-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border)', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onZoomOut} aria-label="Zoom out" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--fg2)', cursor: 'pointer' }}>
          −
        </button>
        <span style={{ minWidth: 48, textAlign: 'center', color: 'var(--fg2)' }}>{Math.round(scale * 100)}%</span>
        <button onClick={onZoomIn} aria-label="Zoom in" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--fg2)', cursor: 'pointer' }}>
          +
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onUndo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', color: 'var(--fg2)', cursor: canUndo ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="arrowLeft" size={14} /> Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} style={{ opacity: canRedo ? 1 : 0.4, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', color: 'var(--fg2)', cursor: canRedo ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="arrowLeft" size={14} style={{ transform: 'scaleX(-1)' }} /> Redo
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--fg2)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          Fechar
        </button>
        <button onClick={onDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}>
          <Icon name="download" size={14} /> Download
        </button>
      </div>
    </footer>
  );
}
