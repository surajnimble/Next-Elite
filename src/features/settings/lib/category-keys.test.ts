import en from '../../../../messages/en.json';
import hi from '../../../../messages/hi.json';
import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_TITLE_KEYS,
  isSettingsCategory,
} from './setting-fields';

/** Walks a dot path, returning `undefined` if any hop is missing. */
function readPath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      source,
    );
}

describe('CATEGORY_TITLE_KEYS', () => {
  it('covers every known category exactly once', () => {
    expect(Object.keys(CATEGORY_TITLE_KEYS).sort()).toEqual(
      [...CATEGORIES].sort(),
    );
  });

  it('resolves to a string leaf in BOTH catalogs', () => {
    // Regression: passing `categories.<name>` (an object) to the translator
    // threw next-intl's INSUFFICIENT_PATH at runtime.
    for (const category of CATEGORIES) {
      // The keys are namespace-relative, so prefix `settings.` when walking
      // the whole catalog from the root.
      const key = `settings.${CATEGORY_TITLE_KEYS[category]}`;

      expect(typeof readPath(en, key)).toBe('string');
      expect(typeof readPath(hi, key)).toBe('string');
    }
  });

  it('never points at a non-leaf node', () => {
    for (const category of CATEGORIES) {
      const key = `settings.${CATEGORY_TITLE_KEYS[category]}`;
      const node = readPath(en, key);

      expect(typeof node).toBe('string');
      expect((node as string).length).toBeGreaterThan(0);
    }
  });

  it('keeps the same key shape in both catalogs', () => {
    for (const category of CATEGORIES) {
      const key = CATEGORY_TITLE_KEYS[category];
      expect(key).toBe(`categories.${category}.title`);
    }
  });
});

describe('isSettingsCategory', () => {
  it('accepts every declared category', () => {
    for (const category of CATEGORIES) {
      expect(isSettingsCategory(category)).toBe(true);
    }
  });

  it('rejects anything else, including the "other" bucket', () => {
    expect(isSettingsCategory('other')).toBe(false);
    expect(isSettingsCategory('Analytics')).toBe(false);
    expect(isSettingsCategory('')).toBe(false);
    expect(isSettingsCategory('not_a_category')).toBe(false);
  });
});
