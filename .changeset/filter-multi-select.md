---
'@bitsandbricks/ui': minor
---

FilterBar: a filter group can take several choices at once (`multiple: true`). Its value is the picked choices comma-separated, so `useFilters` keeps it in the address as before. In the menus layout it is one button ("Type: Security, Service +1") whose menu stays open while ticking, with a find field past 8 choices; in the panel layout each choice is a toggle chip and each pick its own removable chip. `pickedValues(group)` reads the picks.
