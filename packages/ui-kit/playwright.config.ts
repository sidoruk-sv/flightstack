import { defineConfig, devices } from "@playwright/test"

const STORYBOOK_PORT = process.env.STORYBOOK_PORT ?? "6006"
const STORYBOOK_URL = `http://127.0.0.1:${STORYBOOK_PORT}`

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: STORYBOOK_URL,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: `pnpm storybook --ci --port ${STORYBOOK_PORT}`,
    url: STORYBOOK_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
