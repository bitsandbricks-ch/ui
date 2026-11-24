import { createElement, useContext, type ReactNode } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { LinkContext } from './SidePanel'

export interface SectionDef {
  id: string
  label: string
  /** Where the section lives (e.g. "?tab=costs"). Without it the row is a button for `onSelect`. */
  href?: string
  /** One short line under the label: why you'd open it ("You owe CHF 12", "14 coming"). */
  status?: ReactNode
  /** Something waits in there: a dot, and the status line says what. */
  dot?: boolean
}

/**
 * A page's sections without a tab bar. On phones the first section (the hub, e.g. Overview) lists
 * the others as rows above its own content; a row opens its section, which shows a back link to the
 * hub. On wide screens the same rows are a sticky sidebar on the left, always in view.
 * Rows are links when sections have an `href` (bookmarkable, work without JavaScript), else
 * buttons that call `onSelect`.
 */
export function SectionLayout({ sections, active, onSelect, label, children }: {
  /** The first one is the hub. */
  sections: SectionDef[]
  active: string
  onSelect?: (id: string) => void
  /** Accessible name of the navigation ("Sections"). */
  label: string
  children: ReactNode
}) {
  const [hub, ...rest] = sections
  const onHub = !hub || active === hub.id
  return (
    <div className={`bnb-sections${onHub ? ' is-hub' : ''}`}>
      <nav className="bnb-sections-nav" aria-label={label}>
        <ul>
          {sections.map((s, i) => (
            <li key={s.id} className={i === 0 ? 'bnb-sections-hub' : undefined}>
              <Row section={s} current={s.id === active} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="bnb-sections-body">
        {!onHub && hub && (
          <Row section={{ ...hub, status: undefined, dot: false }} back onSelect={onSelect} />
        )}
        {onHub && rest.length > 0 && (
          <ul className="bnb-sections-rows" aria-label={label}>
            {rest.map((s) => <li key={s.id}><Row section={s} onSelect={onSelect} /></li>)}
          </ul>
        )}
        {children}
      </div>
    </div>
  )
}

function Row({ section: s, current, back, onSelect }: {
  section: SectionDef
  current?: boolean
  back?: boolean
  onSelect?: (id: string) => void
}) {
  const Link = useContext(LinkContext)
  const props = {
    className: back ? 'bnb-sections-back' : `bnb-sections-row${current ? ' is-active' : ''}${s.dot ? ' has-dot' : ''}`,
    'aria-current': current ? ('page' as const) : undefined,
    onClick: onSelect ? () => onSelect(s.id) : undefined,
  }
  const body = back
    ? <><IconChevronLeft size={16} aria-hidden="true" /><span>{s.label}</span></>
    : (
      <>
        <span className="bnb-sections-text">
          <span className="bnb-sections-label">{s.label}</span>
          {s.status != null && <span className="bnb-sections-status">{s.status}</span>}
        </span>
        {s.dot && <span className="bnb-sections-dot" aria-hidden="true" />}
        <IconChevronRight className="bnb-sections-chevron" size={14} aria-hidden="true" />
      </>
    )
  if (!s.href) return <button type="button" {...props}>{body}</button>
  return Link ? createElement(Link, { to: s.href, ...props }, body) : <a href={s.href} {...props}>{body}</a>
}
