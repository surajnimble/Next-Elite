import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, buildUrl } from './rest-adapter';
import { isSessionDead } from './types';
import type { DashboardStats } from '@/libs/models';
import {
  decryptPayload,
  encryptPayload,
  type EncryptedPayload,
} from '@/libs/encryption';

// `SKIP_ENV_VALIDATION` makes `@t3-oss/env` snapshot `process.env` at import
// time, so read it lazily instead.
vi.mock('@/libs/env', () => ({
  env: {
    get API_BASE_URL() {
      return process.env.API_BASE_URL;
    },
    get API_ENCRYPTION() {
      return process.env.API_ENCRYPTION === 'true';
    },
    get API_ENCRYPTION_KEY() {
      return process.env.API_ENCRYPTION_KEY;
    },
  },
}));

const BASE_URL = 'https://api.example.com/api/v1';
const KEY = 'ab'.repeat(32);

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const STATS: DashboardStats = {
  totalUsers: 5,
  totalVendors: 1,
  pendingVendors: 0,
  totalProducts: 4,
  totalOrders: 0,
  revenue30d: 0,
  openTickets: 0,
  pendingReturns: 0,
  pendingRefunds: 0,
};

describe('rest-adapter', () => {
  beforeEach(() => {
    process.env.API_BASE_URL = BASE_URL;
    process.env.API_ENCRYPTION = 'false';
    process.env.API_ENCRYPTION_KEY = KEY;
  });

  afterEach(() => {
    delete process.env.API_BASE_URL;
    delete process.env.API_ENCRYPTION;
    delete process.env.API_ENCRYPTION_KEY;
    vi.unstubAllGlobals();
  });

  describe('buildUrl', () => {
    it('joins the base url and the path', () => {
      expect(buildUrl('auth/login')).toBe(`${BASE_URL}/auth/login`);
    });

    it('tolerates leading and trailing slashes', () => {
      expect(buildUrl('/auth/login')).toBe(`${BASE_URL}/auth/login`);
      expect(buildUrl('auth/login/')).toBe(`${BASE_URL}/auth/login/`);
    });

    it('appends defined query params and skips undefined ones', () => {
      expect(
        buildUrl('admin/getDashboardStats', {
          page: 1,
          limit: 20,
          search: undefined,
        }),
      ).toBe(`${BASE_URL}/admin/getDashboardStats?page=1&limit=20`);
    });

    it('appends the version when the env holds the bare host', () => {
      process.env.API_BASE_URL = 'https://api.example.com';
      expect(buildUrl('auth/login')).toBe(`${BASE_URL}/auth/login`);
    });

    it('appends the version when the env has a trailing slash', () => {
      process.env.API_BASE_URL = 'https://api.example.com/';
      expect(buildUrl('auth/login')).toBe(`${BASE_URL}/auth/login`);
    });

    it('keeps an explicit version in the env instead of doubling it', () => {
      process.env.API_BASE_URL = 'https://api.example.com/api/v2';
      expect(buildUrl('auth/login')).toBe(
        'https://api.example.com/api/v2/auth/login',
      );
    });
  });

  describe('apiFetch', () => {
    it('returns a success result with the parsed envelope', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            jsonResponse(200, {
              status: true,
              message: 'Dashboard stats fetched successfully.',
              result: STATS,
            }),
          ),
        ),
      );

      const result = await apiFetch<DashboardStats>(
        'GET',
        'admin/getDashboardStats',
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(STATS);
        expect(result.message).toBe('Dashboard stats fetched successfully.');
        expect(result.httpStatus).toBe(200);
      }
    });

    it('sends the bearer token when provided', async () => {
      const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
        Promise.resolve(
          jsonResponse(200, { status: true, message: 'ok', result: STATS }),
        ),
      );
      vi.stubGlobal('fetch', fetchMock);

      await apiFetch<DashboardStats>(
        'GET',
        'admin/getDashboardStats',
        undefined,
        {
          token: 'abc123',
        },
      );

      const headers = fetchMock.mock.calls[0]?.[1]?.headers as
        | Record<string, string>
        | undefined;
      expect(headers?.Authorization).toBe('Bearer abc123');
    });

    it('omits the Authorization header without a token', async () => {
      const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
        Promise.resolve(
          jsonResponse(200, { status: true, message: 'ok', result: STATS }),
        ),
      );
      vi.stubGlobal('fetch', fetchMock);

      await apiFetch<DashboardStats>('GET', 'admin/getDashboardStats');

      const headers = fetchMock.mock.calls[0]?.[1]?.headers as
        | Record<string, string>
        | undefined;
      expect(headers?.Authorization).toBeUndefined();
    });

    it('maps an envelope with status false to a failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            jsonResponse(200, {
              status: false,
              message: 'Invalid credentials.',
            }),
          ),
        ),
      );

      const result = await apiFetch('POST', 'auth/login', {});

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('Invalid credentials.');
        expect(result.error).toBe('unexpected');
      }
    });

    it.each([
      [400, 'validation'],
      [401, 'unauthorized'],
      [403, 'forbidden'],
      [404, 'notFound'],
      [409, 'conflict'],
      [429, 'rateLimited'],
      [500, 'serverError'],
      [503, 'maintenance'],
      [418, 'unexpected'],
    ])('maps http %i to the %s error kind', async (status, kind) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(jsonResponse(status, { status: false }))),
      );

      const result = await apiFetch('GET', 'admin/getDashboardStats');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(kind);
        expect(result.httpStatus).toBe(status);
      }
    });

    it('never throws when the network fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new Error('boom'))),
      );

      const result = await apiFetch('GET', 'admin/getDashboardStats');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('network');
        expect(result.httpStatus).toBe(0);
        expect(result.message).toBe('boom');
      }
    });

    it('handles a non-json error body', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.reject(new Error('not json')),
          } as Response),
        ),
      );

      const result = await apiFetch('GET', 'admin/getDashboardStats');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('serverError');
        expect(result.message).toContain('500');
      }
    });

    describe('error code suffix', () => {
      function failing(status: number, message: string) {
        vi.stubGlobal(
          'fetch',
          vi.fn(() =>
            Promise.resolve(jsonResponse(status, { status: false, message })),
          ),
        );
      }

      it('extracts the code and strips it from the message', async () => {
        failing(401, 'Your token has expired Error Code (TOKEN_EXPIRED)');

        const result = await apiFetch('GET', 'admin/getDashboardStats');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBe('TOKEN_EXPIRED');
          expect(result.message).toBe('Your token has expired');
          expect(result.error).toBe('unauthorized');
        }
      });

      it('flags a dead session', async () => {
        failing(401, 'Session expired Error Code (SESSION_EXPIRED)');

        const result = await apiFetch('GET', 'admin/getDashboardStats');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(isSessionDead(result.code)).toBe(true);
        }
      });

      it('leaves a message without a suffix untouched', async () => {
        failing(400, 'Email already exists');

        const result = await apiFetch('POST', 'auth/login', {});

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBeUndefined();
          expect(result.message).toBe('Email already exists');
          expect(result.error).toBe('validation');
        }
      });

      it('lets the code refine 503 into maintenance', async () => {
        failing(503, 'Down for maintenance Error Code (MAINTENANCE)');

        const result = await apiFetch('GET', 'admin/getDashboardStats');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBe('maintenance');
        }
      });

      it('lets the code refine 403 into forbidden', async () => {
        failing(403, 'Account banned Error Code (ACCOUNT_BANNED)');

        const result = await apiFetch('GET', 'admin/getDashboardStats');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBe('forbidden');
          expect(result.code).toBe('ACCOUNT_BANNED');
        }
      });
    });

    describe('encryption switch', () => {
      const okResponse = () =>
        jsonResponse(200, { status: true, message: 'ok', result: {} });

      function captureBody() {
        const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
          Promise.resolve(okResponse()),
        );
        vi.stubGlobal('fetch', fetchMock);
        return fetchMock;
      }

      it('sends a plain body when off', async () => {
        const fetchMock = captureBody();

        await apiFetch('POST', 'auth/login', { email: 'a@b.c' });

        const body = fetchMock.mock.calls[0]?.[1]?.body as string;
        expect(JSON.parse(body)).toEqual({ email: 'a@b.c' });
      });

      it('wraps the body in { iv, tag, data } and marks it x-encrypted', async () => {
        process.env.API_ENCRYPTION = 'true';
        const fetchMock = captureBody();

        await apiFetch('POST', 'auth/login', { email: 'a@b.c' });

        const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
        expect(decryptPayload(body as EncryptedPayload)).toEqual({
          email: 'a@b.c',
        });

        const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<
          string,
          string
        >;
        expect(headers['x-encrypted']).toBe('1');
      });

      it('omits the x-encrypted header when off', async () => {
        const fetchMock = captureBody();

        await apiFetch('POST', 'auth/login', { email: 'a@b.c' });

        const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<
          string,
          string
        >;
        expect(headers['x-encrypted']).toBeUndefined();
      });

      it('decrypts the response when on', async () => {
        process.env.API_ENCRYPTION = 'true';
        vi.stubGlobal(
          'fetch',
          vi.fn(() =>
            Promise.resolve(
              jsonResponse(200, {
                encrypted: true,
                ...encryptPayload({
                  status: true,
                  message: 'ok',
                  result: STATS,
                }),
              }),
            ),
          ),
        );

        const result = await apiFetch<DashboardStats>(
          'GET',
          'admin/getDashboardStats',
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data).toEqual(STATS);
        }
      });

      it('lets a single call opt out while the switch is on', async () => {
        process.env.API_ENCRYPTION = 'true';
        const fetchMock = captureBody();

        await apiFetch(
          'POST',
          'auth/login',
          { email: 'a@b.c' },
          {
            encrypted: false,
          },
        );

        const body = fetchMock.mock.calls[0]?.[1]?.body as string;
        expect(JSON.parse(body)).toEqual({ email: 'a@b.c' });
      });

      it('lets a single call opt in while the switch is off', async () => {
        const fetchMock = captureBody();

        await apiFetch(
          'POST',
          'auth/login',
          { email: 'a@b.c' },
          {
            encrypted: true,
          },
        );

        const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
        expect(decryptPayload(body as EncryptedPayload)).toEqual({
          email: 'a@b.c',
        });
      });
    });
  });
});
