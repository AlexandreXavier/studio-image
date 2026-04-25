import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getImage, setImage, clearImage, hasImage } from './storage';

const KEY = 'xani_image';

function makeStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: () => null,
  } as Storage;
}

describe('storage', () => {
  let originalLocalStorage: Storage;
  let originalSessionStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    originalSessionStorage = globalThis.sessionStorage;
    Object.defineProperty(globalThis, 'localStorage', { value: makeStorage(), writable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: makeStorage(), writable: true });
  });

  afterEach(async () => {
    await clearImage();
    Object.defineProperty(globalThis, 'localStorage', { value: originalLocalStorage, writable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: originalSessionStorage, writable: true });
  });

  it('getImage returns null initially', async () => {
    expect(await getImage()).toBeNull();
  });

  it('setImage stores in localStorage', async () => {
    await setImage('data:image/png;base64,abc');
    expect(await getImage()).toBe('data:image/png;base64,abc');
    expect(localStorage.getItem(KEY)).toBe('data:image/png;base64,abc');
  });

  it('hasImage returns false when empty', async () => {
    expect(await hasImage()).toBe(false);
  });

  it('hasImage returns true after set', async () => {
    await setImage('img');
    expect(await hasImage()).toBe(true);
  });

  it('clearImage removes from all storages', async () => {
    await setImage('img');
    await clearImage();
    expect(await getImage()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('falls back to sessionStorage when localStorage throws', async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => { throw new Error('quota'); },
        removeItem: () => {},
        length: 0,
        clear: () => {},
        key: () => null,
      } as Storage,
      writable: true,
    });
    await setImage('fallback-img');
    expect(await getImage()).toBe('fallback-img');
    expect(sessionStorage.getItem(KEY)).toBe('fallback-img');
  });
});
