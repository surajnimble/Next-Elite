import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '@/libs/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const HEX_KEY = /^[0-9a-fA-F]{64}$/;

/** Must match the backend's `EncryptedPayload` (see its encryption.middleware). */
export type EncryptedPayload = { iv: string; tag: string; data: string };

/** The backend wraps its response as `{ encrypted: true, ...payload }`. */
export type EncryptedEnvelope = { encrypted: true } & EncryptedPayload;

export class CryptoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoConfigError';
  }
}

function getKey(): Buffer {
  const raw = env.API_ENCRYPTION_KEY;

  if (!raw) {
    throw new CryptoConfigError(
      'API_ENCRYPTION_KEY is not configured. Set a 64 character hex key to enable encrypted endpoints.',
    );
  }

  if (!HEX_KEY.test(raw)) {
    throw new CryptoConfigError(
      "API_ENCRYPTION_KEY must be 64 hex characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  return Buffer.from(raw, 'hex');
}

export function encryptPayload(data: unknown): EncryptedPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final(),
  ]);

  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64'),
  };
}

export function decryptPayload(payload: EncryptedPayload): unknown {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(payload.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, 'base64')),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

export function isEncryptedResponse(
  payload: unknown,
): payload is EncryptedEnvelope {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'encrypted' in payload &&
    payload.encrypted === true &&
    'iv' in payload &&
    'tag' in payload &&
    'data' in payload
  );
}
