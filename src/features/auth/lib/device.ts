export interface DeviceData {
  deviceId: string;
  platform: string;
  appVersion: string;
  model: string;
  locale: string;
  timezone: string;
}

const DEVICE_ID_STORAGE_KEY = 'next-elite.device-id';
const APP_VERSION = '1.0.0';

/**
 * The backend rejects any `deviceData` value longer than 80 characters
 * (VALIDATION_ERROR), so every field is clamped to this limit.
 */
const MAX_DEVICE_FIELD_LENGTH = 80;

function clamp(value: string, max = MAX_DEVICE_FIELD_LENGTH): string {
  return value.length > max ? value.slice(0, max) : value;
}

function readStoredDeviceId(): string | null {
  try {
    return window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function createDeviceId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Collects the browser/device fingerprint the login endpoint expects. The
 * device id is persisted in `localStorage` so it stays stable across logins.
 */
export function getDeviceData(locale: string): DeviceData {
  let deviceId = readStoredDeviceId();
  if (!deviceId) {
    deviceId = createDeviceId();
    try {
      window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    } catch {
      // Ignore storage failures (private mode, quota, etc.).
    }
  }

  return {
    deviceId: clamp(deviceId),
    platform: 'WEB',
    appVersion: clamp(APP_VERSION),
    model: clamp(
      typeof navigator !== 'undefined' ? navigator.userAgent : 'Web',
    ),
    locale: clamp(locale),
    timezone: clamp(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
  };
}
