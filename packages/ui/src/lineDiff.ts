// A line diff for short texts (a YAML file, a config a plan writes): the longest common
// subsequence of lines, so unchanged lines stay put and only the real edits show. Texts past
// MAX_LINES on both sides fall back to "all removed, all added" to stay quick.
const MAX_LINES = 2000

export type LineOp = ' ' | '+' | '-'

export interface DiffLine {
  op: LineOp
  text: string
}

const lines = (text: string) => (text ? text.replace(/\n$/, '').split('\n') : [])

/** The lines of `after` against `before`: ' ' kept, '+' added, '-' removed, in reading order. */
export function diffLines(before = '', after = ''): DiffLine[] {
  const a = lines(before)
  const b = lines(after)
  if (a.length * b.length > MAX_LINES * MAX_LINES) {
    return [...a.map((text) => ({ op: '-' as const, text })), ...b.map((text) => ({ op: '+' as const, text }))]
  }
  // Lengths of the common tail from (i, j), one row at a time.
  const n = a.length
  const m = b.length
  const tail = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      tail[i][j] = a[i] === b[j] ? tail[i + 1][j + 1] + 1 : Math.max(tail[i + 1][j], tail[i][j + 1])
    }
  }
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ op: ' ', text: a[i] }); i++; j++ }
    else if (tail[i + 1][j] >= tail[i][j + 1]) out.push({ op: '-', text: a[i++] })
    else out.push({ op: '+', text: b[j++] })
  }
  while (i < n) out.push({ op: '-', text: a[i++] })
  while (j < m) out.push({ op: '+', text: b[j++] })
  return out
}

export type YamlToken = { kind: '' | 'key' | 'str' | 'num' | 'bool' | 'comment'; text: string }

const SCALAR = /^(-?\d+(\.\d+)?|true|false|null|~)$/

/** One YAML line cut into pieces to colour: key, string, number, bool, comment. Good enough for
 *  files people write by hand; it never parses, so a line it doesn't understand stays plain. */
export function yamlTokens(line: string): YamlToken[] {
  const out: YamlToken[] = []
  const m = line.match(/^(\s*(?:-\s+)?)([^\s#:'"][^:#]*?|"[^"]*"|'[^']*')(:)(\s|$)(.*)$/)
  let rest = line
  if (m) {
    out.push({ kind: '', text: m[1] }, { kind: 'key', text: m[2] }, { kind: '', text: m[3] + m[4] })
    rest = m[5]
  } else {
    const item = line.match(/^(\s*-\s+)(.*)$/)
    if (item) { out.push({ kind: '', text: item[1] }); rest = item[2] }
  }
  const c = rest.search(/(^|\s)#/)
  const value = c >= 0 ? rest.slice(0, c) : rest
  const comment = c >= 0 ? rest.slice(c) : ''
  if (value) {
    const v = value.trim()
    const kind = !v ? '' : SCALAR.test(v) ? (/^-?\d/.test(v) ? 'num' : 'bool') : /^[[{|>]/.test(v) ? '' : 'str'
    out.push({ kind, text: value })
  }
  if (comment) out.push({ kind: 'comment', text: comment })
  return out.filter((t) => t.text)
}
