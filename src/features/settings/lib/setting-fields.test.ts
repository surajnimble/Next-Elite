import { describe, expect, it } from 'vitest';
import en from '../../../../messages/en.json';
import hi from '../../../../messages/hi.json';
import {
  DATE_FORMATS,
  GENERAL_FIELDS,
  LANGUAGE_OPTIONS,
  NOTIFICATION_FIELDS,
  ORDER_EVENTS,
  PRIVACY_FIELDS,
  STORAGE_FIELDS,
  TIME_FORMATS,
  TIMEZONES,
  type SettingField,
} from './setting-fields';

const ALL_FIELDS: readonly SettingField[] = [
  ...GENERAL_FIELDS,
  ...NOTIFICATION_FIELDS,
  ...PRIVACY_FIELDS,
  ...STORAGE_FIELDS,
];

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

describe('setting-fields catalogues', () => {
  it('exposes no duplicate backend keys across every tab', () => {
    const keys = ALL_FIELDS.map((field) => field.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('only writes keys that use the dotted `namespace.name` backend form', () => {
    for (const field of ALL_FIELDS) {
      expect(field.key).toMatch(/^[a-zA-Z]+\.[a-zA-Z.]+$/);
    }
  });

  it('gives every field a label and description in both catalogs', () => {
    for (const field of ALL_FIELDS) {
      if (field.label) {
        expect(typeof readPath(en, field.label)).toBe('string');
        expect(typeof readPath(hi, field.label)).toBe('string');
      }
      if (field.description) {
        expect(typeof readPath(en, field.description)).toBe('string');
        expect(typeof readPath(hi, field.description)).toBe('string');
      }
    }
  });

  it('gives every option a translated label in both catalogs', () => {
    const optionGroups = [TIMEZONES, DATE_FORMATS, TIME_FORMATS, ORDER_EVENTS];

    for (const group of optionGroups) {
      for (const option of group) {
        // Only the language list carries literal text, so this also proves no other
        // field silently lost its label.
        expect('label' in option).toBe(true);
        if (!('label' in option)) continue;

        expect(typeof readPath(en, option.label)).toBe('string');
        expect(typeof readPath(hi, option.label)).toBe('string');
      }
    }
  });

  it('offers no duplicate option values inside a select', () => {
    for (const group of [TIMEZONES, DATE_FORMATS, TIME_FORMATS, ORDER_EVENTS]) {
      const values = group.map((option) => option.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('offers only timezones the runtime can actually resolve', () => {
    // `Intl.supportedValuesOf` only lists canonical names, and the backend
    // stores `Asia/Kolkata` — which some ICU builds canonicalise to
    // `Asia/Calcutta`. What matters is that the runtime accepts the value,
    // so construct a formatter with it and let an invalid zone throw.
    for (const option of TIMEZONES) {
      expect(
        () => new Intl.DateTimeFormat('en', { timeZone: option.value }),
      ).not.toThrow();
    }
  });

  it('gives every language option a literal native name', () => {
    expect(LANGUAGE_OPTIONS.length).toBeGreaterThan(0);
    for (const option of LANGUAGE_OPTIONS) {
      expect('text' in option).toBe(true);
      if ('text' in option) expect(option.text.length).toBeGreaterThan(0);
    }
  });

  it('covers the notification, privacy and storage keys the backend stores', () => {
    const keys = new Set(ALL_FIELDS.map((field) => field.key));

    for (const key of [
      'notification.email.enabled',
      'notification.push.enabled',
      'notification.sms.enabled',
      'notification.whatsapp.enabled',
      'notification.tokenBalanceReminder',
      'notification.orderEvents',
      'security.newDeviceAlerts',
      'security.maxActiveSessions',
      'security.sessionDays',
      'security.accountPurgeDays',
      'cart.persistAcrossDevices',
      'locale.default',
      'timezone.default',
      'date.format',
      'time.format',
    ]) {
      expect(keys.has(key)).toBe(true);
    }
  });

  it('clamps every number field to a sane range', () => {
    for (const field of ALL_FIELDS) {
      if (field.kind !== 'number') continue;
      expect(field.min).toBeTypeOf('number');
      expect(field.max).toBeTypeOf('number');
      if (field.min !== undefined && field.max !== undefined) {
        expect(field.min).toBeLessThanOrEqual(field.max);
      }
    }
  });
});
