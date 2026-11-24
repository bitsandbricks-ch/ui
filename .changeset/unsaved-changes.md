---
"@bitsandbricks/ui": minor
---

Add the unsaved-changes guard, from Labdex and Mason: `useUnsaved(dirty, { what, onSave, draft })` (holds the tab open, Ctrl/⌘ S saves), `useConfirmLeave()` (asks once for every form on screen, for a router blocker or a side panel), `hasUnsaved()` and `useHasUnsaved()`, and `useDraft()` (keeps changes as a draft in this browser and offers them back).
