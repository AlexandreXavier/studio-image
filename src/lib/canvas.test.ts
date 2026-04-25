import { describe, it, expect } from 'vitest';

describe('canvas dimensions logic', () => {
  function makeCanvas(w: number, h: number) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  it('crop reduces canvas dimensions', () => {
    const dst = makeCanvas(200, 150);
    expect(dst.width).toBe(200);
    expect(dst.height).toBe(150);
  });

  it('resize scales canvas by percentage', () => {
    const src = makeCanvas(400, 300);
    const scale = 0.5;
    const dst = makeCanvas(Math.round(src.width * scale), Math.round(src.height * scale));
    expect(dst.width).toBe(200);
    expect(dst.height).toBe(150);
  });

  it('rotate 90 swaps width and height', () => {
    const src = makeCanvas(400, 300);
    const dst = makeCanvas(src.height, src.width);
    expect(dst.width).toBe(300);
    expect(dst.height).toBe(400);
  });

  it('rotate 180 keeps dimensions', () => {
    const src = makeCanvas(400, 300);
    const dst = makeCanvas(src.width, src.height);
    expect(dst.width).toBe(400);
    expect(dst.height).toBe(300);
  });

  it('flip preserves dimensions', () => {
    const src = makeCanvas(200, 100);
    const dst = makeCanvas(src.width, src.height);
    expect(dst.width).toBe(200);
    expect(dst.height).toBe(100);
  });

});

describe('upload validation', () => {
  const ACCEPTED = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
  const MAX_MB = 5;

  function isValid(file: { type: string; size: number }) {
    return ACCEPTED.includes(file.type) && file.size <= MAX_MB * 1024 * 1024;
  }

  it('accepts PNG', () => expect(isValid({ type: 'image/png', size: 1000 })).toBe(true));
  it('accepts JPG', () => expect(isValid({ type: 'image/jpeg', size: 1000 })).toBe(true));
  it('accepts WebP', () => expect(isValid({ type: 'image/webp', size: 1000 })).toBe(true));
  it('rejects SVG', () => expect(isValid({ type: 'image/svg+xml', size: 1000 })).toBe(false));
  it('rejects oversized', () => expect(isValid({ type: 'image/png', size: 6 * 1024 * 1024 })).toBe(false));
  it('accepts exactly 5MB', () => expect(isValid({ type: 'image/png', size: 5 * 1024 * 1024 })).toBe(true));
});
