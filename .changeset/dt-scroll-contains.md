---
'@bitsandbricks/ui': patch
---

DataTable: a table wider than its box scrolls inside the box again instead of widening the page. Hidden header labels (`position: absolute`) had no containing block inside the scroll box, so they pushed the page sideways (Floorbit's Inventory at 1440 px).
