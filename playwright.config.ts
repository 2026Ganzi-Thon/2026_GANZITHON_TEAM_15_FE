import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests', fullyParallel: false,
  use: { baseURL: 'http://localhost:4173', viewport: { width: 390, height: 844 }, browserName: 'chromium', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: { command: 'node node_modules/vite/bin/vite.js --mode mock --host localhost --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
})
