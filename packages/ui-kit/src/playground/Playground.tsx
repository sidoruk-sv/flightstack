import { useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ButtonDemo } from "./ButtonDemo"
import { APP_TABS, DEFAULT_TAB, type AppTabId } from "./constants"
import { TabPanel } from "./TabPanel"
import { TabsDemo } from "./TabsDemo"
import { ThemeToggle } from "./ThemeToggle"

export function Playground() {
  const [activeTab, setActiveTab] = useState<AppTabId>(DEFAULT_TAB)
  const [mountedTabs, setMountedTabs] = useState<Set<AppTabId>>(
    () => new Set([DEFAULT_TAB]),
  )

  function handleTabChange(value: string | number | null) {
    if (value === null) {
      return
    }

    const tab = String(value) as AppTabId
    setActiveTab(tab)
    setMountedTabs((current) => {
      if (current.has(tab)) {
        return current
      }

      const next = new Set(current)
      next.add(tab)
      return next
    })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b-2 border-border bg-card px-6 py-4 shadow-[var(--brutal-shadow-sm)]">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">ui-kit</h1>
          <p className="text-sm text-muted-foreground">Component playground</p>
        </div>
        <ThemeToggle />
      </header>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b-2 border-border bg-card px-6 py-3">
          <TabsList>
            {APP_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 p-6">
          {mountedTabs.has("button") && (
            <TabPanel active={activeTab === "button"}>
              <ButtonDemo />
            </TabPanel>
          )}

          {mountedTabs.has("tabs") && (
            <TabPanel active={activeTab === "tabs"}>
              <TabsDemo />
            </TabPanel>
          )}
        </div>
      </Tabs>

      <footer className="border-t-2 border-border px-6 py-3 font-mono text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode ·{" "}
        <code className="text-foreground">useTheme</code> in header
      </footer>
    </div>
  )
}
