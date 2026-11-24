---
'@bitsandbricks/tokens': minor
'@bitsandbricks/ui': minor
---

Move the app accents out of the packages: accents and themes live in each app. Removed `accents` from `@bitsandbricks/tokens` (and its JSON), the `@bitsandbricks/tokens/accents/*.css` files, and the `accents` re-export from `@bitsandbricks/ui`. Apps pass their own accent to `createBnbTheme({ accent })`, or set `--bnb-accent-light`/`--bnb-accent-dark` (see `accentCss()`) in their own CSS.
