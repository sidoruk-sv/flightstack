import * as React from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"
export type UiStyle = "neo-brutalism" | "default"
export type ThemeScope = "document" | "wrapper"

type ThemeProviderProps = {
  children: React.ReactNode
  /** Initial color mode when nothing is stored yet for `storageKey`. Defaults to `system`. */
  defaultTheme?: Theme
  /** Visual design system — separate from light/dark color mode. */
  uiStyle?: UiStyle
  storageKey?: string
  disableTransitionOnChange?: boolean
  /** Apply theme tokens on `<html>` or a local wrapper (for inline docs previews). */
  themeScope?: ThemeScope
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: Theme[] = ["dark", "light", "system"]

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }

  return THEME_VALUES.includes(value as Theme)
}

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}

function readStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  const storedTheme = localStorage.getItem(storageKey)
  if (isTheme(storedTheme)) {
    return storedTheme
  }

  return defaultTheme
}

function applyUiStyle(root: HTMLElement, uiStyle: UiStyle) {
  if (uiStyle === "default") {
    delete root.dataset.style
    return
  }

  root.dataset.style = uiStyle
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme()
  }

  return theme
}

function applyDocumentTheme(
  nextTheme: Theme,
  uiStyle: UiStyle,
  disableTransitionOnChange: boolean,
) {
  const root = document.documentElement
  const resolvedTheme = resolveTheme(nextTheme)
  const restoreTransitions = disableTransitionOnChange
    ? disableTransitionsTemporarily()
    : null

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)
  applyUiStyle(root, uiStyle)

  if (restoreTransitions) {
    restoreTransitions()
  }
}

function ThemeProviderImpl({
  children,
  defaultTheme = "system",
  uiStyle = "neo-brutalism",
  storageKey = "theme",
  disableTransitionOnChange = true,
  themeScope = "document",
  ...props
}: ThemeProviderProps) {
  const [storedTheme, setStoredTheme] = React.useState<Theme>(() => {
    return readStoredTheme(storageKey, defaultTheme)
  })
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() => {
    return getSystemTheme()
  })

  const resolvedTheme =
    storedTheme === "system" ? systemTheme : storedTheme

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setStoredTheme(nextTheme)
    },
    [storageKey]
  )

  React.useLayoutEffect(() => {
    if (themeScope !== "document") {
      return undefined
    }

    applyDocumentTheme(storedTheme, uiStyle, disableTransitionOnChange)

    if (storedTheme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyDocumentTheme("system", uiStyle, disableTransitionOnChange)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [storedTheme, disableTransitionOnChange, themeScope, uiStyle])

  React.useEffect(() => {
    if (themeScope !== "wrapper" || storedTheme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      setSystemTheme(getSystemTheme())
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [storedTheme, themeScope])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      const nextTheme =
        storedTheme === "dark"
          ? "light"
          : storedTheme === "light"
            ? "dark"
            : getSystemTheme() === "dark"
              ? "light"
              : "dark"

      setTheme(nextTheme)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [storedTheme, setTheme])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== storageKey) {
        return
      }

      if (isTheme(event.newValue)) {
        setStoredTheme(event.newValue)
        return
      }

      setStoredTheme(defaultTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme, storageKey])

  const value = React.useMemo(
    () => ({
      theme: storedTheme,
      setTheme,
    }),
    [storedTheme, setTheme]
  )

  const themedChildren =
    themeScope === "wrapper" ? (
      <div
        className={resolvedTheme}
        data-style={uiStyle === "neo-brutalism" ? uiStyle : undefined}
      >
        {children}
      </div>
    ) : (
      children
    )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {themedChildren}
    </ThemeProviderContext.Provider>
  )
}

export function ThemeProvider({
  storageKey = "theme",
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  return (
    <ThemeProviderImpl
      key={`${storageKey}:${defaultTheme}`}
      storageKey={storageKey}
      defaultTheme={defaultTheme}
      {...props}
    />
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
