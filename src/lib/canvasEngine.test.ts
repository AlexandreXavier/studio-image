import { describe, it, expect } from 'vitest';
import { crop, resize, rotate, flip, convertFormat } from './canvasEngine';

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  // jsdom canvas getContext returns null; override with minimal mock
  (c as any).getContext = () => ({
    drawImage: () => {},
    fillStyle: '',
    fillRect: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
  });
  (c as any).toDataURL = (mime?: string) => `data:${mime || 'image/png'};base64,`;
  return c;
}

describe('canvasEngine', () => {
  describe('crop', () => {
    it('produces correct dimensions', () => {
      const source = makeCanvas(10, 10);
      const result = crop(source, { x: 2, y: 3, w: 4, h: 5 });
      expect(result.width).toBe(4);
      expect(result.height).toBe(5);
    });
  });

  describe('resize', () => {
    it('scales by pixels', () => {
      const source = makeCanvas(10, 10);
      const result = resize(source, { width: 5, height: 3 });
      expect(result.width).toBe(5);
      expect(result.height).toBe(3);
    });

    it('scales by percent', () => {
      const source = makeCanvas(10, 10);
      const result = resize(source, { percent: 50 });
      expect(result.width).toBe(5);
      expect(result.height).toBe(5);
    });
  });

  describe('rotate', () => {
    it('90 degrees swaps dimensions', () => {
      const source = makeCanvas(10, 5);
      const result = rotate(source, 90);
      expect(result.width).toBe(5);
      expect(result.height).toBe(10);
    });

    it('180 degrees preserves dimensions', () => {
      const source = makeCanvas(10, 5);
      const result = rotate(source, 180);
      expect(result.width).toBe(10);
      expect(result.height).toBe(5);
    });
  });

  describe('flip', () => {
    it('horizontal preserves dimensions', () => {
      const source = makeCanvas(10, 5);
      const result = flip(source, 'horizontal');
      expect(result.width).toBe(10);
      expect(result.height).toBe(5);
    });

    it('vertical preserves dimensions', () => {
      const source = makeCanvas(10, 5);
      const result = flip(source, 'vertical');
      expect(result.width).toBe(10);
      expect(result.height).toBe(5);
    });
  });

  describe('convertFormat', () => {
    it('returns a data URL', () => {
      const source = makeCanvas(2, 2);
      const result = convertFormat(source, 'image/jpeg');
      expect(result.startsWith('data:')).toBe(true);
    });
  });
});
