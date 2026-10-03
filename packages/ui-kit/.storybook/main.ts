import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig } from "vite"

const configDir = fileURLToPath(new URL(".", import.meta.url))
const srcDir = resolve(configDir, "../src")

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  async viteFinal(storybookConfig) {
    return mergeConfig(storybookConfig, {
      resolve: {
        alias: {
          "@": srcDir,
        },
        dedupe: ["react", "react-dom"],
      },
      plugins: [tailwindcss()],
    })
  },
  staticDirs: [resolve(configDir, "../public")],
}

export default config
