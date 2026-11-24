# BitsAndBricks UI

The tokens, React components and dashboard widgets the BitsAndBricks apps share, so Hubra,
Floorbit, Labdex, Seatbit and Mason read as siblings: one set of neutrals, status colours, radii,
type and the dot grid, and each app its own accent.

| Package | What |
| --- | --- |
| [`@bitsandbricks-ch/tokens`](packages/tokens) | CSS variables (`--bnb-*`), light and dark, plus the same values as JSON |
| [`@bitsandbricks-ch/ui`](packages/ui) | React 19 and Mantine 9: `createBnbTheme`, page head, stat tile, data table with pager and filters, empty and error states, confirm dialogs, side panel, status badges, app shell, theme switch, toasts, and the shared plugin types |
| [`@bitsandbricks-ch/widgets`](packages/widgets) | Stat, gauge, graph, bars, columns, pie, histogram, rows and time chart, drawn from plugin widget data in plain SVG |

Storybook shows every component in each app's accent, light and dark: TODO: the GitHub Pages link
once Pages is on for this repo.

## Install

The packages are on GitHub Packages. Tell npm or pnpm where `@bitsandbricks-ch` lives, in the app's
`.npmrc`:

```ini
@bitsandbricks-ch:registry=https://npm.pkg.github.com
```

and log in once with a GitHub token that can read packages (`npm login --registry=https://npm.pkg.github.com`).
CI uses `GITHUB_TOKEN`.

```sh
pnpm add @bitsandbricks-ch/ui @bitsandbricks-ch/tokens     # React and Mantine apps
pnpm add @bitsandbricks-ch/tokens                          # any other app
```

## React and Mantine apps

```tsx
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@bitsandbricks-ch/tokens/tokens.css'
import '@bitsandbricks-ch/ui/styles.css'
import { accents, BnbProvider, createBnbTheme, createColorSchemeManager } from '@bitsandbricks-ch/ui'
import { Link, useSearchParams } from 'react-router-dom'

const theme = createBnbTheme({ accent: accents.hubra })

<BnbProvider theme={theme} locale="de" translate={i18n.t} link={Link} useSearchParams={useSearchParams}
  colorSchemeManager={createColorSchemeManager({ cookie: 'hubra_theme', parentDomain: true })}>
  <App />
</BnbProvider>
```

- `accent` is one hex, or `{ light, dark }` when the light one must be deeper to read on white.
  `fonts` keeps an app's own type (Hubra: Hanken Grotesk and Bricolage Grotesque).
- `translate` is optional: the components bring English and German texts, and any key the app
  knows wins.
- `link` and `useSearchParams` let the side panel, the sidebar and the lists use the app's router.
  Without them, plain links and the address bar are used.
- `theme-script.js` (`@bitsandbricks-ch/ui/theme-script.js`) paints the saved light or dark theme
  before the app loads; serve it as a file and load it in `<head>`.

## Vue, Astro and Tailwind apps

Load the tokens and the app's accent, then use the variables:

```css
@import '@bitsandbricks-ch/tokens/tokens.css';
@import '@bitsandbricks-ch/tokens/accents/labdex.css';   /* or your own accentCss() */

.card { background: var(--bnb-surface); border: 1px solid var(--bnb-line); border-radius: var(--bnb-radius-lg); }
.button-primary { background: var(--bnb-accent); color: var(--bnb-on-accent); }
```

Dark applies with `data-theme="dark"` or `data-mantine-color-scheme="dark"` on `<html>`, or the
system setting when the page chose neither. Tailwind 4 maps them in `@theme`
(`--color-surface: var(--bnb-surface);`).

## Develop

```sh
pnpm install
pnpm test            # Vitest and Testing Library
pnpm storybook       # http://localhost:6006
pnpm lint && pnpm typecheck && pnpm build
```

A change to a package adds a changeset (`pnpm changeset`). Releases: see
[.changeset/README.md](.changeset/README.md).

## Where it came from

`@bitsandbricks-ch/ui` started from Hubra's `packages/ui` (theme, filters, side panel, feedback) and
Floorbit's components (data table, stat tile, state badges, theme as CSS variables), merged where
both had one. `@bitsandbricks-ch/widgets` is Floorbit's widget kit with its tests.

## Licence

MIT, see [LICENSE](LICENSE).
