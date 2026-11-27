import { IconChevronRight } from '@tabler/icons-react'
import { createElement, Fragment, useContext, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Breadcrumbs.texts'
import { LinkContext } from '../link'

export interface Crumb {
  label: ReactNode
  /** Where the crumb leads; leave it out for a crumb that is only a heading (a section). */
  href?: string
}

/** Where you are: Section › Page › the item. The last crumb is the page shown now and never a
 *  link. Long names are cut at the end, so the bar keeps one line. Fits AppShell's `title`. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useT(texts)
  const Link = useContext(LinkContext)
  return (
    <nav className="bnb-crumbs" aria-label={t('nav.breadcrumbs')}>
      {items.map((c, i) => {
        const last = i === items.length - 1
        const body = last
          ? <span className="bnb-crumb is-current" aria-current="page">{c.label}</span>
          : c.href
            ? Link
              ? createElement(Link, { to: c.href, className: 'bnb-crumb' }, c.label)
              : <a className="bnb-crumb" href={c.href}>{c.label}</a>
            : <span className="bnb-crumb">{c.label}</span>
        return (
          <Fragment key={i}>
            {i > 0 && <IconChevronRight size={13} className="bnb-crumb-sep" aria-hidden="true" />}
            {body}
          </Fragment>
        )
      })}
    </nav>
  )
}
