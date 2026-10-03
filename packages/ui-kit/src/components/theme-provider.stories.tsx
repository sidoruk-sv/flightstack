import type { Meta, StoryObj } from "@storybook/react-vite"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

function ThemeToggleDemo() {
  const { theme, setTheme } = useTheme()

  function handleToggle() {
    if (theme === "dark") {
      setTheme("light")
      return
    }

    if (theme === "light") {
      setTheme("dark")
      return
    }

    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "light"
        : "dark",
    )
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="rounded-lg border-2 border-border bg-card p-4 shadow-[var(--brutal-shadow-sm)]">
        <p className="text-sm font-medium">Theme provider shell</p>
        <p className="text-sm text-muted-foreground">
          Wraps children with color mode and ui style tokens.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{theme}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggle}
          aria-label="Toggle theme"
        >
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </div>
    </div>
  )
}

const meta = {
  title: "Components/ThemeProvider",
  component: ThemeToggleDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ThemeToggleDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    defaultTheme: "light",
  },
}

export const DarkMode: Story = {
  parameters: {
    defaultTheme: "dark",
  },
}
