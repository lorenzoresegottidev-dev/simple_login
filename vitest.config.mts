import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit_tests/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser-integration',
          include: ['tests/integration_tests/**/*.test.ts?(x)', 'tests/component_tests/**/*.test.ts?(x)'],
          environment: 'jsdom',
        },
      },
      {
        test: {
          name: 'api',
          include: ['tests/api_tests/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});