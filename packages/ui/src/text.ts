// Plain text helpers from Mason: links in text without HTML, and "3h ago".

const URL_RE = /(https?:\/\/[^\s)\]>,'"]+)/g

export type TextPart = { text: string; href?: undefined } | { href: string; label: string; text?: undefined }

/** Text as parts, so links show as links without dangerouslySetInnerHTML. A link's label drops the
 *  scheme ("github.com/acme/web/pull/7"). */
export function linkify(text: string): TextPart[] {
  const t = String(text ?? '')
  const out: TextPart[] = []
  let last = 0
  for (const m of t.matchAll(URL_RE)) {
    const at = m.index ?? 0
    if (at > last) out.push({ text: t.slice(last, at) })
    out.push({ href: m[0], label: m[0].replace(/^https?:\/\//, '') })
    last = at + m[0].length
  }
  if (last < t.length) out.push({ text: t.slice(last) })
  return out
}

/** "3 hours ago", "in 2 days", "now", in the given language. */
export function timeAgo(at: string | number | Date, locale = 'en', now = Date.now()) {
  const then = new Date(at).getTime()
  if (!Number.isFinite(then)) return ''
  const secs = Math.round((then - now) / 1000)
  const fmt = new Intl.RelativeTimeFormat(locale === 'de' ? 'de-CH' : locale, { numeric: 'auto' })
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3600], ['minute', 60]]
  for (const [unit, size] of steps) if (Math.abs(secs) >= size) return fmt.format(Math.trunc(secs / size), unit)
  return fmt.format(0, 'second')
}
