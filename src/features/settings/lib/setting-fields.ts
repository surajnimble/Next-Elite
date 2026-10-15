import { siteConfig, supportedLocales } from '@/features/site/config';
import type settingsMessages from '../../../../messages/en.json';

type SettingsNamespace = (typeof settingsMessages)['settings'];
type FieldMessages = SettingsNamespace['fields'];
type OptionMessages = SettingsNamespace['options'];
type CategoryMessages = SettingsNamespace['categories'];

/**
 * Derived from `messages/en.json` rather than hand-written, so a renamed key
 * breaks `tsc` here instead of silently rendering a raw key path at runtime.
 */
export type FieldLabelKey = {
  [K in keyof FieldMessages & string]: `settings.fields.${K}.label`;
}[keyof FieldMessages & string];

export type FieldDescriptionKey = {
  [K in keyof FieldMessages & string]: `settings.fields.${K}.description`;
}[keyof FieldMessages & string];

export type OptionLabelKey = {
  [K in keyof OptionMessages & string]: `settings.options.${K}`;
}[keyof OptionMessages & string];

/**
 * `categories.<name>` is an **object** (`{ title, description }`), so the
 * lookup has to reach into `.title`. Passing `categories.analytics` to the
 * translator throws next-intl's `INSUFFICIENT_PATH`.
 *
 * Keys are namespace-relative (`settings.categories.*` minus the prefix) so they
 * can be used with `useTranslations('settings')` — the root union is too wide
 * for TypeScript to represent.
 */
export type CategoryTitleKey = {
  [K in keyof CategoryMessages & string]: `categories.${K}.title`;
}[keyof CategoryMessages & string];

/**
 * Options either point at a translated label, or carry literal text when the
 * label is data rather than copy (a locale's native name, for example).
 */
export type SelectOption =
  | { value: string; label: OptionLabelKey }
  | { value: string; text: string };

interface FieldBase {
  key: string;
  label?: FieldLabelKey;
  description?: FieldDescriptionKey;
  textLabel?: string;
  textDescription?: string;
}

export interface ToggleField extends FieldBase {
  kind: 'toggle';
}

/** Writes a single string, e.g. `date.format`. */
export interface SelectField extends FieldBase {
  kind: 'select';
  options: readonly SelectOption[];
}

/** Writes a `string[]`, e.g. `notification.orderEvents`. */
export interface ListField extends FieldBase {
  kind: 'list';
  options: readonly SelectOption[];
}

export interface NumberField extends FieldBase {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface TextField extends FieldBase {
  kind: 'text';
  placeholder?: string;
}

/**
 * Free-form JSON, e.g. `site.socialLinks`. Rendered read-only on purpose —
 * hand-editing a nested object from a text box is a foot-gun, and no backend
 * key needs it changed from this screen.
 */
export interface JsonField extends FieldBase {
  kind: 'json';
}

export interface ReadOnlyField extends FieldBase {
  kind: 'readonly';
}

export type SettingField =
  | ToggleField
  | SelectField
  | ListField
  | NumberField
  | TextField
  | JsonField
  | ReadOnlyField;

export type SettingsTabId =
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'storage'
  | 'all';

export const TIMEZONES: readonly SelectOption[] = [
  { value: 'Asia/Kolkata', label: 'settings.options.asiaKolkata' },
  { value: 'UTC', label: 'settings.options.utc' },
  { value: 'America/New_York', label: 'settings.options.americaNewYork' },
  { value: 'America/Chicago', label: 'settings.options.americaChicago' },
  { value: 'America/Denver', label: 'settings.options.americaDenver' },
  { value: 'America/Los_Angeles', label: 'settings.options.americaLosAngeles' },
  { value: 'Europe/London', label: 'settings.options.europeLondon' },
  { value: 'Europe/Berlin', label: 'settings.options.europeBerlin' },
  { value: 'Asia/Dubai', label: 'settings.options.asiaDubai' },
  { value: 'Asia/Singapore', label: 'settings.options.asiaSingapore' },
  { value: 'Asia/Tokyo', label: 'settings.options.asiaTokyo' },
  { value: 'Australia/Sydney', label: 'settings.options.australiaSydney' },
];

/** Must match the values the backend stores. */
export const DATE_FORMATS: readonly SelectOption[] = [
  { value: 'DD-MM-YYYY', label: 'settings.options.dateDmy' },
  { value: 'MM/DD/YYYY', label: 'settings.options.dateMdy' },
  { value: 'YYYY-MM-DD', label: 'settings.options.dateYmd' },
];

export const TIME_FORMATS: readonly SelectOption[] = [
  { value: 'hh:mm A', label: 'settings.options.time12' },
  { value: 'HH:mm', label: 'settings.options.time24' },
];

export const ORDER_EVENTS: readonly SelectOption[] = [
  { value: 'CONFIRMED', label: 'settings.options.eventConfirmed' },
  { value: 'SHIPPED', label: 'settings.options.eventShipped' },
  { value: 'DELIVERED', label: 'settings.options.eventDelivered' },
  { value: 'CANCELLED', label: 'settings.options.eventCancelled' },
];

/** Built from `siteConfig` so it follows the app's locale list automatically. */
export const LANGUAGE_OPTIONS: readonly SelectOption[] = supportedLocales.map(
  (code) => ({
    value: code,
    text: siteConfig.languages.locales[code]?.nativeName ?? code,
  }),
);

/** General tab — every field maps to a key the backend already stores. */
export const GENERAL_FIELDS: readonly SettingField[] = [
  {
    kind: 'select',
    key: 'locale.default',
    label: 'settings.fields.language.label',
    description: 'settings.fields.language.description',
    options: LANGUAGE_OPTIONS,
  },
  {
    kind: 'select',
    key: 'timezone.default',
    label: 'settings.fields.timezone.label',
    description: 'settings.fields.timezone.description',
    options: TIMEZONES,
  },
  {
    kind: 'select',
    key: 'date.format',
    label: 'settings.fields.dateFormat.label',
    description: 'settings.fields.dateFormat.description',
    options: DATE_FORMATS,
  },
  {
    kind: 'select',
    key: 'time.format',
    label: 'settings.fields.timeFormat.label',
    description: 'settings.fields.timeFormat.description',
    options: TIME_FORMATS,
  },
];

export const NOTIFICATION_FIELDS: readonly SettingField[] = [
  {
    kind: 'toggle',
    key: 'notification.email.enabled',
    label: 'settings.fields.email.label',
    description: 'settings.fields.email.description',
  },
  {
    kind: 'toggle',
    key: 'notification.push.enabled',
    label: 'settings.fields.push.label',
    description: 'settings.fields.push.description',
  },
  {
    kind: 'toggle',
    key: 'notification.sms.enabled',
    label: 'settings.fields.sms.label',
    description: 'settings.fields.sms.description',
  },
  {
    kind: 'toggle',
    key: 'notification.whatsapp.enabled',
    label: 'settings.fields.whatsapp.label',
    description: 'settings.fields.whatsapp.description',
  },
  {
    kind: 'toggle',
    key: 'notification.tokenBalanceReminder',
    label: 'settings.fields.tokenReminder.label',
    description: 'settings.fields.tokenReminder.description',
  },
  {
    kind: 'list',
    key: 'notification.orderEvents',
    label: 'settings.fields.orderEvents.label',
    description: 'settings.fields.orderEvents.description',
    options: ORDER_EVENTS,
  },
];

/**
 * Privacy tab — backed by the `security` category, which is what the backend
 * stores for sessions and devices. There is no `privacy` category.
 */
export const PRIVACY_FIELDS: readonly SettingField[] = [
  {
    kind: 'toggle',
    key: 'security.newDeviceAlerts',
    label: 'settings.fields.newDeviceAlerts.label',
    description: 'settings.fields.newDeviceAlerts.description',
  },
  {
    kind: 'toggle',
    key: 'security.loginAlerts',
    label: 'settings.fields.loginAlerts.label',
    description: 'settings.fields.loginAlerts.description',
  },
  {
    kind: 'toggle',
    key: 'security.loginNotifyEnabled',
    label: 'settings.fields.loginNotify.label',
    description: 'settings.fields.loginNotify.description',
  },
  {
    kind: 'toggle',
    key: 'security.twoFactorEnabled',
    label: 'settings.fields.twoFactor.label',
    description: 'settings.fields.twoFactor.description',
  },
  {
    kind: 'toggle',
    key: 'security.otpLoginEnabled',
    label: 'settings.fields.otpLogin.label',
    description: 'settings.fields.otpLogin.description',
  },
  {
    kind: 'toggle',
    key: 'security.requireEmailVerify',
    label: 'settings.fields.requireEmail.label',
    description: 'settings.fields.requireEmail.description',
  },
  {
    kind: 'toggle',
    key: 'security.requirePhoneVerify',
    label: 'settings.fields.requirePhone.label',
    description: 'settings.fields.requirePhone.description',
  },
  {
    kind: 'number',
    key: 'security.maxActiveSessions',
    label: 'settings.fields.maxSessions.label',
    description: 'settings.fields.maxSessions.description',
    min: 0,
    max: 50,
  },
  {
    kind: 'number',
    key: 'security.sessionDays',
    label: 'settings.fields.sessionDays.label',
    description: 'settings.fields.sessionDays.description',
    min: 1,
    max: 365,
  },
  {
    kind: 'number',
    key: 'security.lockoutMinutes',
    label: 'settings.fields.lockoutMinutes.label',
    description: 'settings.fields.lockoutMinutes.description',
    min: 0,
    max: 1440,
  },
  {
    kind: 'number',
    key: 'security.accountPurgeDays',
    label: 'settings.fields.purgeDays.label',
    description: 'settings.fields.purgeDays.description',
    min: 0,
    max: 3650,
  },
];

export const STORAGE_FIELDS: readonly SettingField[] = [
  {
    kind: 'toggle',
    key: 'cart.persistAcrossDevices',
    label: 'settings.fields.persistCart.label',
    description: 'settings.fields.persistCart.description',
  },
];

// The backend stores 183 keys across 27 categories. The curated tabs cover the
// few that make sense as user preferences; everything else still has to render,
// so `describeField()` can build a control for *any* key from its value alone.

/**
 * `catalog.productsPerPage` → `Products per page`.
 *
 * Only the last segment is used, because the segment before it is not always
 * the category (`commission.default` lives in `business`, `order.maxItems`
 * lives in `business` too). The full key is rendered alongside the title, so
 * an ambiguous "Default" is still unambiguous on screen.
 */
export function humanizeKey(key: string): string {
  const last = key.split('.').pop() ?? key;

  const words = last
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  if (!words) return key;

  return words.charAt(0).toUpperCase() + words.slice(1);
}

const OVERRIDE_OPTIONS: Record<string, readonly SelectOption[]> = {
  'refund.mode': [
    { value: 'original', label: 'settings.options.refundOriginal' },
    { value: 'credit', label: 'settings.options.refundCredit' },
  ],
  'payment.token.mode': [
    { value: 'percent', label: 'settings.options.tokenPercent' },
    { value: 'fixed', label: 'settings.options.tokenFixed' },
  ],
  'catalog.defaultSort': [
    { value: '-createdAt', label: 'settings.options.sortNewest' },
    { value: 'createdAt', label: 'settings.options.sortOldest' },
    { value: 'price', label: 'settings.options.sortPriceAsc' },
    { value: '-price', label: 'settings.options.sortPriceDesc' },
    { value: 'rating', label: 'settings.options.sortRating' },
  ],
  'payment.cod.enabledAbove': [
    { value: '0', label: 'settings.options.always' },
  ],
};

/**
 * Builds a renderable control for any backend key.
 *
 * Explicit metadata wins; otherwise the kind is inferred from the value's type
 * so an undeclared key still produces a sensible editor instead of being
 * silently dropped.
 */
export function describeField(key: string, value: unknown): SettingField {
  const curated = CURATED_BY_KEY.get(key);
  if (curated) return curated;

  const textLabel = humanizeKey(key);
  const base = { key, textLabel, textDescription: key };

  if (typeof value === 'boolean') {
    return { ...base, kind: 'toggle' };
  }

  if (typeof value === 'number') {
    return {
      ...base,
      kind: 'number',
      step: Number.isInteger(value) ? 1 : 0.01,
    };
  }

  if (Array.isArray(value)) {
    // A list of primitives; the options are whatever is already stored plus
    // room to remove entries. Adding brand-new entries is not supported by the
    // UI, so the options are seeded from the current value.
    const options = value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => ({ value: entry, text: entry }));

    return { ...base, kind: 'list', options };
  }

  if (typeof value === 'object' && value !== null) {
    return { ...base, kind: 'json' };
  }

  const options = OVERRIDE_OPTIONS[key];
  if (options) {
    // Include the stored value so an unknown current value is still visible.
    const current = String(value ?? '');
    const merged =
      options.some((option) => option.value === current) || current === ''
        ? options
        : [...options, { value: current, text: current }];

    return { ...base, kind: 'select', options: merged };
  }

  if (currentTextValues.has(currentValueString(value))) {
    return { ...base, kind: 'text' };
  }

  return { ...base, kind: 'select', options: [] };
}

function currentValueString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** String values that should stay free text rather than become a dropdown. */
const currentTextValues = new Set([
  '',
  'site.name',
  'site.tagline',
  'site.addressLine',
  'site.logo',
  'site.favicon',
  'site.maintenanceImage',
  'site.supportEmail',
  'analytics.aggregationCron',
  'app.latestAndroidVersion',
  'app.latestIosVersion',
  'app.minAndroidVersion',
  'app.minIosVersion',
  'app.updateMessage',
  'currency.code',
  'currency.symbol',
  'payment.bank.accountNo',
  'payment.bank.holderName',
  'payment.bank.ifsc',
  'payment.razorpay.keyId',
  'payment.razorpay.webhookSecret',
  'payment.upi.id',
  'maintenance.message',
]);

const CURATED_BY_KEY = new Map<string, SettingField>(
  [
    ...GENERAL_FIELDS,
    ...NOTIFICATION_FIELDS,
    ...PRIVACY_FIELDS,
    ...STORAGE_FIELDS,
  ].map((field) => [field.key, field]),
);

export const CATEGORIES = [
  'analytics',
  'app',
  'business',
  'cart',
  'catalog',
  'coupon',
  'currency',
  'customer',
  'feature',
  'general',
  'giftCard',
  'locale',
  'loyalty',
  'notification',
  'order',
  'payment',
  'referral',
  'refund',
  'return',
  'security',
  'shipping',
  'support',
  'system',
  'tax',
  'tracking',
  'vendor',
  'wallet',
] as const;

export type SettingsCategory = (typeof CATEGORIES)[number];

/**
 * Display title per category, written out explicitly rather than built with a
 * template literal. A dynamic `categories.${name}` key is not representable in
 * the translator's type union, and reaching the `.title` leaf by hand keeps the
 * lookup type-checked instead of cast away.
 */
export const CATEGORY_TITLE_KEYS: Record<SettingsCategory, CategoryTitleKey> = {
  analytics: 'categories.analytics.title',
  app: 'categories.app.title',
  business: 'categories.business.title',
  cart: 'categories.cart.title',
  catalog: 'categories.catalog.title',
  coupon: 'categories.coupon.title',
  currency: 'categories.currency.title',
  customer: 'categories.customer.title',
  feature: 'categories.feature.title',
  general: 'categories.general.title',
  giftCard: 'categories.giftCard.title',
  locale: 'categories.locale.title',
  loyalty: 'categories.loyalty.title',
  notification: 'categories.notification.title',
  order: 'categories.order.title',
  payment: 'categories.payment.title',
  referral: 'categories.referral.title',
  refund: 'categories.refund.title',
  return: 'categories.return.title',
  security: 'categories.security.title',
  shipping: 'categories.shipping.title',
  support: 'categories.support.title',
  system: 'categories.system.title',
  tax: 'categories.tax.title',
  tracking: 'categories.tracking.title',
  vendor: 'categories.vendor.title',
  wallet: 'categories.wallet.title',
};

export function isSettingsCategory(value: string): value is SettingsCategory {
  return (CATEGORIES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Key -> category, mirroring the backend's own `SystemSetting.category` column.
// Used only to pre-bucket keys the API has not grouped yet (it shouldn't, but
// a new key with an unknown category must still land somewhere sensible).
// ---------------------------------------------------------------------------

const CATEGORY_BY_PREFIX: ReadonlyArray<readonly [string, SettingsCategory]> = [
  ['analytics.', 'analytics'],
  ['app.', 'app'],
  ['commission.', 'business'],
  ['order.', 'order'],
  ['cart.', 'cart'],
  ['catalog.', 'catalog'],
  ['coupon.', 'coupon'],
  ['currency.', 'currency'],
  ['customer.', 'customer'],
  ['feature.', 'feature'],
  ['site.', 'general'],
  ['giftCard.', 'giftCard'],
  ['date.', 'locale'],
  ['locale.', 'locale'],
  ['time.', 'locale'],
  ['timezone.', 'locale'],
  ['loyalty.', 'loyalty'],
  ['notification.', 'notification'],
  ['payment.', 'payment'],
  ['referral.', 'referral'],
  ['refund.', 'refund'],
  ['return.', 'return'],
  ['review.', 'return'],
  ['security.', 'security'],
  ['shipping.', 'shipping'],
  ['support.', 'support'],
  ['maintenance.', 'system'],
  ['queue.', 'system'],
  ['system.', 'system'],
  ['tax.', 'tax'],
  ['tracking.', 'tracking'],
  ['vendor.', 'vendor'],
  ['wallet.', 'wallet'],
];

export function categoryForKey(key: string): SettingsCategory | 'other' {
  const hit = CATEGORY_BY_PREFIX.find(([prefix]) => key.startsWith(prefix));
  return hit?.[1] ?? 'other';
}

/**
 * Every row needs a title, but only the hand-written fields have an i18n key.
 * These two keep that fallback in one place instead of at each call site.
 */
export function resolveLabel(
  field: SettingField,
  t: (key: FieldLabelKey) => string,
): string {
  return field.textLabel ?? (field.label ? t(field.label) : field.key);
}

export function resolveDescription(
  field: SettingField,
  t: (key: FieldDescriptionKey) => string,
): string | undefined {
  return (
    field.textDescription ??
    (field.description ? t(field.description) : undefined)
  );
}
