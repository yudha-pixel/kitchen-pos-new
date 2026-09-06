import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mirrors the "@/*": ["./*"] path mapping in tsconfig.json. Type-only
  // "@/..." imports are erased at transform, so only value imports need this —
  // which is why the alias was missing without every test noticing.
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
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
