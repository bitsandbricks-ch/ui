---
"@bitsandbricks/ui": minor
---

Browser notifications, opt-in per device: `createBrowserNotify(key)` keeps the settings in this browser and decides whether a notification shows (`notify(kind, title, ...)`: on, the kind, quiet hours that may run past midnight, urgent kinds through them, the browser's permission). `useBrowserNotify` follows changes from every tab, and `NotifySettings` is the dialog for them, explaining a browser that blocks them. From Floorbit.
