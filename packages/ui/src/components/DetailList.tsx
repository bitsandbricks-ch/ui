import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './DetailList.texts'

export interface DetailItemProps {
  label: ReactNode
  /** Empty (undefined, null or '') shows a dash, so a missing fact still has its place. */
  value?: ReactNode
  /** A quiet line under the value: where it comes from, when it was seen. */
  hint?: ReactNode
  /** Addresses, ids and versions in the monospace font. */
  mono?: boolean
  /** Takes the whole row of a multi-column list (a long note, a list of tags). */
  wide?: boolean
}

export interface DetailEntry extends DetailItemProps {
  id: string
}

/** One fact: a label and its value. Use it inside a DetailList to mix in your own rows. */
export function DetailItem({ label, value, hint, mono, wide, children }: DetailItemProps & { children?: ReactNode }) {
  const { t } = useT(texts)
  const shown = children ?? value
  const empty = shown === undefined || shown === null || shown === ''
  return (
    <div className={`bnb-detail${wide ? ' is-wide' : ''}`}>
      <dt className="bnb-detail-label">{label}</dt>
      <dd className={`bnb-detail-value${mono ? ' is-mono' : ''}`}>
        {empty ? <span className="bnb-detail-none" title={t('detail.none')}>—</span> : shown}
        {hint && <span className="bnb-detail-hint">{hint}</span>}
      </dd>
    </div>
  )
}

/** The facts of one thing as label and value pairs, in one or more columns: a host's address
 *  and system, a member's contact details. Pass `items`, or DetailItem children for rows that need
 *  more than a value. On a phone it is always one column. */
export function DetailList({ items, columns = 2, layout = 'stacked', children, className, style }: {
  items?: DetailEntry[]
  /** Columns on wide screens. */
  columns?: 1 | 2 | 3 | 4
  /** 'stacked': the label above the value. 'inline': the label on the left, for long lists. */
  layout?: 'stacked' | 'inline'
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <dl className={`bnb-details is-${layout}${className ? ` ${className}` : ''}`} style={{ '--bnb-details-cols': columns, ...style } as CSSProperties}>
      {items?.map(({ id, ...item }) => <DetailItem key={id} {...item} />)}
      {children}
    </dl>
  )
}
