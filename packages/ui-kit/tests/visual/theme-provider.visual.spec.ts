import { test } from "@playwright/test"

import { expectStoryScreenshot } from "./storybook"

test.describe("ThemeProvider", () => {
  test("default light", async ({ page }) => {
    await expectStoryScreenshot(
      page,
      "components-themeprovider--default",
      "theme-provider-default-light.png",
    )
  })

  test("dark mode default", async ({ page }) => {
    await expectStoryScreenshot(
      page,
      "components-themeprovider--dark-mode",
      "theme-provider-dark-mode.png",
    )
  })
})
