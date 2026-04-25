const KEY = 'xani_image';

function tryStorage(storage: Storage | undefined): { get(): string | null; set(v: string): boolean; remove(): void } {
  return {
    get() {
      if (!storage) return null;
      try { return storage.getItem(KEY); } catch { return null; }
    },
    set(v: string) {
      if (!storage) return false;
      try { storage.setItem(KEY, v); return true; } catch { return false; }
    },
    remove() {
      if (!storage) return;
      try { storage.removeItem(KEY); } catch { /* noop */ }
    },
  };
}

function getLS() { return tryStorage(typeof window !== 'undefined' ? window.localStorage : undefined); }
function getSS() { return tryStorage(typeof window !== 'undefined' ? window.sessionStorage : undefined); }

let idbCache: string | null = null;

function getIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) { resolve(null); return; }
    const req = indexedDB.open('xani', 1);
    req.onerror = () => resolve(null);
    req.onupgradeneeded = () => { req.result.createObjectStore('images'); };
    req.onsuccess = () => resolve(req.result);
  });
}

async function getIDBImage(): Promise<string | null> {
  if (idbCache !== null) return idbCache;
  const db = await getIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const req = store.get('current');
    req.onsuccess = () => { idbCache = req.result ?? null; resolve(idbCache); };
    req.onerror = () => resolve(null);
  });
}

async function setIDBImage(value: string): Promise<boolean> {
  idbCache = value;
  const db = await getIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.put(value, 'current');
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

async function removeIDBImage(): Promise<void> {
  idbCache = null;
  const db = await getIDB();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.delete('current');
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getImage(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return getLS().get() ?? getSS().get() ?? await getIDBImage();
}

export async function setImage(value: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (getLS().set(value)) return;
  if (getSS().set(value)) return;
  await setIDBImage(value);
}

export async function clearImage(): Promise<void> {
  if (typeof window === 'undefined') return;
  getLS().remove();
  getSS().remove();
  await removeIDBImage();
}

export async function hasImage(): Promise<boolean> {
  return !!(await getImage());
}
