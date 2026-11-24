---
'@bitsandbricks/ui': patch
---

FilterBar's menu buttons and ScopeSwitcher name themselves with every word they show (WCAG 2.5.3, label in name): a filter button with a count is now "Show: Down (2)", and ScopeSwitcher's name comes from its visible label and value. The unused `scope.current` text is gone.
