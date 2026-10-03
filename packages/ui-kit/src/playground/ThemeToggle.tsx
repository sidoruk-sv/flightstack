import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
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
  )
}
