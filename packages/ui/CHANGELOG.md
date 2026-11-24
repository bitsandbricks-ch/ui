# @bitsandbricks/ui

## 0.3.0

### Minor Changes

- 37de5c1: New `CardTable`: a card grid with a table's search, filters (with a count per choice) and pages, for galleries such as dashboard widgets, plugins or templates. It can keep search, filters and page in the address (`urlState`).
- d67610d: Components keep their own texts and CSS. `defineTexts({ en, de })` and `useT(texts)` let a component bring its own words (the app's `t` still wins), and each component's `Name.css` is built into `styles.css`. The package now exports every public module, which adds `TopBarSlot`, `useTopBarSlot` and the `LinkComponent` type. Nothing an app uses changes.
- 5bbc005: `createBnbTheme({ accent: 'css' })` takes the accent from the app's stylesheet (`--bnb-accent-light`, `--bnb-accent-dark`, `--bnb-on-accent-*`) instead of the theme, so an admin's colour or a preset applies at run time without rebuilding the theme. The Mantine accent shades are mixed by the browser from those variables.
- 896bd63: Add DashboardGrid from Floorbit: boxes on a grid of whole columns and rows that never overlap and float up. Move them with a grip (drag or arrow keys) and resize them with a corner (drag or Shift+arrows). Rows can be fixed or fit to the screen, and boxes stack on a phone. The column count is the app's choice. The layout math is exported too (`moveInGrid`, `compactGrid`, `freeSpot`, `flowGrid` for turning an ordered list into positions, and the height snapping).
- ec9fa71: `DateTimeField` from Seatbit, in a new entry `@bitsandbricks/ui/dates`: a date and time on a 24h clock that people can type or paste Swiss style ("14.11.2026 18:00", "14.11. 18") or pick in a calendar with quick times. Its value is "YYYY-MM-DDTHH:MM", like a datetime-local input, and it posts from a hidden input. Helpers: `formatDateTime`, `parseTypedDateTime`, `parseDateTimeValue`, `toDateTimeValue`, `editableDateTime`.

  The entry needs `@mantine/dates` and `dayjs` (optional peer dependencies, so apps that don't import it need neither) and `import '@mantine/dates/styles.css'`.

- 84f8994: `ErrorBanner` takes `error` (an Error or text, straight from a query) and draws nothing without a message or an error, so pages need no guard; `mb` sets the space below. `LoadingState` takes `rows` for the shape of a page (skeleton blocks) instead of a spinner.
- 9da4c4f: Add `DetailList` and `DetailItem` (label and value pairs), `UsageBar` (a percentage that turns amber and red), `StateStrip` (a row of state cells over time), `Steps` (where something stands in a fixed run of steps) and `AttentionList` (what needs a look, worst first, each with one action).
- af12440: Add `useConfirm()` (`await confirm({ title, body, confirmLabel })` instead of window.confirm; BnbProvider hosts the dialog, `ConfirmProvider` for trees outside it) and `CopyText` (click a value to copy it, with a toast).
- fb5d197: Add `Breadcrumbs`, `ScopeSwitcher` (narrow the app to one site, club or event, or all) and `StatusLine` (the quiet line under every page, for AppShell's `status`). AppShell's status footer now has an accessible name.
- 333d177: More questions from Mason on useConfirm's provider: `useChoose` (one of a few, each with a key, grouped), `usePrompt` (a line of text) and `useTell` (a notice with links). `useConfirm` is unchanged.
- 7f3739c: Detail blocks from Mason: `StatusHeader` (a thing's name, state badges, what stops it and the next step, with its facts as a DetailList), `ActionList` (grouped actions, one menu on a phone), `Timeline` (events by source, more on a click) and `LinkedText` (plain text with clickable links), plus `linkify` and `timeAgo`.
- ec93d47: Feedback pieces from Mason: `toastWorking` (a toast that says a change is under way, then turns into how it ended), `details` on `ErrorBanner` (the raw text behind a toggle), `NoMatches` (a filtered list that shows nothing names its filters), `OfflineBanner` with `nextRetryDelay`.
- b27b63b: Keyboard pieces from Mason: `CommandPalette` in the new `@bitsandbricks/ui/spotlight` entry (ctrl+k or "/": pages, commands and the app's own search results, with ">" for commands only; needs the optional peer `@mantine/spotlight`), `KeysSheet` (the "?" sheet, reading a page's keys from `aria-keyshortcuts`), `useKeys` and `useModKey`, and the matching helpers `rankItems`, `matchScore` and `rememberRecent`.
- 9c748f4: Shell pieces from Mason: `PhoneDock` (a bar at the bottom on phones, with "More" for every page), `SaveViewButton` with the `viewPath`, `addView` and `removeView` rules for saved views, and on `SidePanel` the optional `resizable` (drag or ← → its edge, kept in the browser), `onPrev` and `onNext` (step through the list) and `copyHref` (copy a link to its page).
- 6ee4db9: DataTable extras from Mason, all opt-in: keys (`selected` and `onSelect`: ↑↓ j k, Home End, Enter, Space), picking rows (`picked` and `onPick`, shift+click for a span), "Download CSV" (`exportName`, with a guard against spreadsheet formulas) and "new since your last visit" (`isNew`, with the `useSeen` hook). Columns take an optional `text` for the export.
- 8838a35: `PageTabs`: a tab can carry an `alert` (a status bit after the label), `count` may be `null`, and the row scrolls sideways instead of wrapping. New `TitleLevel` context: a shell that writes the page's h1 itself sets it to 2, and `PageHead` titles start at h2 (h3 in a panel).
- b10716a: DataTable shows its page buttons above the table as well as below it, by default. The new `pagerAt` prop
  ('both', 'top' or 'bottom') chooses; `pagerAt="bottom"` keeps the old look. The buttons above show only
  when there is more than one page and hide on phones. Turning the page below the table scrolls back up to
  its top.

  Widgets keep their page line below only.

- 9c85b1e: Widgets can now carry what Hubra's dashboard needs. TileCard takes an `action` for the right of its title. List rows take an optional `sub` line and `link`, and a list takes `total` for "+N more". A new `text` widget type shows plain text such as a note. Links from plugin data are only followed when they are a path in the app or an http(s) address (`safeLink`), and this now also applies to a widget's Details link.

### Patch Changes

- 49e8679: `ConfirmButton` takes `title`, the button's hover text (Floorbit uses it to say why a button is disabled).
  - @bitsandbricks/tokens@0.3.0

## 0.2.0

### Minor Changes

- ee6bc73: Move the app accents out of the packages: accents and themes live in each app. Removed `accents` from `@bitsandbricks/tokens` (and its JSON), the `@bitsandbricks/tokens/accents/*.css` files, and the `accents` re-export from `@bitsandbricks/ui`. Apps pass their own accent to `createBnbTheme({ accent })`, or set `--bnb-accent-light`/`--bnb-accent-dark` (see `accentCss()`) in their own CSS.

### Patch Changes

- c01bb85: Publish to npm (npmjs.com) as public packages instead of GitHub Packages. Apps install `@bitsandbricks/*` without a token or a scope line in `.npmrc`.
- 3b84d6f: SidePanel opens on the right again, full height, instead of in the bottom left corner (Drawer.Content put its class on the wrapper too). DataTable no longer opens a row when a button or link in it is clicked, or when the dialog that button opened is used.
- Updated dependencies [ee6bc73]
- Updated dependencies [c01bb85]
  - @bitsandbricks/tokens@0.2.0

## 0.1.0

### Minor Changes

- d5e5c9c: First version: shared tokens (CSS variables and JSON), the React and Mantine components Hubra and Floorbit both had, and Floorbit's widget kit.

### Patch Changes

- Updated dependencies [d5e5c9c]
  - @bitsandbricks/tokens@0.1.0
