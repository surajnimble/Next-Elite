import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decryptPayload, encryptPayload, isEncryptedResponse } from './crypto';

vi.mock('@/libs/env', () => ({
  env: {
    get API_ENCRYPTION_KEY() {
      return process.env.API_ENCRYPTION_KEY;
    },
  },
}));

const KEY = 'a'.repeat(64);

describe('crypto', () => {
  beforeEach(() => {
    process.env.API_ENCRYPTION_KEY = KEY;
  });

  afterEach(() => {
    delete process.env.API_ENCRYPTION_KEY;
  });

  it('round-trips an object through { iv, tag, data }', () => {
    const payload = { email: 'a@b.c', nested: { ok: true } };
    const encrypted = encryptPayload(payload);

    expect(Object.keys(encrypted).sort()).toEqual(['data', 'iv', 'tag']);
    expect(decryptPayload(encrypted)).toEqual(payload);
  });

  it('matches the backend wire sizes — 12 byte iv, 16 byte tag', () => {
    const { iv, tag, data } = encryptPayload('x');

    expect(Buffer.from(iv, 'base64')).toHaveLength(12);
    expect(Buffer.from(tag, 'base64')).toHaveLength(16);
    // JSON.stringify('x') is `"x"` — 3 bytes
    expect(Buffer.from(data, 'base64')).toHaveLength(3);
  });

  it('never leaks the plaintext', () => {
    expect(encryptPayload({ email: 'a@b.c' }).data).not.toContain('a@b.c');
  });

  it('produces a different ciphertext every time', () => {
    expect(encryptPayload('x').iv).not.toBe(encryptPayload('x').iv);
  });

  it('rejects a payload tampered with', () => {
    const encrypted = encryptPayload('secret');
    const flipped = Buffer.from(encrypted.data, 'base64');
    flipped[0] = (flipped[0] ?? 0) ^ 0xff;

    expect(() =>
      decryptPayload({ ...encrypted, data: flipped.toString('base64') }),
    ).toThrow();
  });

  it('throws when the key is missing', () => {
    delete process.env.API_ENCRYPTION_KEY;
    expect(() => encryptPayload('x')).toThrow(/API_ENCRYPTION_KEY/);
  });

  it('rejects a non-hex key, matching the backend guard', () => {
    process.env.API_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString('base64');
    expect(() => encryptPayload('x')).toThrow(/64 hex/);
  });

  describe('isEncryptedResponse', () => {
    it('detects the backend envelope', () => {
      expect(
        isEncryptedResponse({ encrypted: true, iv: 'a', tag: 'b', data: 'c' }),
      ).toBe(true);
    });

    it('ignores a plain envelope or a partial one', () => {
      expect(isEncryptedResponse({ status: true, result: {} })).toBe(false);
      expect(isEncryptedResponse({ encrypted: true })).toBe(false);
      expect(isEncryptedResponse({ iv: 'a', tag: 'b', data: 'c' })).toBe(false);
      expect(isEncryptedResponse(null)).toBe(false);
    });
  });
});
