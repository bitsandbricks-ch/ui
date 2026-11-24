---
'@bitsandbricks/tokens': minor
'@bitsandbricks/ui': patch
---

The accent as text and links (`--bnb-accent-text`) reads at 4.5:1 on every grey of its theme, not only on white: where the app's accent falls short it is deepened (light) or lightened (dark). New `accentTextOn(hex, neutrals)`; `accentCss()` and `createBnbTheme` write `--bnb-accent-text-light`/`-dark`. Fills and buttons keep the accent itself. Today only Labdex's light accent changes as text (#b85a0a to #a7530b; it was 4.1:1 on grey fills).
