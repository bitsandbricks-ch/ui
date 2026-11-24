---
'@bitsandbricks/ui': minor
'@bitsandbricks/widgets': minor
---

Widgets can now carry what Hubra's dashboard needs. TileCard takes an `action` for the right of its title. List rows take an optional `sub` line and `link`, and a list takes `total` for "+N more". A new `text` widget type shows plain text such as a note. Links from plugin data are only followed when they are a path in the app or an http(s) address (`safeLink`), and this now also applies to a widget's Details link.
