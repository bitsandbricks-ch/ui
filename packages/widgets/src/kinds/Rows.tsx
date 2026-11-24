import { TextInput, UnstyledButton } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useT as useTranslation } from '@bitsandbricks/ui'
import type { Widget } from '@bitsandbricks/ui'
import { DataTable, type DataColumn } from '@bitsandbricks/ui'
import { type Kind, type Level, ROW_H, rowsThatFit } from '../level'
import { type Row, rowsOf, stateCounts, statOf } from './shape'
import { LevelReport } from '../levelReport'
import { AutoPage } from '../autoPage'
import { Drill } from '../drill'

const BAR_H = 34

/** Status, list and table: the rows that fit, never a scrollbar. Medium ends in "+N more" (which
 *  opens the widget large); large pages, sorts and filters inside the box. */
export function RowsKind({ widget, kind, level, box, onMore }: {
  widget: Widget; kind: Kind; level: Level; box: { w: number; h: number }; onMore?: () => void
}) {
  const { t, i18n } = useTranslation()
  const { columns, rows } = useMemo(() => rowsOf(widget, {
    name: t('widgets.kind.name'), value: t('widgets.kind.value'), state: t('widgets.kind.detail'),
  }), [widget, t])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  // Someone pointing at or typing in the list is reading it: it stops turning pages.
  const [held, setHeld] = useState(false)
  const every = useContext(AutoPage)
  const drill = useContext(Drill)

  if (level === 's') {
    const s = statOf(widget, i18n.language)
    const counts = stateCounts(widget)
    return (
      <div className="bnb-w-stat">
        <div className="bnb-w-stat-main">
          <span className={`bnb-w-stat-value${s.tone ? ` bnb-tone-${s.tone}` : ''}`}>{s.value}</span>
          {s.of != null && <span className="bnb-w-stat-unit">{t('widgets.kind.of', { count: s.of })}</span>}
        </div>
        {counts.length > 1 && (
          <div className="bnb-w-counts">
            {counts.filter(([st]) => st !== 'up').map(([st, n]) => (
              <span key={st}><span className={`bnb-dot ${st}`} role="img" aria-label={t(`widgets.state.${st}`)} /> {n}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!rows.length) return <div className="bnb-w-empty">{t('widgets.kind.noRows')}</div>

  const table = kind === 'table'
  const big = level === 'l'
  // A wall turns its pages itself and has nobody at a keyboard: no filter box there.
  const filtering = big && !every && (rows.length > rowsThatFit(box.h, ROW_H) || query !== '')
  let shown: Row[] = rows
  if (query) {
    const q = query.toLowerCase()
    shown = shown.filter((r) => Object.values(r.cells).some((v) => String(v ?? '').toLowerCase().includes(q)))
  }
  const reserve = (table ? ROW_H : 0) + (filtering ? BAR_H : 0)
  const room = rowsThatFit(box.h, reserve)
  // When not all rows fit, one row's height goes to "+N more" (medium) or the pager (large).
  const fit = shown.length > room ? Math.max(1, room - 1) : room
  // Medium shows what fits, worst first; large pages and sorts the rest inside the box.
  const slice = big ? shown : shown.slice(0, fit)
  // Rows the source left out ("total" on a list) count as more too, but only when nobody filters.
  const unsent = widget.type === 'list' && widget.total != null && !query ? Math.max(0, widget.total - widget.items.length) : 0
  const more = (big ? 0 : shown.length - slice.length) + unsent
  const pages = big ? Math.max(1, Math.ceil(shown.length / fit)) : 1
  const at = Math.min(page, pages - 1)

  const cols: DataColumn<Row>[] = (table ? columns : columns.slice(0, 2)).map((c, j) => ({
    id: c.key,
    header: c.label,
    sort: big && table ? (r) => r.cells[c.key] ?? '' : undefined,
    className: j > 0 && !table ? 'bnb-w-side' : undefined,
    cell: (r) => {
      const v = r.cells[c.key] ?? ''
      return (
        // A row's sub line would break the fixed row height the fit counts with: it goes in the tooltip.
        <span title={(j === 0 && r.sub ? `${v}\n${r.sub}` : v) || undefined} className={j > 0 && !table && r.tone ? `bnb-tone-${r.tone}` : undefined}>
          {j === 0 && r.state && <span className={`bnb-dot ${r.state}`} role="img" aria-label={t(`widgets.state.${r.state}`)} title={t(`widgets.state.${r.state}`)} />}
          {j === 0 && big && drill && r.device
            ? <UnstyledButton className="bnb-w-pick" onClick={() => drill(r.device!)}>{v}</UnstyledButton>
            : j === 0 && r.link ? <a className="bnb-w-link" href={r.link}>{v}</a> : v}
        </span>
      )
    },
  }))
  return (
    <div className="bnb-w-rows" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
      {big && pages > 1 && every > 0 && !held && <TurnPages every={every} at={at} pages={pages} onPage={setPage} />}
      {!big && <ReportRows shown={slice.length} total={rows.length} />}
      {filtering && (
        <TextInput size="xs" leftSection={<IconSearch size={14} />} placeholder={t('widgets.kind.filter')} aria-label={t('widgets.kind.filter')}
          value={query} onChange={(e) => { setQuery(e.currentTarget.value); setPage(0) }} className="bnb-w-filter" />
      )}
      <DataTable rows={slice} page={at} onPage={setPage} columns={cols} rowKey={(_, i) => String(i)} label={widget.label}
        urlState={false} pageSize={big ? fit : 0} bare head={table} pager="compact" pagerAt="bottom" density="compact"
        className={`bnb-w-table${table ? '' : ' bnb-w-plain'}`} empty={<div className="bnb-w-empty">{t('widgets.kind.noRows')}</div>} />
      {more > 0 && (
        onMore
          ? <UnstyledButton className="bnb-w-more" onClick={onMore}>{t('widgets.kind.more', { count: more })}</UnstyledButton>
          : <span className="bnb-w-more">{t('widgets.kind.more', { count: more })}</span>
      )}
    </div>
  )
}

/** Turns to the next page every ``every`` seconds (a wall, #925); draws nothing. */
function TurnPages({ every, at, pages, onPage }: { every: number; at: number; pages: number; onPage: (page: number) => void }) {
  // Keyed on the page, so a refresh of the data doesn't restart the wait.
  useEffect(() => {
    const timer = window.setTimeout(() => onPage((at + 1) % pages), every * 1000)
    return () => window.clearTimeout(timer)
  }, [every, at, pages, onPage])
  return null
}

/** Tells the dashboard editor how many rows show (#928); draws nothing. */
function ReportRows({ shown, total }: { shown: number; total: number }) {
  const report = useContext(LevelReport)
  useEffect(() => { report?.rows(shown, total) }, [report, shown, total])
  return null
}
