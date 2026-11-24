// Loose matching for a jump box, like an editor's file finder: the letters in order, better when they
// start a word or follow each other, best when the whole query is in the text. From Mason.

/** How well `query` matches `text`: 0 for not at all, higher for better. */
export function matchScore(query: string, text: string) {
  const q = String(query || '').toLowerCase().replace(/\s+/g, '')
  const t = String(text || '').toLowerCase()
  if (!q) return 1
  if (!t) return 0
  let at = 0
  let total = 0
  let run = 0
  for (const ch of q) {
    const i = t.indexOf(ch, at)
    if (i < 0) return 0
    run = i === at && at > 0 ? run + 1 : 0
    const start = i === 0 || /[\s/#!:._-]/.test(t[i - 1])
    total += 1 + (start ? 3 : 0) + run * 2 - Math.min(i - at, 5) * 0.2
    at = i + 1
  }
  const whole = t.includes(q) ? 4 + (t.startsWith(q) ? 4 : 0) : 0
  return total + whole + 10 / (t.length + 1)
}

export interface Rankable {
  label: string
  hint?: string
  kind?: string
}

/** Items best first, at most `limit`. The label counts more than the hint, and the hint only counts
 *  when it holds the query as written (scattered letters in a long hint matched nearly anything).
 *  Ties go by `kinds` order (kinds not listed last), then as given. */
export function rankItems<T extends Rankable>(items: T[], query: string, limit = 12, kinds: string[] = []) {
  const q = String(query || '').toLowerCase().trim()
  const order = (k?: string) => { const i = k ? kinds.indexOf(k) : -1; return i < 0 ? kinds.length : i }
  const out: { it: T; s: number; i: number }[] = []
  items.forEach((it, i) => {
    const inHint = !!q && String(it.hint || '').toLowerCase().includes(q)
    const s = Math.max(matchScore(query, it.label), inHint ? matchScore(query, it.hint || '') * 0.6 : 0)
    if (s > 0) out.push({ it, s, i })
  })
  out.sort((a, b) => b.s - a.s || order(a.it.kind) - order(b.it.kind) || a.i - b.i)
  return out.slice(0, limit).map((x) => x.it)
}

/** The things opened last, newest first, each once, at most `max`: what a jump box offers before
 *  anything is typed. `key` says when two are the same thing. */
export function rememberRecent<T>(list: T[], item: T, key: (item: T) => string, max = 8) {
  const k = key(item)
  return [item, ...list.filter((x) => key(x) !== k)].slice(0, max)
}
