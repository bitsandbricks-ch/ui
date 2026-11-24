# @bitsandbricks/tokens

## 0.3.0

## 0.2.0

### Minor Changes

- ee6bc73: Move the app accents out of the packages: accents and themes live in each app. Removed `accents` from `@bitsandbricks/tokens` (and its JSON), the `@bitsandbricks/tokens/accents/*.css` files, and the `accents` re-export from `@bitsandbricks/ui`. Apps pass their own accent to `createBnbTheme({ accent })`, or set `--bnb-accent-light`/`--bnb-accent-dark` (see `accentCss()`) in their own CSS.

### Patch Changes

- c01bb85: Publish to npm (npmjs.com) as public packages instead of GitHub Packages. Apps install `@bitsandbricks/*` without a token or a scope line in `.npmrc`.

## 0.1.0

### Minor Changes

- d5e5c9c: First version: shared tokens (CSS variables and JSON), the React and Mantine components Hubra and Floorbit both had, and Floorbit's widget kit.
