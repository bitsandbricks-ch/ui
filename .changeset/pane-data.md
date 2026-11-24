---
'@bitsandbricks/widgets': minor
---

Add usePaneData from Floorbit: a dashboard pane's sources merged, grouped and calculated, then shown with the pane's display settings. It takes each source as `{ data, error, isPending, dataUpdatedAt }` (TanStack Query's result fits) and its texts from useT(), so it needs neither react-query nor i18next.
