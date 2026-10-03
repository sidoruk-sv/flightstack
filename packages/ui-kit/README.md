# ui-kit

Shared UI components for FlightStack apps. Built with [shadcn/ui](https://ui.shadcn.com) — components are **copied into this package as source**, not installed as an opaque library. Under the hood they use [Base UI](https://base-ui.com), Tailwind CSS v4, and a neo-brutal theme layer (`src/neo-brutal.css`).

**Included today:** `button`, `tabs`, `theme-provider`.

## Setup (new app)

1. Add workspace dependencies in the app's `package.json`:

   ```json
   "ui-kit": "workspace:*"
   ```

   `ui-kit/theme.css` imports Space Grotesk via `@fontsource-variable/space-grotesk`. Your app's bundler resolves that import from the app dependency tree (pnpm does not expose ui-kit's transitive deps), so declare the font in the app as well:

   ```json
   "@fontsource-variable/space-grotesk": "^5.2.8"
   ```

   A `devDependency` is enough — Vite bundles the font files at build time.

2. Point shadcn at ui-kit in the app's `components.json` (see `packages/telemetry-viewer/components.json`):

   ```json
   "aliases": {
     "ui": "ui-kit/components",
     "utils": "ui-kit/utils"
   }
   ```

3. Wire styles in the app's CSS entry (Tailwind must scan ui-kit source):

   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "shadcn/tailwind.css";
   @import "ui-kit/theme.css";

   @source "../../ui-kit/src/**/*.{ts,tsx}";
   ```

4. Import by component name (no barrels, no folder paths in imports):

   ```tsx
   import { Button } from 'ui-kit/button'
   import { Tabs, TabsList, TabsTrigger } from 'ui-kit/tabs'
   import { ThemeProvider, useTheme, type UiStyle } from 'ui-kit/theme-provider'

   // localStorage then defaultTheme (default: system)
   import { cn } from 'ui-kit/utils'
   ```

   `package.json` maps `ui-kit/<name>` → `src/components/ui/<name>.tsx` automatically. After `shadcn add dialog`, use `ui-kit/dialog` with no extra steps.

   Import `ui-kit/theme.css` for design tokens (see step 1 for the font package). `ui-kit/styles.css` is playground-only (full Tailwind pipeline) — do not use in apps.

## Adding components

Run the shadcn CLI **from the consuming app** so files land in ui-kit:

```bash
cd packages/telemetry-viewer
pnpm dlx shadcn@latest add dialog
```

To preview in the ui-kit playground instead:

```bash
cd packages/ui-kit
pnpm dlx shadcn@latest add dialog
```

If Tailwind classes look missing in an app, confirm `@source` includes `../../ui-kit/src/**/*.{ts,tsx}`.

After `shadcn add`, the CLI may emit `import { cn } from "@/lib/utils"`. Change it to a relative path so consuming apps typecheck ui-kit source:

```ts
import { cn } from "../../lib/utils"
```

**Design styles:** components use subtle base-nova classes by default. Neo-brutal chrome (thick borders, offset shadows) applies only when `ThemeProvider` sets `uiStyle="neo-brutalism"` (the default). Use `uiStyle="default"` for subtle shell chrome — e.g. map panels inside a brutal app header.

Browse and pick components at [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components). Common groups:

| Group | Examples |
| --- | --- |
| Layout | `card`, `separator`, `scroll-area`, `resizable`, `sidebar` |
| Forms | `input`, `label`, `select`, `checkbox`, `switch`, `textarea`, `form` |
| Feedback | `alert`, `alert-dialog`, `dialog`, `sonner`, `progress`, `skeleton` |
| Navigation | `tabs`, `dropdown-menu`, `navigation-menu`, `breadcrumb`, `command` |
| Data | `table`, `data-table`, `pagination`, `chart` |
| Overlays | `popover`, `tooltip`, `hover-card`, `sheet`, `drawer` |

Some entries pull extra dependencies (e.g. `chart` → Recharts, `sonner` → toast lib); the CLI installs those when you add them.

## Dev

```bash
pnpm ui-kit dev              # playground at localhost (Vite picks a free port)
pnpm ui-kit storybook        # Storybook at http://localhost:6006
pnpm ui-kit build-storybook  # static Storybook build
pnpm ui-kit test:visual      # Playwright screenshot tests against Storybook
pnpm ui-kit test:visual:install  # one-time Chromium install for visual tests
pnpm ui-kit build
pnpm ui-kit typecheck
pnpm ui-kit lint
```

The playground (`src/playground/`) demos every shipped component and variant (button variants, tabs default/line + content panels, `useTheme`). **Storybook** (`src/**/*.stories.tsx`) documents each component with isolated stories. **Visual tests** (`tests/visual/`) capture Playwright screenshots of Storybook iframes — run `pnpm ui-kit test:visual:update` locally after intentional UI changes to refresh baselines. Production apps import via `ui-kit/<name>` exports.
