import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default;
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.next', 'packages/*/tests/**'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  };
});
