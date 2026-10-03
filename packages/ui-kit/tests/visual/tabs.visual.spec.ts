import { test } from "@playwright/test"

import { expectStoryScreenshot } from "./storybook"

test.describe("Tabs", () => {
  test("default", async ({ page }) => {
    await expectStoryScreenshot(page, "components-tabs--default", "tabs-default.png")
  })

  test("line", async ({ page }) => {
    await expectStoryScreenshot(page, "components-tabs--line", "tabs-line.png")
  })

  test("vertical", async ({ page }) => {
    await expectStoryScreenshot(page, "components-tabs--vertical", "tabs-vertical.png")
  })
})
