import { useMemo } from 'react'
import { useT } from '../i18n'
import { diffLines, yamlTokens, type DiffLine } from '../lineDiff'
import { texts } from './CodeDiff.texts'

/** A text file with line numbers: a host's YAML, a compose file, a config a plan writes. With
 *  `before` it is a line diff (+ added, − removed) and the counts sit in the header beside the
 *  file's name. YAML is coloured by token; `language="text"` leaves it plain. */
export function CodeDiff({ after, before, file, language = 'yaml', label }: {
  after: string
  /** The text before the change; leave it out to show `after` alone. */
  before?: string | null
  /** The file's name or path, in the header. */
  file?: string
  language?: 'yaml' | 'text'
  /** The code's accessible name; the file's name by default. */
  label?: string
}) {
  const { t } = useT(texts)
  const diff = before !== undefined && before !== null
  const rows = useMemo(() => {
    const list: DiffLine[] = diff ? diffLines(before, after) : after.replace(/\n$/, '').split('\n').map((text) => ({ op: ' ', text }))
    let n = 0
    return list.map((l) => ({ ...l, n: l.op === '-' ? '' : String(++n) }))
  }, [after, before, diff])
  const added = rows.filter((r) => r.op === '+').length
  const removed = rows.filter((r) => r.op === '-').length
  return (
    <div className="bnb-code">
      {(file || diff) && (
        <div className="bnb-code-head">
          <span className="bnb-code-file">{file}</span>
          {diff && (
            // A plain span can't carry a label: the words go in hidden text, the signs stay visual.
            <span className="bnb-code-count">
              <span className="bnb-sr-only">{t('codeDiff.counts', { added, removed })}</span>
              <span className="is-add" aria-hidden="true">+{added}</span>
              <span className="is-del" aria-hidden="true">−{removed}</span>
            </span>
          )}
        </div>
      )}
      <div className="bnb-code-body" role="table" aria-label={label ?? file ?? t('codeDiff.label')}>
        {rows.map((r, i) => (
          <div key={i} role="row" className={`bnb-code-line${r.op === '+' ? ' is-add' : r.op === '-' ? ' is-del' : ''}`}>
            <span role="cell" className="bnb-code-n" aria-hidden="true">{r.n}</span>
            <span role="cell" className="bnb-code-op">
              {r.op === ' ' ? '' : <><span aria-hidden="true">{r.op === '-' ? '−' : '+'}</span><span className="bnb-sr-only">{t(r.op === '+' ? 'codeDiff.added' : 'codeDiff.removed')}</span></>}
            </span>
            <span role="cell" className="bnb-code-text">
              {language === 'yaml'
                ? yamlTokens(r.text).map((tk, k) => <span key={k} className={tk.kind ? `bnb-tk-${tk.kind}` : undefined}>{tk.text}</span>)
                : r.text}
            </span>
          </div>
        ))}
        {diff && !added && !removed && <div className="bnb-code-same">{t('codeDiff.same')}</div>}
      </div>
    </div>
  )
}
