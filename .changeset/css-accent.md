---
'@bitsandbricks/ui': minor
---

`createBnbTheme({ accent: 'css' })` takes the accent from the app's stylesheet (`--bnb-accent-light`, `--bnb-accent-dark`, `--bnb-on-accent-*`) instead of the theme, so an admin's colour or a preset applies at run time without rebuilding the theme. The Mantine accent shades are mixed by the browser from those variables.
