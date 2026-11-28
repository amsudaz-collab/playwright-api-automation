const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-report/playwright-html', open: 'never' }],
    ['json', { outputFile: 'e2e-report/results.json' }],
  ],
  use: {
    baseURL: 'https://testautomationpractice.blogspot.com',
    browserName: 'chromium',
    headless: true,
    screenshot: 'off',
    trace: 'off',
  },
});
