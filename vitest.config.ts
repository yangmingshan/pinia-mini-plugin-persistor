import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: { __DEV__: true },
  test: {
    watch: false,
    include: ['__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.ts'],
    },
  },
})
