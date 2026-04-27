import { describe, it, expect, beforeEach } from 'vitest';
import { createHistory } from './history';

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

describe('history module', () => {
  let history: ReturnType<typeof createHistory>;

  beforeEach(() => {
    history = createHistory();
  });

  it('starts empty', () => {
    expect(history.getHistory()).toHaveLength(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it('push adds snapshot and sets index to end', () => {
    history.push(makeCanvas(2, 2), 'Original');
    expect(history.getHistory()).toHaveLength(1);
    expect(history.getActiveIndex()).toBe(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it('undo moves index back', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.push(makeCanvas(3, 3), 'Crop');
    expect(history.getActiveIndex()).toBe(1);

    history.undo();
    expect(history.getActiveIndex()).toBe(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it('redo moves index forward', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.push(makeCanvas(3, 3), 'Crop');
    history.undo();
    expect(history.getActiveIndex()).toBe(0);

    history.redo();
    expect(history.getActiveIndex()).toBe(1);
    expect(history.canRedo()).toBe(false);
  });

  it('jumpTo non-linear navigation', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.push(makeCanvas(3, 3), 'Crop');
    history.push(makeCanvas(4, 4), 'Resize');

    history.jumpTo(0);
    expect(history.getActiveIndex()).toBe(0);
    expect(history.canRedo()).toBe(true);
  });

  it('push from middle truncates future', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.push(makeCanvas(3, 3), 'Crop');
    history.push(makeCanvas(4, 4), 'Resize');

    history.jumpTo(0);
    history.push(makeCanvas(5, 5), 'New Edit');

    const h = history.getHistory();
    expect(h).toHaveLength(2);
    expect(h[1].toolName).toBe('New Edit');
    expect(history.getActiveIndex()).toBe(1);
    expect(history.canRedo()).toBe(false);
  });

  it('getCurrentCanvas returns active canvas', () => {
    const c1 = makeCanvas(2, 2);
    history.push(c1, 'Original');
    expect(history.getCurrentCanvas()).toBe(c1);

    const c2 = makeCanvas(4, 4);
    history.push(c2, 'Resize');
    history.undo();
    expect(history.getCurrentCanvas()).toBe(c1);
  });

  it('undo at start is no-op', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.undo();
    history.undo();
    expect(history.getActiveIndex()).toBe(0);
  });

  it('redo at end is no-op', () => {
    history.push(makeCanvas(2, 2), 'Original');
    history.redo();
    expect(history.getActiveIndex()).toBe(0);
  });
});
