import type { Locale } from '../i18n'

// Dates as people in Switzerland write them: "Sat 14.11.2026, 18:00", always a 24h clock. Built by
// hand, so the browser's locale can never switch it to AM/PM or month-first. The value a field
// holds (and a form posts) is "YYYY-MM-DDTHH:MM" in local time, like <input type="datetime-local">.

export interface DateTimeParts { y: number; m: number; d: number; hh: number; mm: number }

const WEEKDAYS: Record<Locale, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** "2026-11-14T18:00" to its parts; null for anything else. */
export function parseDateTimeValue(value: string | null | undefined): DateTimeParts | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? '')
  return r ? { y: +r[1], m: +r[2] - 1, d: +r[3], hh: +r[4], mm: +r[5] } : null
}

/** Parts to "2026-11-14T18:00". */
export const toDateTimeValue = (p: DateTimeParts) => `${p.y}-${pad2(p.m + 1)}-${pad2(p.d)}T${pad2(p.hh)}:${pad2(p.mm)}`

/** "HH:MM" to hours and minutes. */
export function parseTime(text: string): { hh: number; mm: number } | null {
  const r = /^(\d{1,2}):(\d{2})$/.exec(text.trim())
  if (!r || +r[1] > 23 || +r[2] > 59) return null
  return { hh: +r[1], mm: +r[2] }
}

/**
 * Reads what people type or paste: "Sat 14.11.2026, 18:00", "14.11.26 18", "14.11. 1800",
 * "14/11/2026 18.30" or "2026-11-14T18:00". A missing year means the next such date; a missing
 * time takes `fallback`. Null when it isn't a real date and time.
 */
export function parseTypedDateTime(text: string, fallback: { hh: number; mm: number }, now = new Date()): DateTimeParts | null {
  const t = text.trim()
  if (!t) return null
  const iso = parseDateTimeValue(t)
  if (iso) return iso
  const r = /(\d{1,2})[./-](\d{1,2})[./-]?(\d{2,4})?\s*,?\s*(?:(\d{1,2})(?:[:.h]?(\d{2}))?)?\s*$/.exec(t)
  if (!r) return null
  const d = +r[1]
  const m = +r[2] - 1
  let y = r[3] ? +r[3] : now.getFullYear()
  if (r[3]?.length === 2) y += 2000
  const hh = r[4] !== undefined ? +r[4] : fallback.hh
  const mm = r[5] !== undefined ? +r[5] : r[4] !== undefined ? 0 : fallback.mm
  if (m < 0 || m > 11 || hh > 23 || mm > 59) return null
  const date = new Date(y, m, d)
  if (date.getMonth() !== m || date.getDate() !== d) return null // 31.02.
  // No year and the day has passed this year: next year's.
  if (!r[3] && date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) y += 1
  return { y, m, d, hh, mm }
}

/** "Sat 14.11.2026, 18:00" ("Sa 14.11.2026, 18:00" in German); empty for no value. */
export function formatDateTime(value: string | Date | null | undefined, locale: Locale = 'en') {
  const p = value instanceof Date
    ? { y: value.getFullYear(), m: value.getMonth(), d: value.getDate(), hh: value.getHours(), mm: value.getMinutes() }
    : parseDateTimeValue(value)
  if (!p) return ''
  const day = new Date(p.y, p.m, p.d).getDay()
  return `${(WEEKDAYS[locale] ?? WEEKDAYS.en)[day]} ${pad2(p.d)}.${pad2(p.m + 1)}.${p.y}, ${pad2(p.hh)}:${pad2(p.mm)}`
}

/** "14.11.2026 18:00": the form people edit while the field has focus. */
export function editableDateTime(value: string | null | undefined) {
  const p = parseDateTimeValue(value)
  return p ? `${pad2(p.d)}.${pad2(p.m + 1)}.${p.y} ${pad2(p.hh)}:${pad2(p.mm)}` : ''
}
