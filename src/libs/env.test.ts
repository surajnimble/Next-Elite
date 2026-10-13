import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { DEFAULT_API_BASE_URL } from './env';

describe('DEFAULT_API_BASE_URL', () => {
  it('is an absolute URL', () => {
    expect(() => new URL(DEFAULT_API_BASE_URL)).not.toThrow();
  });

  it('passes the env url schema', () => {
    expect(z.string().url().safeParse(DEFAULT_API_BASE_URL).success).toBe(true);
  });

  it('has no trailing slash', () => {
    expect(DEFAULT_API_BASE_URL.endsWith('/')).toBe(false);
  });
});
