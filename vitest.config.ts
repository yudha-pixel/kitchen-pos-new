import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts'],
    // Order tests run sequentially against a shared local Postgres instance
    // (no test containers in this project yet); parallel files could race
    // on the same ingredient/product rows.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
