import { test } from "@playwright/test"

import { expectDefaultButtonScreenshot, expectStoryScreenshot } from "./storybook"

const DEFAULT_BUTTON_STORY = "components-button--default"

test.describe("Button", () => {
  test("default", async ({ page }) => {
    await expectDefaultButtonScreenshot(
      page,
      DEFAULT_BUTTON_STORY,
      "button-default.png",
    )
  })

  test("default hover", async ({ page }) => {
    await expectDefaultButtonScreenshot(
      page,
      DEFAULT_BUTTON_STORY,
      "button-default-hover.png",
      async (button) => {
        await button.hover()
      },
    )
  })

  test("default active", async ({ page }) => {
    await expectDefaultButtonScreenshot(
      page,
      DEFAULT_BUTTON_STORY,
      "button-default-active.png",
      async (button, page) => {
        const box = await button.boundingBox()

        if (!box) {
          throw new Error("Default button bounding box was not found")
        }

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
      },
    )
  })

  test("default focused", async ({ page }) => {
    await expectDefaultButtonScreenshot(
      page,
      DEFAULT_BUTTON_STORY,
      "button-default-focused.png",
      async (button) => {
        await button.evaluate((element) => {
          if (element instanceof HTMLElement) {
            element.focus({ focusVisible: true })
          }
        })
      },
    )
  })

  test("outline", async ({ page }) => {
    await expectStoryScreenshot(page, "components-button--outline", "button-outline.png")
  })

  test("all variants", async ({ page }) => {
    await expectStoryScreenshot(
      page,
      "components-button--all-variants",
      "button-all-variants.png",
    )
  })
})
