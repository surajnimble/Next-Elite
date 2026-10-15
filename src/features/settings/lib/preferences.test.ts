import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  PREFERENCE_KEYS,
  resetPreferences,
  setPreference,
  usePreferences,
} from './preferences';
import { act, renderHook } from '@testing-library/react';

const STORAGE_KEY = 'next-elite.preferences';

function write(value: unknown) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

describe('local preferences store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the defaults when nothing is stored', () => {
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('round-trips every preference through localStorage', () => {
    for (const key of PREFERENCE_KEYS) {
      const value =
        key === 'density' ? 'compact' : key === 'autoSave' ? false : true;

      setPreference(key, value);
      expect(getPreferences()[key]).toBe(value);
    }
  });

  it('ignores a corrupt payload instead of throwing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('falls back per-field when the stored value has the wrong type', () => {
    write({ autoSave: 'yes', density: 'cosy', sidebarCollapsed: true });

    const stored = getPreferences();

    expect(stored.autoSave).toBe(DEFAULT_PREFERENCES.autoSave);
    expect(stored.density).toBe(DEFAULT_PREFERENCES.density);
    expect(stored.sidebarCollapsed).toBe(true);
  });

  it('preserves unrelated keys when writing', () => {
    window.localStorage.setItem('other.key', 'keep me');
    setPreference('reduceMotion', true);

    expect(window.localStorage.getItem('other.key')).toBe('keep me');
  });

  it('clears only its own key on reset', () => {
    window.localStorage.setItem('other.key', 'keep me');
    setPreference('autoSave', false);

    resetPreferences();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem('other.key')).toBe('keep me');
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('notifies mounted hook consumers when a preference changes', () => {
    const { result } = renderHook(() => usePreferences());

    expect(result.current[0].autoSave).toBe(true);

    act(() => {
      setPreference('autoSave', false);
    });

    expect(result.current[0].autoSave).toBe(false);
  });
});
