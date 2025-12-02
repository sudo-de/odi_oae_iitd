/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.integration.spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 30000, // 30 seconds for integration tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
