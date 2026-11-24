---
"@bitsandbricks/ui": minor
---

`DateTimeField` from Seatbit, in a new entry `@bitsandbricks/ui/dates`: a date and time on a 24h clock that people can type or paste Swiss style ("14.11.2026 18:00", "14.11. 18") or pick in a calendar with quick times. Its value is "YYYY-MM-DDTHH:MM", like a datetime-local input, and it posts from a hidden input. Helpers: `formatDateTime`, `parseTypedDateTime`, `parseDateTimeValue`, `toDateTimeValue`, `editableDateTime`.

The entry needs `@mantine/dates` and `dayjs` (optional peer dependencies, so apps that don't import it need neither) and `import '@mantine/dates/styles.css'`.
