import { createElement, useContext, type ReactNode } from 'react'
import { IconChevronRight, IconEyeOff } from '@tabler/icons-react'
import { Card } from './feedback'
import { LinkContext } from '../link'

export interface GlanceRow {
  id: string
  label: string
  /** Where the row leads (e.g. "?tab=costs"). Without it and without `onClick` the row is plain
   *  text, for something that opens later. */
  href?: string
  onClick?: () => void
  /** One short line: why you'd open it ("You owe CHF 12", "14 coming"). */
  status?: ReactNode
  /** Something waits for you there: a dot, and the status in the warning colour. */
  dot?: boolean
  /** Only some people see it for now (e.g. organisers): muted, with a crossed-out eye. Says why. */
  hidden?: string
}

/** A page's parts at a glance, on its overview: one compact row per tab or section with what is
 *  going on there. Rows link to their tab, so with tabs that switch on the client it is instant. */
export function GlanceList({ title, rows, actions }: { title: ReactNode; rows: GlanceRow[]; actions?: ReactNode }) {
  if (rows.length === 0) return null
  return (
    <Card title={title} actions={actions} padded={false}>
      <ul className="bnb-glance">
        {rows.map((r) => <li key={r.id}><Row row={r} /></li>)}
      </ul>
    </Card>
  )
}

function Row({ row: r }: { row: GlanceRow }) {
  const Link = useContext(LinkContext)
  const open = !!(r.href || r.onClick)
  const body = (
    <>
      <span className="bnb-glance-label">
        {r.hidden && <IconEyeOff size={14} aria-hidden="true" />}
        {r.label}
        {r.hidden && <span className="bnb-sr-only">, {r.hidden}</span>}
      </span>
      <span className={`bnb-glance-status${r.dot ? ' is-due' : ''}`}>{r.status}</span>
      {r.dot && <span className="bnb-glance-dot" aria-hidden="true" />}
      {open && <IconChevronRight className="bnb-glance-chevron" size={14} aria-hidden="true" />}
    </>
  )
  const className = `bnb-glance-row${open ? ' is-link' : ''}${r.hidden ? ' is-hidden' : ''}`
  if (!open) return <div className={className}>{body}</div>
  if (!r.href) return <button type="button" className={className} title={r.hidden} onClick={r.onClick}>{body}</button>
  const props = { className, title: r.hidden, onClick: r.onClick }
  return Link ? createElement(Link, { to: r.href, ...props }, body) : <a href={r.href} {...props}>{body}</a>
}
