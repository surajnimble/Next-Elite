import { describe, expect, it } from 'vitest';
import { API_URLS, type ApiUrl } from './api-urls';

const ALL_PATHS = Object.values(API_URLS);

describe('api-urls', () => {
  it('holds relative paths without a leading slash', () => {
    for (const path of ALL_PATHS) {
      expect(path.startsWith('/')).toBe(false);
      expect(path.startsWith('api/')).toBe(false);
    }
  });

  it('has no duplicate slashes', () => {
    for (const path of ALL_PATHS) {
      expect(path).not.toContain('//');
    }
  });

  it('names every key after the endpoint it calls', () => {
    expect(API_URLS).toMatchObject({
      login: 'auth/login',
      logout: 'auth/logout',
      getDashboardStats: 'admin/getDashboardStats',
    });
  });

  it('exposes ApiUrl as the union of every path', () => {
    const path: ApiUrl = API_URLS.getDashboardStats;
    expect(path).toBe('admin/getDashboardStats');
  });
});
