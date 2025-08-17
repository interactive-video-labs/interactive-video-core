import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    reporters: [
      'default',
      ['junit', { outputFile: 'test-report.junit.xml' }]
    ],
    outputFile: {
      junit: 'test-report.junit.xml'
    },
    coverage: {
      provider: 'v8', 
      reporter: ['text', 'lcov', 'json'],
      reportsDirectory: './coverage'
    }
  }
})
