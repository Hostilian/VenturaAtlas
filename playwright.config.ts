import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        viewport: { width: 1440, height: 900 } 
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 } 
      },
    },
  ],
  webServer: {
    command: 'python -m http.server 8080 --directory _site',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
