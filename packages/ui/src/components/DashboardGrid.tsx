import { IconGripVertical } from '@tabler/icons-react'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { GRID_COLS, GRID_HEIGHTS, type GridBox, gridRows, moveInGrid, phonePair, snapGridHeight, stepGridHeight } from './gridLayout'
import { texts } from './DashboardGrid.texts'

const KEYS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

/** A dashboard: boxes on a grid of ``cols`` columns that never overlap and float up (the layout
 *  math is in gridLayout.ts). Each item carries its box (x, y, w, h) and whatever the app needs
 *  to draw it. With ``onChange`` it is in edit mode: a grip moves a box (drag or arrow keys), the
 *  corner resizes it (drag or Shift+arrows), and every step hands the whole new layout back.
 *
 *  Rows are ``rowHeight`` px and the page scrolls, or with ``fit`` the rows share the grid's own
 *  height (a wall screen). ``heights`` are where a height snaps when it isn't fit (small, medium,
 *  large); pass ``[]`` for any height. On a phone the boxes stack in reading order, and small
 *  numbers (a quarter wide, up to medium) sit two side by side. */
export function DashboardGrid<T extends GridBox>({ items, renderItem, itemKey, onChange, cols = GRID_COLS, rowHeight = 40, gap = 8,
  fit = false, heights = GRID_HEIGHTS, label, className }: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemKey?: (item: T, index: number) => string | number
  /** Edit mode: called with the whole layout after each move or resize step. */
  onChange?: (items: T[]) => void
  cols?: number
  rowHeight?: number
  gap?: number
  fit?: boolean
  heights?: number[]
  /** Names the grid for screen readers. */
  label?: string
  className?: string
}) {
  const { t } = useT(texts)
  const body = useRef<HTMLDivElement>(null)
  // The box being resized: its size in cells shows on it while the corner moves.
  const [sizing, setSizing] = useState<number | null>(null)
  const rows = Math.max(1, gridRows(items))
  const snap = (h: number) => (fit || !heights.length ? h : snapGridHeight(h, heights))
  const step = (h: number, dir: 1 | -1) => (fit || !heights.length ? h + dir : stepGridHeight(h, dir, heights))

  // Drags in whole cells: pointer travel over one column's width (or one row's height) moves a cell.
  // Every step starts again from the layout as it was when the drag began, so the others' room-making
  // doesn't pile up.
  const drag = (i: number, mode: 'move' | 'size') => (e: PointerEvent<HTMLElement>) => {
    if (!onChange || !body.current || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const el = e.currentTarget
    el.setPointerCapture?.(e.pointerId)
    const rect = body.current.getBoundingClientRect()
    const col = (rect.width + gap) / cols
    const row = fit ? (rect.height + gap) / rows : rowHeight + gap
    const base = items
    const start = base[i]
    const x0 = e.clientX, y0 = e.clientY
    const move = (ev: globalThis.PointerEvent) => {
      const dx = Math.round((ev.clientX - x0) / col), dy = Math.round((ev.clientY - y0) / row)
      onChange(moveInGrid(base, i, mode === 'move' ? { x: start.x + dx, y: start.y + dy } : { w: start.w + dx, h: snap(start.h + dy) }, cols))
    }
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      setSizing(null)
    }
    if (mode === 'size') setSizing(i)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  const keys = (i: number) => (e: KeyboardEvent) => {
    const d = KEYS[e.key]
    if (!onChange || !d) return
    e.preventDefault()
    const p = items[i]
    const h = d[1] ? step(p.h, d[1] as 1 | -1) : p.h
    onChange(moveInGrid(items, i, e.shiftKey ? { w: p.w + d[0], h } : { x: p.x + d[0], y: p.y + d[1] }, cols))
  }

  const style = {
    '--bnb-grid-cols': cols,
    '--bnb-grid-row': `${rowHeight}px`,
    '--bnb-grid-gap': `${gap}px`,
    gridTemplateRows: fit ? `repeat(${rows}, minmax(0, 1fr))` : `repeat(${rows}, ${rowHeight}px)`,
  } as CSSProperties
  return (
    <div ref={body} role={label ? 'region' : undefined} aria-label={label} style={style}
      className={['bnb-grid', fit && 'is-fit', onChange && 'is-editing', className].filter(Boolean).join(' ')}>
      {items.map((p, i) => (
        <div key={itemKey?.(p, i) ?? i} className={`bnb-grid-item${phonePair(p, cols, heights.length ? heights : GRID_HEIGHTS) ? ' is-pair' : ''}`}
          style={{ gridColumn: `${p.x + 1} / span ${p.w}`, gridRow: `${p.y + 1} / span ${p.h}`, '--rows': p.h, '--at': p.y * cols + p.x } as CSSProperties}>
          {renderItem(p, i)}
          {onChange && (
            <>
              <button type="button" className="bnb-grid-grip" aria-label={t('dashboards.edit.move')} title={t('dashboards.edit.moveHint')}
                onPointerDown={drag(i, 'move')} onKeyDown={keys(i)}>
                <IconGripVertical size={16} aria-hidden="true" />
              </button>
              <span className="bnb-grid-corner" aria-hidden="true" onPointerDown={drag(i, 'size')} />
              {sizing === i && <span className="bnb-grid-size" role="status">{t('dashboards.edit.cells', { w: p.w, h: p.h })}</span>}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
