export interface CropParams {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ResizeParams {
  width?: number;
  height?: number;
  percent?: number;
}

export function crop(source: HTMLCanvasElement, params: CropParams): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = params.w;
  c.height = params.h;
  const ctx = c.getContext('2d');
  if (ctx) ctx.drawImage(source, params.x, params.y, params.w, params.h, 0, 0, params.w, params.h);
  return c;
}

export function resize(source: HTMLCanvasElement, params: ResizeParams): HTMLCanvasElement {
  let w = source.width;
  let h = source.height;
  if (params.percent !== undefined) {
    w = Math.round((w * params.percent) / 100);
    h = Math.round((h * params.percent) / 100);
  } else if (params.width !== undefined && params.height !== undefined) {
    w = params.width;
    h = params.height;
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) ctx.drawImage(source, 0, 0, w, h);
  return c;
}

export function rotate(source: HTMLCanvasElement, degrees: 90 | 180 | 270): HTMLCanvasElement {
  const swap = degrees === 90 || degrees === 270;
  const c = document.createElement('canvas');
  c.width = swap ? source.height : source.width;
  c.height = swap ? source.width : source.height;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return c;
}

export function flip(source: HTMLCanvasElement, direction: 'horizontal' | 'vertical'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = source.width;
  c.height = source.height;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  if (direction === 'horizontal') {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, c.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(source, 0, 0);
  return c;
}

export function convertFormat(source: HTMLCanvasElement, mimeType: string, quality?: number): string {
  const result = source.toDataURL(mimeType, quality);
  // jsdom may return null for unsupported mime types; fallback to default
  return result || source.toDataURL();
}
