# UI Kit

Shared React components for FlightStack apps. [shadcn/ui](https://ui.shadcn.com) components live as source in this package — [Base UI](https://base-ui.com), Tailwind v4, neo-brutal theme layer.

## Setup (new app)

1. Workspace dependency:

   ```json
   "ui-kit": "workspace:*"
   ```

   Also declare the font in the app (pnpm does not expose ui-kit transitive deps):

   ```json
   "@fontsource-variable/space-grotesk": "^5.2.8"
   ```

2. shadcn aliases in the app's `components.json` — see `packages/telemetry-viewer/components.json`:

   ```json
   "aliases": {
     "ui": "ui-kit/components",
     "utils": "ui-kit/utils"
   }
   ```

3. App CSS — Tailwind must scan ui-kit source:

   ```css
   @import "tailwindcss";
   @import "tw-animate-css";
   @import "shadcn/tailwind.css";
   @import "ui-kit/theme.css";

   @source "../../ui-kit/src/**/*.{ts,tsx}";
   ```

4. Import by package export name, e.g. `ui-kit/button`, `ui-kit/theme-provider`, `ui-kit/utils`.

## Adding components

From a consuming app (files land in ui-kit):

```bash
cd packages/telemetry-viewer
pnpm dlx shadcn@latest add dialog
```

After `shadcn add`, fix `cn` imports to relative paths (`../../lib/utils`) so consuming apps typecheck ui-kit source.

`ThemeProvider` `uiStyle="neo-brutalism"` is the default chrome; `uiStyle="default"` for subtle panels.

## Dev

```bash
pnpm ui-kit storybook
pnpm ui-kit test:visual:install   # once
pnpm ui-kit test:visual
pnpm ui-kit test:visual:update  # after intentional UI changes
```

Browse components at [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).
