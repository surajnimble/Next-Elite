import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/** Base URL of the external backend API, including the version prefix. */
export const DEFAULT_API_BASE_URL =
  'https://projectname-api.onrender.com/api/v1';

export const env = createEnv({
  server: {
    API_BASE_URL: z.string().url().default(DEFAULT_API_BASE_URL),
    SENTRY_DSN: z.string().url().optional(),
    /** Master switch for the `{ encryptedData }` API layer. */
    API_ENCRYPTION: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    /** Base64 encoded 32 byte key, required when `API_ENCRYPTION` is on. */
    API_ENCRYPTION_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === 'lint',
  emptyStringAsUndefined: true,
});
