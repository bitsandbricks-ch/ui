import { useContext, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { LinkContext, useT } from '@bitsandbricks/ui'
import { texts } from './NestedCharts.texts'

// Nested charts: each series is a part of the one before it (all accounts > active people, asked >
// answered > came), so they are drawn on top of each other from one baseline instead of side by
// side. One hue, faint to full, mixed from the accent so both themes work; the gaps read as
// "the rest of the whole".

/** A column over time. `values` has one number per series, whole first. */
export interface NestedColumn {
  key: string
  /** Short label under the column ("Nov", "10.11."). */
  label: string
  /** Full name of the period, for the tooltip and screen readers ("November 2026"). */
  title: string
  values: number[]
  /** An extra line in the tooltip. */
  note?: string
}

/** A row, such as one event. `values` has one number per series, whole first. */
export interface NestedRow {
  id: string
  label: ReactNode
  /** Small text next to or under the label (a date). */
  sub?: ReactNode
  /** Opens the row, through the app's router when it gave one. */
  href?: string
  values: number[]
  /** Tooltip lines instead of "Series: n" per series. */
  tip?: ReactNode
  /** What screen readers hear instead of "Series n, ..." per series. */
  srText?: string
}

/** Fill of series `i` of `n`: the whole faintest, the last part in full colour. */
export function nestedShade(i: number, n: number, colour = 'var(--bnb-accent)') {
  if (n <= 1 || i >= n - 1) return colour
  const pct = Math.round(28 + ((100 - 28) * i) / (n - 1))
  return `color-mix(in oklab, ${colour} ${pct}%, var(--bnb-raised))`
}

function Key({ series, colour }: { series: string[]; colour?: string }) {
  return (
    <>
      {series.map((s, i) => (
        <span key={s} className="bnb-nested-key">
          <span className="bnb-nested-swatch" style={{ background: nestedShade(i, series.length, colour) }} aria-hidden />
          {s}
        </span>
      ))}
    </>
  )
}

const plain = (series: string[], values: number[]) => series.map((s, i) => `${s} ${values[i] ?? 0}`).join(', ')

/**
 * Columns over time, oldest left, with the series nested inside each other (the whole as a wide,
 * faint column, each part narrower and stronger in front). Each column says its numbers in a
 * tooltip on hover or focus, and to screen readers. Scrolls sideways when there are many.
 */
export function NestedColumns({ series, columns, colour, height = 180 }: {
  /** Names of the series, whole first ("Accounts", "Active"). One series draws plain columns. */
  series: string[]
  columns: NestedColumn[]
  /** CSS colour of the front series; the app's accent by default. */
  colour?: string
  /** Height of the plot in px. */
  height?: number
}) {
  const { t } = useT(texts)
  const max = Math.max(1, ...columns.flatMap((c) => c.values))
  const n = series.length
  // Label every column when there's room, else every second or third, counted from the newest.
  const every = columns.length > 24 ? 3 : columns.length > 12 ? 2 : 1
  const width = { minWidth: `${columns.length * 14}px` }
  return (
    <figure className="bnb-nested">
      <figcaption className="bnb-nested-caption">
        <Key series={series} colour={colour} />
        <span className="bnb-nested-max">{t('widgets.nested.max', { value: max })}</span>
      </figcaption>
      <div className="bnb-nested-scroll">
        <ol className="bnb-nested-cols" style={{ ...width, height }}>
          {columns.map((c, i) => (
            <li key={c.key} tabIndex={0} className="bnb-nested-col">
              {series.map((_, k) => (
                <span key={k} aria-hidden className="bnb-nested-colfill" style={{
                  height: `${((c.values[k] ?? 0) / max) * 100}%`,
                  background: nestedShade(k, n, colour),
                  ['--inset' as string]: n > 1 ? `${(18 * k) / (n - 1)}%` : '0%',
                } as CSSProperties} />
              ))}
              {/* Inside the plot (the scroll box would clip it above), opening towards the middle. */}
              <span role="tooltip" className={`bnb-nested-tip ${i < columns.length / 2 ? 'start' : 'end'}`}>
                <strong>{c.title}</strong>
                <span>{[...series].reverse().map((s, k) => `${s}: ${c.values[n - 1 - k] ?? 0}`).join(' · ')}</span>
                {c.note && <span>{c.note}</span>}
              </span>
              <span className="bnb-sr-only">{c.title}: {plain(series, c.values)}{c.note ? `, ${c.note}` : ''}</span>
            </li>
          ))}
        </ol>
        <ol className="bnb-nested-labels" style={width} aria-hidden>
          {columns.map((c, i) => <li key={c.key}>{(columns.length - 1 - i) % every === 0 ? c.label : ''}</li>)}
        </ol>
      </div>
    </figure>
  )
}

/**
 * One row per item (an event), with the series as bars nested from the same start: asked, answered
 * and came, so the gaps read as "never answered" and "answered but didn't come". The numbers stand
 * at the end, the part first ("8 / 11 / 14"); rows with `href` open it.
 */
export function NestedBars({ series, rows, colour, foot }: {
  /** Names of the series, whole first ("Asked", "Answered", "Came"). */
  series: string[]
  rows: NestedRow[]
  /** CSS colour of the front series; the app's accent by default. */
  colour?: string
  /** A line under the chart, such as where the details are. */
  foot?: ReactNode
}) {
  const Link = useContext(LinkContext)
  const max = Math.max(1, ...rows.flatMap((r) => r.values))
  const n = series.length
  return (
    <figure className="bnb-nested">
      <figcaption className="bnb-nested-caption"><Key series={series} colour={colour} /></figcaption>
      <ol className="bnb-nested-rows">
        {rows.map((r) => {
          const body = (
            <>
              <span className="bnb-nested-rowhead">
                <span className="bnb-nested-rowlabel">{r.label}</span>
                {r.sub && <span className="bnb-nested-rowsub">{r.sub}</span>}
              </span>
              <span className="bnb-nested-rowplot">
                <span className="bnb-nested-track" aria-hidden>
                  {series.map((_, k) => (
                    <span key={k} className="bnb-nested-barfill" style={{ width: `${((r.values[k] ?? 0) / max) * 100}%`, background: nestedShade(k, n, colour) }} />
                  ))}
                </span>
                <span className="bnb-nested-nums" aria-hidden>
                  {[...r.values].reverse().map((v, k) => (
                    <span key={k}>{k > 0 && ' / '}{k === 0 ? <strong>{v}</strong> : v}</span>
                  ))}
                </span>
              </span>
              <span role="tooltip" className="bnb-nested-tip row">
                <strong>{r.label}</strong>
                {r.tip ?? series.map((s, k) => <span key={s}>{s}: {r.values[k] ?? 0}</span>).reverse()}
              </span>
              <span className="bnb-sr-only">{r.srText ?? plain(series, r.values)}</span>
            </>
          )
          return (
            <li key={r.id}>
              {r.href
                ? Link
                  ? <LinkRow Link={Link} href={r.href}>{body}</LinkRow>
                  : <a className="bnb-nested-row" href={r.href}>{body}</a>
                : <div className="bnb-nested-row" tabIndex={0}>{body}</div>}
            </li>
          )
        })}
      </ol>
      {foot && <p className="bnb-nested-foot">{foot}</p>}
    </figure>
  )
}

function LinkRow({ Link, href, children }: { Link: ElementType; href: string; children: ReactNode }) {
  return <Link to={href} className="bnb-nested-row">{children}</Link>
}
