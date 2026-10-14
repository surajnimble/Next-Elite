/** Mirrors the backend's `ERROR_CODE` categories we branch on. */
export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'rateLimited'
  | 'maintenance'
  | 'serverError'
  | 'network'
  | 'unexpected';

export type ApiSuccess<T> = {
  ok: true;
  message: string;
  data: T;
  httpStatus: number;
};

export type ApiFailure = {
  ok: false;
  /** Backend message with the trailing `Error Code (X)` stripped. */
  message: string;
  error: ApiErrorKind;
  /** Backend `ERROR_CODE`, e.g. `TOKEN_EXPIRED`, `RATE_LIMITED`. */
  code?: string;
  httpStatus: number;
  /** Extra detail for validation failures. */
  errors?: unknown[];
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function isApiSuccess<T>(r: ApiResult<T>): r is ApiSuccess<T> {
  return r.ok;
}

export function isApiFailure<T>(r: ApiResult<T>): r is ApiFailure {
  return !r.ok;
}

/** Codes that mean "this session is dead — send the user back to login". */
export const SESSION_DEAD_CODES = [
  'TOKEN_EXPIRED',
  'SESSION_EXPIRED',
  'UNAUTHORIZED',
] as const;

export function isSessionDead(code?: string): boolean {
  return !!code && (SESSION_DEAD_CODES as readonly string[]).includes(code);
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  encrypted?: boolean;
};
