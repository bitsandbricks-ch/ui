---
'@bitsandbricks/ui': minor
---

`Card` takes `heading` (2 to 6): the title becomes a heading of that level and the card a section named by it, so a page of several cards reads as its parts. `id` and `aria-label` (for a section without a title) pass through. `Card.Header` takes `heading` and `headingId` too. Without `heading`, nothing changes. Floorbit needs it to move its own `Panel` to `Card`.
