// Pure rules for DataTable's extras from Mason: picking several rows, a CSV export and "new since your
// last visit". No React, so they test on their own.

/** Picks with `key` in or out. */
export function togglePick(picked: string[], key: string) {
  return picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key]
}

/** The header box: every one of `shown` picked, or (when they all were) none of them. Picks of rows
 *  that aren't shown (a filter hides them) stay. */
export function togglePickAll(picked: string[], shown: string[]) {
  const all = shown.length > 0 && shown.every((k) => picked.includes(k))
  if (all) return picked.filter((k) => !shown.includes(k))
  return [...picked, ...shown.filter((k) => !picked.includes(k))]
}

/** Shift+click: every row from `from` to `to` in the shown order is picked. */
export function pickRange(picked: string[], order: string[], from: string, to: string) {
  const a = order.indexOf(from)
  const b = order.indexOf(to)
  if (a < 0 || b < 0) return togglePick(picked, to)
  const span = order.slice(Math.min(a, b), Math.max(a, b) + 1)
  return [...picked, ...span.filter((k) => !picked.includes(k))]
}

/** One CSV cell. A cell that starts with = + - @ (or a tab or CR) would run as a formula in a
 *  spreadsheet, and names and titles come from anyone: those get a leading ' (OWASP's advice). */
export function csvCell(value: unknown) {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** A header line and the rows, CRLF as RFC 4180 has it. */
export function toCsv(headers: string[], rows: unknown[][]) {
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** "hosts-2026-11-24.csv" */
export function csvFileName(what: string, now = new Date()) {
  const slug = String(what || 'list').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'list'
  return `${slug}-${now.toISOString().slice(0, 10)}.csv`
}

/** What is new in `now` against what was seen before. `before` null: never visited, so nothing is. */
export function freshKeys(before: string[] | null, now: string[]) {
  if (!Array.isArray(before)) return new Set<string>()
  const old = new Set(before)
  return new Set(now.filter((k) => !old.has(k)))
}

/** What to keep after a visit: this visit's keys first, then the earlier ones, at most `max`. */
export function mergeSeen(before: string[] | null, now: string[], max = 3000) {
  return [...new Set([...now, ...(Array.isArray(before) ? before : [])])].slice(0, max)
}
