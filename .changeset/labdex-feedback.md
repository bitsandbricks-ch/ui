---
"@bitsandbricks/ui": minor
---

Add `useConfirm()` (`await confirm({ title, body, confirmLabel })` instead of window.confirm; BnbProvider hosts the dialog, `ConfirmProvider` for trees outside it) and `CopyText` (click a value to copy it, with a toast).
