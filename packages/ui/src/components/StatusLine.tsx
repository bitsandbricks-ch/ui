import { createElement, useContext, type ReactNode } from 'react'
import type { Tone } from '../status'
import { LinkContext } from './SidePanel'
import { StatusBit } from './StatusBadge'

export interface StatusItem {
  id: string
  label: ReactNode
  /** A small square in front, in the tone's colour; the label says what it means. */
  tone?: Tone
  /** Leads to the page with the details (the problems, the agents). */
  href?: string
  /** Shown on hover: the longer story ("synced to 4f2a1c 3 minutes ago"). */
  title?: string
  /** Left out on a phone, where the line keeps only what matters most. */
  hideOnPhone?: boolean
}

/** The quiet line under every page, in AppShell's `status`: is the live stream up, how many
 *  agents answer, when it was last checked. `end` goes on the right (docs, version). */
export function StatusLine({ items, end }: { items: StatusItem[]; end?: ReactNode }) {
  const Link = useContext(LinkContext)
  return (
    <div className="bnb-status-line">
      {items.map((it) => {
        const className = `bnb-status-item${it.hideOnPhone ? ' is-phone-hidden' : ''}`
        const body = <>{it.tone && <StatusBit tone={it.tone} />}{it.label}</>
        if (!it.href) return <span key={it.id} className={className} title={it.title}>{body}</span>
        return Link
          ? createElement(Link, { key: it.id, to: it.href, className, title: it.title }, body)
          : <a key={it.id} href={it.href} className={className} title={it.title}>{body}</a>
      })}
      {end && <span className="bnb-status-end">{end}</span>}
    </div>
  )
}
