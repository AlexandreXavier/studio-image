interface Snapshot {
  id: string;
  toolName: string;
  timestamp: number;
  canvas: HTMLCanvasElement;
}

let idCounter = 0;
function genId() {
  return `snap-${++idCounter}`;
}

export interface History {
  push(canvas: HTMLCanvasElement, toolName: string): void;
  undo(): void;
  redo(): void;
  jumpTo(index: number): void;
  canUndo(): boolean;
  canRedo(): boolean;
  getHistory(): ReadonlyArray<Pick<Snapshot, 'id' | 'toolName' | 'timestamp'>>;
  getSnapshots(): ReadonlyArray<Snapshot>;
  getActiveIndex(): number;
  getCurrentCanvas(): HTMLCanvasElement | null;
  serialize(): { toolName: string; timestamp: number; dataUrl: string }[];
  restore(data: { toolName: string; timestamp: number; dataUrl: string }[], activeIndex?: number): Promise<Snapshot[]>;
}

export function createHistory(): History {
  let history: Snapshot[] = [];
  let index = -1;

  return {
    push(canvas, toolName) {
      const sliced = history.slice(0, index + 1);
      const snap: Snapshot = { id: genId(), toolName, timestamp: Date.now(), canvas };
      history = [...sliced, snap];
      index = history.length - 1;
    },

    undo() {
      if (index > 0) index--;
    },

    redo() {
      if (index < history.length - 1) index++;
    },

    jumpTo(i) {
      if (i >= 0 && i < history.length) index = i;
    },

    canUndo() {
      return index > 0;
    },

    canRedo() {
      return index < history.length - 1;
    },

    getHistory() {
      return history.map(({ id, toolName, timestamp }) => ({ id, toolName, timestamp }));
    },

    getSnapshots() {
      return history;
    },

    getActiveIndex() {
      return index;
    },

    getCurrentCanvas() {
      return index >= 0 ? history[index].canvas : null;
    },

    serialize() {
      return history.map((h) => ({ toolName: h.toolName, timestamp: h.timestamp, dataUrl: h.canvas.toDataURL('image/png') }));
    },

    restore(data, activeIndex) {
      return Promise.all(
        data.map((h) => {
          return new Promise<Snapshot>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const c = document.createElement('canvas');
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              const ctx = c.getContext('2d');
              if (ctx) ctx.drawImage(img, 0, 0);
              resolve({ id: genId(), toolName: h.toolName, timestamp: h.timestamp, canvas: c });
            };
            img.src = h.dataUrl;
          });
        })
      ).then((restored) => {
        history = restored;
        index = activeIndex !== undefined ? Math.max(0, Math.min(activeIndex, restored.length - 1)) : restored.length - 1;
        return restored;
      });
    },
  };
}
