import type { Decorator } from "@storybook/react-vite"
import type { Preview } from "@storybook/react-vite"

import {
  ThemeProvider,
  type UiStyle,
} from "../src/components/theme-provider"
import "../src/index.css"

type StoryTheme = "dark" | "light" | "system"

const withThemeProvider: Decorator = (Story, context) => {
  const uiStyle = (context.parameters.uiStyle as UiStyle | undefined) ?? "neo-brutalism"
  const defaultTheme =
    (context.parameters.defaultTheme as StoryTheme | undefined) ?? "light"
  const themeScope = context.viewMode === "docs" ? "wrapper" : "document"

  return (
    <ThemeProvider
      key={context.id}
      defaultTheme={defaultTheme}
      uiStyle={uiStyle}
      storageKey={`ui-kit-storybook-${context.id}`}
      themeScope={themeScope}
    >
      <div className="bg-background p-6 text-foreground">
        <Story />
      </div>
    </ThemeProvider>
  )
}

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withThemeProvider],
}

export default preview
