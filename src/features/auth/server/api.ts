import 'server-only';

import type { ApiUserData } from '../lib/map-user';
import { env } from '@/libs/env';

export interface LoginDeviceData {
  deviceId: string;
  platform: string;
  appVersion: string;
  model: string;
  locale: string;
  timezone: string;
}

export interface LoginApiInput {
  email: string;
  password: string;
  phone?: string;
  deviceData?: LoginDeviceData;
}

export interface LoginApiResult {
  accessToken: string;
  expiresIn: number;
  twoFactorRequired: boolean;
  userData: ApiUserData;
  rolesList?: string[];
  [key: string]: unknown;
}

/** A successful login response — the API `message` plus its `result`. */
export interface LoginApiResponse {
  message: string;
  result: LoginApiResult;
}

interface ApiEnvelope<T> {
  status: boolean;
  message: string;
  result: T;
}

/** Error raised when the backend rejects a request or is unreachable. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function apiBaseUrl(): string {
  return env.API_BASE_URL.replace(/\/+$/, '');
}

/** Authenticates against the backend `POST /api/v1/auth/login` endpoint. */
export async function loginWithApi(
  input: LoginApiInput,
): Promise<LoginApiResponse> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<LoginApiResult> | null;

  if (!response.ok || !payload?.status || !payload.result) {
    throw new ApiError(
      payload?.message ?? 'Unable to sign in. Please try again.',
      response.status,
    );
  }

  return { message: payload.message, result: payload.result };
}

/**
 * Ends the session on the backend (`POST /api/v1/auth/logout`) and returns the
 * API `message`. The access token is sent as a bearer token when available.
 */
export async function logoutWithApi(accessToken?: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({}),
    cache: 'no-store',
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<unknown> | null;

  if (!response.ok || !payload?.status) {
    throw new ApiError(
      payload?.message ?? 'Unable to sign out. Please try again.',
      response.status,
    );
  }

  return payload.message;
}
