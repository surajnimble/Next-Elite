import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // The real `server-only` package throws outside the `react-server`
      // export condition, which Vitest does not set. Stub it so server
      // modules (the API layer) can be unit tested.
      'server-only': fileURLToPath(
        new URL('./server-only.ts', import.meta.url),
      ),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['config/vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**', '.next/**'],
    env: {
      SKIP_ENV_VALIDATION: 'true',
    },
  },
});
