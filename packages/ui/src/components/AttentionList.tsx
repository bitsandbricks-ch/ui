import { Button } from '@mantine/core'
import { createElement, useContext, type ReactNode } from 'react'
import { useT } from '../i18n'
import { LinkContext } from '../link'
import { texts } from './AttentionList.texts'

export interface AttentionItem {
  id: string
  /** err: broken now. warn: will break or needs a decision. info: worth knowing. */
  tone: 'err' | 'warn' | 'info'
  title: ReactNode
  /** Which thing and why: "web-01 · disk 94 %". */
  detail?: ReactNode
  /** When it started or was last seen, already in words ("3 min ago"). */
  time?: ReactNode
  /** The one thing to do about it. A link opens the page where it is done. */
  action?: { label: string; href?: string; onClick?: () => void }
}

const ORDER = { err: 0, warn: 1, info: 2 }

/** What needs a look, worst first, each with the one thing to do about it: the top of an
 *  overview, an agent's or a device's card. Nothing to show: `empty`, or "All good". */
export function AttentionList({ items, empty, sort = true, label }: {
  items: AttentionItem[]
  empty?: ReactNode
  /** false: keep the caller's order. */
  sort?: boolean
  /** The list's accessible name. */
  label?: string
}) {
  const { t } = useT(texts)
  const Link = useContext(LinkContext)
  if (items.length === 0) {
    return <div className="bnb-attention-empty"><span className="bnb-bit is-ok" aria-hidden="true" />{empty ?? t('attention.none')}</div>
  }
  const rows = sort ? [...items].sort((a, b) => ORDER[a.tone] - ORDER[b.tone]) : items
  return (
    <ul className="bnb-attention" aria-label={label ?? t('attention.label')}>
      {rows.map((it) => {
        const a = it.action
        const action = !a ? null : a.href
          ? Link
            ? <Button size="xs" variant="default" renderRoot={(props) => createElement(Link, { to: a.href, ...props })}>{a.label}</Button>
            : <Button size="xs" variant="default" component="a" href={a.href}>{a.label}</Button>
          : <Button size="xs" variant="default" onClick={a.onClick}>{a.label}</Button>
        return (
          <li key={it.id} className={`bnb-attention-row is-${it.tone}`}>
            <span className="bnb-bit" aria-hidden="true" />
            <span className="bnb-sr-only">{t(`attention.${it.tone}`)}: </span>
            <div className="bnb-attention-text">
              <div className="bnb-attention-title">{it.title}</div>
              {(it.detail || it.time) && (
                <div className="bnb-attention-detail">{it.detail}{it.detail && it.time ? ' · ' : ''}{it.time}</div>
              )}
            </div>
            {action}
          </li>
        )
      })}
    </ul>
  )
}
