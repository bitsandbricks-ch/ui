import { defineConfig, devices } from '@playwright/test'

// Browser checks on every Storybook story: axe in light and dark (a11y.spec.ts, blocks CI) and a
// picture in light, dark and at phone width (screenshots.spec.ts, only reported). CI runs them in
// the Playwright image (same browser and fonts every time); `pnpm visual:docker` does the same
// locally. See visual/README.md.
const port = 6007
const ci = !!process.env.CI

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: ci,
  retries: 0,
  workers: ci ? 4 : undefined,
  // CI never writes pictures on its own; a missing or changed one fails the check.
  updateSnapshots: ci ? 'none' : 'missing',
  reporter: ci ? [['list'], ['html', { outputFolder: '../playwright-report', open: 'never' }]] : 'list',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', maxDiffPixelRatio: 0 },
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    locale: 'en-GB',
    timezoneId: 'Europe/Zurich',
    // A browser other than Playwright's own, for a quick look outside the image (pictures may differ).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
  },
  projects: [
    { name: 'light', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, metadata: { scheme: 'light' } },
    { name: 'dark', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, metadata: { scheme: 'dark' } },
    {
      name: 'phone',
      testIgnore: /a11y\.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: true },
      metadata: { scheme: 'light' },
    },
  ],
  webServer: {
    command: 'node serve.mjs',
    cwd: import.meta.dirname,
    env: { PORT: String(port) },
    url: `http://127.0.0.1:${port}/index.json`,
    reuseExistingServer: !ci,
  },
})
