import 'server-only';

import { env } from '@/libs/env';
import type { DashboardStats } from '../types';

interface ApiEnvelope<T> {
  status: boolean;
  message: string;
  result: T;
}

/** Error raised when the backend rejects the request or is unreachable. */
export class DashboardApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'DashboardApiError';
    this.status = status;
  }
}

function apiBaseUrl(): string {
  return env.API_BASE_URL.replace(/\/+$/, '');
}

/**
 * Loads the admin dashboard metrics from the backend
 * `GET /api/v1/admin/getDashboardStats` endpoint. The access token is sent as a
 * bearer token when available.
 */
export async function getDashboardStats(
  accessToken?: string,
): Promise<DashboardStats> {
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/admin/getDashboardStats`,
    {
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: 'no-store',
    },
  );

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<DashboardStats> | null;

  if (!response.ok || !payload?.status || !payload.result) {
    throw new DashboardApiError(
      payload?.message ?? 'Unable to load dashboard stats.',
      response.status,
    );
  }

  return payload.result;
}
