---
'@bitsandbricks/ui': patch
---

**Upgrading from 0.3.0:** no prop was renamed or removed, so Hubra and Floorbit need only the version bump. What looks or behaves differently without a code change:

- Colours: light `warn` and `err` and dark `faint`/`off` are a shade deeper or lighter (WCAG AA). Apps that override these tokens themselves (Seatbit, Mason) can drop the override. The accent as text (`--bnb-accent-text`) is deepened where it fell short of 4.5:1; today that changes only Labdex's light accent.
- The active pill tab and a picked Chip use the text-on-accent colour, so a bright dark-theme accent gets dark text.
- Filter chips move and pick with the arrow keys (one tab stop), like radio buttons.
- Accessible names: FilterBar's menu buttons, ScopeSwitcher, LanguageMenu and NotificationsBell are named by what they show. Tests that find them by name may need the new name; the unused `scope.current` text is gone.
- New entries with optional peers (`@bitsandbricks/ui/dates`, `/qr`, `/spotlight`): see the README. Only apps that import them install the peer.
