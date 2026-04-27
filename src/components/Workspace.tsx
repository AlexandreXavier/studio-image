import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getImage, clearImage } from '../lib/storage';
import { createHistory } from '../lib/history';
import type { History } from '../lib/history';
import Toolbar from './Toolbar';
import CanvasArea from './CanvasArea';
import HistoryPanel from './HistoryPanel';
import FooterBar from './FooterBar';
import CropToolPanel from './CropToolPanel';
import ResizeToolPanel from './ResizeToolPanel';
import PlaceholderToolPanel from './PlaceholderToolPanel';

const WORKSPACE_KEY = 'xani_workspace';

interface Snapshot {
  id: string;
  toolName: string;
  timestamp: number;
  canvas: HTMLCanvasElement;
}

function syncState(
  hist: History,
  setSnapshots: React.Dispatch<React.SetStateAction<Snapshot[]>>,
  setIndex: React.Dispatch<React.SetStateAction<number>>,
  setCanvas: React.Dispatch<React.SetStateAction<HTMLCanvasElement | null>>
) {
  setSnapshots(hist.getSnapshots() as Snapshot[]);
  setIndex(hist.getActiveIndex());
  setCanvas(hist.getCurrentCanvas());
}

export default function Workspace() {
  const historyRef = useRef<History>(createHistory());
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number }>({ x: 10, y: 10, w: 80, h: 80 });

  // Load initial image (restore workspace state if available)
  useEffect(() => {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        historyRef.current.restore(state.history, state.historyIndex).then(() => {
          syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
        });
        return;
      } catch { /* fallback to fresh load */ }
    }
    getImage().then((img) => {
      if (!img) { setError('No image loaded. Please upload an image first.'); return; }
      const image = new Image();
      image.onload = () => {
        const c = document.createElement('canvas');
        c.width = image.naturalWidth;
        c.height = image.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) ctx.drawImage(image, 0, 0);
        historyRef.current.push(c, 'Original');
        syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ history: historyRef.current.serialize(), historyIndex: 0 }));
      };
      image.src = img;
    });
  }, []);

  const save = () => {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
      history: historyRef.current.serialize(),
      historyIndex: historyRef.current.getActiveIndex(),
    }));
  };

  const pushSnapshot = useCallback((newCanvas: HTMLCanvasElement, toolName: string) => {
    historyRef.current.push(newCanvas, toolName);
    syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
    save();
  }, []);

  const jumpTo = useCallback((index: number) => {
    historyRef.current.jumpTo(index);
    syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
    save();
  }, []);

  const undo = useCallback(() => {
    historyRef.current.undo();
    syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
    save();
  }, []);

  const redo = useCallback(() => {
    historyRef.current.redo();
    syncState(historyRef.current, setSnapshots, setActiveIndex, setCanvas);
    save();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.2));

  const handleDownload = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'xani-edited.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleClose = async () => {
    await clearImage();
    localStorage.removeItem(WORKSPACE_KEY);
    window.location.href = '/';
  };

  const handleApplyTool = useCallback((newCanvas: HTMLCanvasElement, toolName: string) => {
    pushSnapshot(newCanvas, toolName);
  }, [pushSnapshot]);

  const renderToolPanel = () => {
    if (!canvas) return null;
    switch (activeTool) {
      case 'crop': return <CropToolPanel canvas={canvas} crop={cropRect} onApply={(c) => handleApplyTool(c, 'Crop')} />;
      case 'resize': return <ResizeToolPanel canvas={canvas} onApply={(c) => handleApplyTool(c, 'Resize')} />;
      case 'convert': return <PlaceholderToolPanel name="Convert" />;
      case 'compress': return <PlaceholderToolPanel name="Compress" />;
      case 'rotate': return <PlaceholderToolPanel name="Rotate/Flip" />;
      default: return null;
    }
  };

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg3)' }}>
        <p>{error}</p>
        <a href="/" style={{ color: 'var(--accent)' }}>Upload an image</a>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg3)' }}>
        <p>Loading image...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbar activeTool={activeTool} onSelect={setActiveTool} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CanvasArea canvas={canvas} scale={scale} showCropOverlay={activeTool === 'crop'} cropRect={cropRect} onCropChange={setCropRect} />
          </div>
          {renderToolPanel()}
        </div>

        <HistoryPanel
          history={snapshots}
          activeIndex={activeIndex}
          onJump={jumpTo}
        />
      </div>

      <FooterBar
        scale={scale}
        canUndo={historyRef.current.canUndo()}
        canRedo={historyRef.current.canRedo()}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onUndo={undo}
        onRedo={redo}
        onClose={handleClose}
        onDownload={handleDownload}
      />
    </div>
  );
}
