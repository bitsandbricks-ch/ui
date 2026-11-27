---
'@bitsandbricks/ui': patch
---

BnbProvider no longer brings the side panel (Mantine's Drawer and Tooltip) and the confirm dialogs (Modal, inputs) into an app's first page. `LinkContext` moved to its own module (still exported from the package), and `ConfirmProvider` loads its dialogs when the first question is asked.
