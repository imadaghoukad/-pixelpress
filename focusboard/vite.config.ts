import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  css: { postcss: { plugins: [] } },
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
