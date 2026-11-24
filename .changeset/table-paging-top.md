---
'@bitsandbricks/ui': minor
'@bitsandbricks/widgets': patch
---

DataTable shows its page buttons above the table as well as below it, by default. The new `pagerAt` prop
('both', 'top' or 'bottom') chooses; `pagerAt="bottom"` keeps the old look. The buttons above show only
when there is more than one page and hide on phones. Turning the page below the table scrolls back up to
its top.

Widgets keep their page line below only.
