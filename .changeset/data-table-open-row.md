---
"@bitsandbricks/ui": patch
---

`DataTable` marks the `selected` row also without `onSelect`: the row whose SidePanel is open stays marked on a list-and-panel page (with `aria-current`), without the table taking the arrow keys.
