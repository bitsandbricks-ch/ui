---
'@bitsandbricks-ch/tokens': minor
'@bitsandbricks-ch/ui': minor
'@bitsandbricks-ch/widgets': minor
---

Rename the packages from `@bitsandbricks/*` to `@bitsandbricks-ch/*`. GitHub Packages only takes a scope that matches the owner, so `@bitsandbricks` could not be published. Apps install `@bitsandbricks-ch/tokens`, `@bitsandbricks-ch/ui` and `@bitsandbricks-ch/widgets` and point the `@bitsandbricks-ch` scope at `https://npm.pkg.github.com` in their `.npmrc`.
