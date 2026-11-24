# Changesets

Each pull request that changes a package adds one file here: `pnpm changeset`, pick the packages
and the bump, write one line for the changelog. The three packages share one version (`fixed`),
so a release is one tag.

Releasing is Mike's: `pnpm version-packages` in a pull request (it bumps the versions and writes
each `CHANGELOG.md`), merge it, then push the tag `vX.Y.Z`. The release workflow publishes.
