import { IconChevronRight } from '@tabler/icons-react'
import { useEffect, useRef, type ReactNode } from 'react'

/** A folded section that remembers whether it was opened (per browser, per `storageKey`), so a
 *  reload or a live refresh doesn't fold it away while someone works in it. `open` forces it open,
 *  e.g. while it is in use. A native <details>, so it works before scripts load. */
export function Fold({ storageKey, summary, open, id, children }: {
  storageKey: string
  /** The always-visible row: a title, maybe a count. */
  summary: ReactNode
  open?: boolean
  id?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  // Left uncontrolled on purpose: a re-render must never fold it away under someone.
  useEffect(() => {
    let stored = false
    try { stored = localStorage.getItem(storageKey) === '1' } catch { /* storage blocked: start folded */ }
    if ((open || stored) && ref.current) ref.current.open = true
  }, [open, storageKey])
  return (
    <details ref={ref} id={id} className="bnb-fold"
      onToggle={(e) => {
        try { localStorage.setItem(storageKey, e.currentTarget.open ? '1' : '0') } catch { /* not remembered then */ }
      }}>
      <summary className="bnb-fold-summary">
        <span className="bnb-fold-title">{summary}</span>
        <IconChevronRight className="bnb-fold-chevron" size={16} aria-hidden="true" />
      </summary>
      <div className="bnb-fold-body">{children}</div>
    </details>
  )
}
