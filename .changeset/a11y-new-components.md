---
'@bitsandbricks/ui': patch
---

Accessibility fixes for components that landed alongside the accessibility pass: CodeDiff's line counts are read from hidden text (a plain span can't carry a label), and keys and numbers on added or removed lines stay 4.5:1 on the tint; hidden tabs and hidden GlanceList rows use the faint colour instead of fading below AA; a Modal or Drawer header no longer counts as a second page banner.
