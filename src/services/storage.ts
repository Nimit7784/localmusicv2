/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioTrack, AudioEngineSettings } from '../types/audio';

const DB_NAME = 'AuraHiFiAudioDB';
const DB_VERSION = 1;
const TRACKS_STORE = 'tracks';
const SETTINGS_STORE = 'settings';

export const DEFAULT_SETTINGS: AudioEngineSettings = {
  gaplessMode: 'pure',
  crossfadeDuration: 2.0,
  volume: 0.85,
  preampGain: 0,
  isBitPerfect: false,
  currentPresetId: 'flat',
  customBandGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  screenWakeLock: false,
};

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export async function saveTrack(track: AudioTrack): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, 'readwrite');
    const store = tx.objectStore(TRACKS_STORE);
    const req = store.put(track);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveTracks(tracks: AudioTrack[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, 'readwrite');
    const store = tx.objectStore(TRACKS_STORE);
    tracks.forEach((track) => store.put(track));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllTracks(): Promise<AudioTrack[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, 'readonly');
    const store = tx.objectStore(TRACKS_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTrack(trackId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, 'readwrite');
    const store = tx.objectStore(TRACKS_STORE);
    const req = store.delete(trackId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllTracks(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, 'readwrite');
    const store = tx.objectStore(TRACKS_STORE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function purgeDemoTracks(): Promise<void> {
  const all = await getAllTracks();
  const demoIds = all
    .filter((t) => t.isBuiltInDemo || t.id.startsWith('demo_track_'))
    .map((t) => t.id);

  for (const id of demoIds) {
    await deleteTrack(id);
  }
}

export async function saveSettings(settings: AudioEngineSettings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = tx.objectStore(SETTINGS_STORE);
    const req = store.put(settings, 'audio_settings');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSettings(): Promise<AudioEngineSettings> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const req = store.get('audio_settings');
      req.onsuccess = () => {
        resolve(req.result ? { ...DEFAULT_SETTINGS, ...req.result } : DEFAULT_SETTINGS);
      };
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getStorageUsage(): Promise<{ usedBytes: number; trackCount: number }> {
  try {
    const tracks = await getAllTracks();
    const usedBytes = tracks.reduce((acc, t) => acc + (t.fileSize || 0), 0);
    return { usedBytes, trackCount: tracks.length };
  } catch {
    return { usedBytes: 0, trackCount: 0 };
  }
}
