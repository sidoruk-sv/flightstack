export const APP_TABS = [
  { id: "button", label: "Button" },
  { id: "tabs", label: "Tabs" },
] as const

export type AppTabId = (typeof APP_TABS)[number]["id"]

export const DEFAULT_TAB: AppTabId = "button"
