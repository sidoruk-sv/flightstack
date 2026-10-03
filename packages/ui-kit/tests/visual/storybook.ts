import { expect, type Locator, type Page } from "@playwright/test"

const STORYBOOK_PORT = process.env.STORYBOOK_PORT ?? "6006"

export const STORYBOOK_URL =
  process.env.STORYBOOK_URL ?? `http://127.0.0.1:${STORYBOOK_PORT}`

export function storyIframeUrl(storyId: string) {
  const params = new URLSearchParams({
    id: storyId,
    viewMode: "story",
  })

  return `${STORYBOOK_URL}/iframe.html?${params.toString()}`
}

export async function captureStory(page: Page, storyId: string) {
  await page.goto(storyIframeUrl(storyId))
  await page.locator("#storybook-root > *").first().waitFor({
    state: "visible",
    timeout: 30_000,
  })
  await page.waitForLoadState("networkidle")
  await page.evaluate(async () => {
    await document.fonts.ready
  })

  const root = page.locator("#storybook-root")
  await root.evaluate((element) => {
    element.style.background = "transparent"
  })

  return root
}

export async function expectStoryScreenshot(
  page: Page,
  storyId: string,
  snapshotName: string,
) {
  const root = await captureStory(page, storyId)
  await expect(root).toHaveScreenshot(snapshotName)
}

export function defaultStoryButton(page: Page) {
  return page.locator('[data-slot="button"]').first()
}

const BUTTON_SCREENSHOT_PADDING = 24

export async function expectButtonScreenshot(
  page: Page,
  button: Locator,
  snapshotName: string,
) {
  const box = await button.boundingBox()

  if (!box) {
    throw new Error("Button bounding box was not found")
  }

  const padding = BUTTON_SCREENSHOT_PADDING

  await expect(page).toHaveScreenshot(snapshotName, {
    clip: {
      x: Math.max(0, box.x - padding),
      y: Math.max(0, box.y - padding),
      width: box.width + padding * 2,
      height: box.height + padding * 2,
    },
  })
}

export async function expectDefaultButtonScreenshot(
  page: Page,
  storyId: string,
  snapshotName: string,
  prepare?: (button: Locator, page: Page) => Promise<void>,
) {
  await captureStory(page, storyId)
  const button = defaultStoryButton(page)

  if (prepare) {
    await prepare(button, page)
  }

  await expectButtonScreenshot(page, button, snapshotName)
}
