'use client';

import { useSyncExternalStore } from 'react';

export type Density = 'comfortable' | 'compact';

export interface LocalPreferences {
  autoSave: boolean;
  density: Density;
  sidebarCollapsed: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_PREFERENCES: LocalPreferences = {
  autoSave: true,
  density: 'comfortable',
  sidebarCollapsed: false,
  reduceMotion: false,
};

export const PREFERENCE_KEYS = [
  'autoSave',
  'density',
  'sidebarCollapsed',
  'reduceMotion',
] as const satisfies readonly (keyof LocalPreferences)[];

export type PreferenceKey = (typeof PREFERENCE_KEYS)[number];

const STORAGE_KEY = 'next-elite.preferences';
const EVENT_NAME = 'preferences-change';

/**
 * These preferences belong to the browser, not the account, so they live in
 * `localStorage` and are deliberately **not** sent to the backend. Settings
 * that live server-side are declared separately in `setting-fields.ts`.
 */
function read(): LocalPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES;

    const stored = parsed as Partial<Record<PreferenceKey, unknown>>;
    const density = stored.density;

    return {
      autoSave:
        typeof stored.autoSave === 'boolean'
          ? stored.autoSave
          : DEFAULT_PREFERENCES.autoSave,
      density:
        density === 'comfortable' || density === 'compact'
          ? density
          : DEFAULT_PREFERENCES.density,
      sidebarCollapsed:
        typeof stored.sidebarCollapsed === 'boolean'
          ? stored.sidebarCollapsed
          : DEFAULT_PREFERENCES.sidebarCollapsed,
      reduceMotion:
        typeof stored.reduceMotion === 'boolean'
          ? stored.reduceMotion
          : DEFAULT_PREFERENCES.reduceMotion,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function write(next: LocalPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota exceeded — preferences just won't persist.
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(EVENT_NAME, handleChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function serialise(value: LocalPreferences): string {
  return JSON.stringify(value);
}

export function getPreferences(): LocalPreferences {
  return read();
}

export function setPreference<K extends PreferenceKey>(
  key: K,
  value: LocalPreferences[K],
) {
  write({ ...read(), [key]: value });
}

export function resetPreferences() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function usePreferences(): [
  LocalPreferences,
  <K extends PreferenceKey>(key: K, value: LocalPreferences[K]) => void,
] {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => serialise(read()),
    () => serialise(DEFAULT_PREFERENCES),
  );

  return [JSON.parse(snapshot) as LocalPreferences, setPreference];
}
