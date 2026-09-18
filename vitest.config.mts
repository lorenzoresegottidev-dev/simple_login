import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['unit_tests/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser-integration',
          include: ['integration_tests/**/*.test.ts?(x)', 'component_tests/**/*.test.ts?(x)'],
          environment: 'jsdom',
        },
      },
    ],
  },
});