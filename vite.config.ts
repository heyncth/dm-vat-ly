import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Phase 1: minimal config. The `test` section supports the shell smoke test.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testSetup.ts'],
  },
});
