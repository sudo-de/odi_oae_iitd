/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/users/users.controller.spec.ts', 'src/data-management/data-management.controller.spec.ts', 'src/**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 60000, // 60 seconds for e2e tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
