---
"@bitsandbricks/ui": minor
---

Components keep their own texts and CSS. `defineTexts({ en, de })` and `useT(texts)` let a component bring its own words (the app's `t` still wins), and each component's `Name.css` is built into `styles.css`. The package now exports every public module, which adds `TopBarSlot`, `useTopBarSlot` and the `LinkComponent` type. Nothing an app uses changes.
