import 'server-only';

import {
  decryptPayload,
  encryptPayload,
  isEncryptedResponse,
  type EncryptedEnvelope,
} from '@/libs/encryption';
import { env } from '@/libs/env';
import type { BaseResponse } from '@/libs/models';
import type {
  ApiErrorKind,
  ApiRequestOptions,
  ApiResult,
  HttpMethod,
} from './types';

const TIMEOUT_MS = 15_000;

/** The backend marks encrypted requests with this header. */
const ENCRYPTED_HEADER = { 'x-encrypted': '1' };

/** The backend appends ` Error Code (CODE)` to every error message. */
const CODE_SUFFIX = / Error Code \(([A-Z_0-9]+)\)$/;

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'notFound',
  409: 'conflict',
  413: 'validation',
  415: 'validation',
  422: 'validation',
  429: 'rateLimited',
  500: 'serverError',
  502: 'serverError',
  503: 'maintenance',
  504: 'serverError',
};

const KIND_BY_CODE: Record<string, ApiErrorKind> = {
  RATE_LIMITED: 'rateLimited',
  MAINTENANCE: 'maintenance',
  SERVICE_UNAVAILABLE: 'serverError',
  INTERNAL_ERROR: 'serverError',
  ACCOUNT_SUSPENDED: 'forbidden',
  ACCOUNT_BANNED: 'forbidden',
  ACCOUNT_LOCKED: 'forbidden',
  ACCOUNT_UNVERIFIED: 'forbidden',
  FORBIDDEN: 'forbidden',
};

function errorKind(status: number, code?: string): ApiErrorKind {
  if (code && KIND_BY_CODE[code]) return KIND_BY_CODE[code];
  return KIND_BY_STATUS[status] ?? 'unexpected';
}

function fail(
  message: string,
  error: ApiErrorKind,
  httpStatus: number,
  code?: string,
): ApiResult<never> {
  return { ok: false, message, error, code, httpStatus };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.name === 'AbortError'
      ? 'The request timed out. Please try again.'
      : error.message || 'Network error. Please try again.';
  }
  return 'Network error. Please try again.';
}

/** Splits `"Something went wrong Error Code (TOKEN_EXPIRED)"`. */
function splitCode(raw: string): { message: string; code?: string } {
  const match = CODE_SUFFIX.exec(raw);
  if (!match?.[1]) return { message: raw };
  return { message: raw.slice(0, match.index), code: match[1] };
}

export function buildUrl(
  path: string,
  query?: ApiRequestOptions['query'],
): string {
  const base = env.API_BASE_URL.replace(/\/+$/, '');
  const url = new URL(`${base}/${path.replace(/^\/+/, '')}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/** `API_ENCRYPTION=true` turns it on for every call; a call can opt in/out. */
function isEncrypted(options: ApiRequestOptions): boolean {
  return options.encrypted ?? env.API_ENCRYPTION;
}

function buildHeaders(options: ApiRequestOptions): Record<string, string> {
  const encrypted = isEncrypted(options);

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(encrypted ? ENCRYPTED_HEADER : {}),
    ...options.headers,
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };
}

async function handle<T>(
  response: Response,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> {
  let payload = (await response.json().catch(() => null)) as
    | BaseResponse<unknown>
    | EncryptedEnvelope
    | null;

  if (isEncrypted(options) && isEncryptedResponse(payload)) {
    try {
      payload = decryptPayload(payload) as BaseResponse<unknown>;
    } catch {
      return fail(
        'Unable to decrypt the server response.',
        'unexpected',
        response.status,
      );
    }
  }

  const envelope = payload as BaseResponse<unknown> | null;
  const raw = envelope?.message ?? '';
  const { message, code } = splitCode(raw);

  if (response.ok) {
    if (envelope?.status) {
      return {
        ok: true,
        message,
        data: envelope.result as T,
        httpStatus: response.status,
      };
    }

    return fail(
      message || 'Unknown server error',
      'unexpected',
      response.status,
      code,
    );
  }

  return fail(
    message || `Unexpected server response: ${response.status}`,
    errorKind(response.status, code),
    response.status,
    code,
  );
}

export async function apiFetch<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? TIMEOUT_MS,
  );

  const encrypted = isEncrypted(options);
  const payload =
    body === undefined ? undefined : encrypted ? encryptPayload(body) : body;

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method,
      headers: buildHeaders(options),
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
      signal: controller.signal,
      cache: 'no-store',
    });

    return await handle<T>(response, options);
  } catch (error) {
    return fail(errorMessage(error), 'network', 0);
  } finally {
    clearTimeout(timer);
  }
}
