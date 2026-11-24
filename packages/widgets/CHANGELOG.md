# @bitsandbricks/widgets

## 0.3.0

### Minor Changes

- cf5d946: Add usePaneData from Floorbit: a dashboard pane's sources merged, grouped and calculated, then shown with the pane's display settings. It takes each source as `{ data, error, isPending, dataUpdatedAt }` (TanStack Query's result fits) and its texts from useT(), so it needs neither react-query nor i18next.
- 9c85b1e: Widgets can now carry what Hubra's dashboard needs. TileCard takes an `action` for the right of its title. List rows take an optional `sub` line and `link`, and a list takes `total` for "+N more". A new `text` widget type shows plain text such as a note. Links from plugin data are only followed when they are a path in the app or an http(s) address (`safeLink`), and this now also applies to a widget's Details link.

### Patch Changes

- b10716a: DataTable shows its page buttons above the table as well as below it, by default. The new `pagerAt` prop
  ('both', 'top' or 'bottom') chooses; `pagerAt="bottom"` keeps the old look. The buttons above show only
  when there is more than one page and hide on phones. Turning the page below the table scrolls back up to
  its top.

  Widgets keep their page line below only.

- 6f8f529: Times on widget axes and tooltips are always 24-hour, in English too, as Floorbit had them (a browser set to US English showed "01:51 PM"). Export `PaneFit`, `FitReport` and `WALL_PAGE_SECONDS`, which apps need for the dashboard editor and for walls.
- Updated dependencies [37de5c1]
- Updated dependencies [d67610d]
- Updated dependencies [49e8679]
- Updated dependencies [5bbc005]
- Updated dependencies [896bd63]
- Updated dependencies [ec9fa71]
- Updated dependencies [84f8994]
- Updated dependencies [9da4c4f]
- Updated dependencies [af12440]
- Updated dependencies [fb5d197]
- Updated dependencies [333d177]
- Updated dependencies [7f3739c]
- Updated dependencies [ec93d47]
- Updated dependencies [b27b63b]
- Updated dependencies [9c748f4]
- Updated dependencies [6ee4db9]
- Updated dependencies [8838a35]
- Updated dependencies [b10716a]
- Updated dependencies [9c85b1e]
  - @bitsandbricks/ui@0.3.0

## 0.2.0

### Patch Changes

- c01bb85: Publish to npm (npmjs.com) as public packages instead of GitHub Packages. Apps install `@bitsandbricks/*` without a token or a scope line in `.npmrc`.
- Updated dependencies [ee6bc73]
- Updated dependencies [c01bb85]
- Updated dependencies [3b84d6f]
  - @bitsandbricks/ui@0.2.0

## 0.1.0

### Minor Changes

- d5e5c9c: First version: shared tokens (CSS variables and JSON), the React and Mantine components Hubra and Floorbit both had, and Floorbit's widget kit.

### Patch Changes

- Updated dependencies [d5e5c9c]
  - @bitsandbricks/ui@0.1.0
