import type { Tone } from '../status'

export interface StateCell {
  /** 'none': nothing was recorded for this stretch (grey). */
  tone: Tone | 'none'
  /** Shown on hover: "3 h ago: down". */
  title?: string
}

/** A history of states as a row of small cells, oldest on the left: a host's last 48 hours, a
 *  check's last 30 runs. Each cell is the worst state seen in its stretch. `label` says it in
 *  words for screen readers ("2 hours with an outage in the last 48 hours"). */
export function StateStrip({ cells, label, height = 22 }: { cells: StateCell[]; label: string; height?: number }) {
  return (
    <div className="bnb-strip" role="img" aria-label={label} style={{ height }}>
      {cells.map((c, i) => <span key={i} className={`bnb-strip-cell is-${c.tone}`} title={c.title} />)}
    </div>
  )
}
