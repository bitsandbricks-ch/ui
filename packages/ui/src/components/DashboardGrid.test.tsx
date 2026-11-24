import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { DashboardGrid } from './DashboardGrid'

type Item = { id: string; x: number; y: number; w: number; h: number }
const items: Item[] = [{ id: 'hall', x: 0, y: 0, w: 16, h: 8 }, { id: 'ups', x: 16, y: 0, w: 6, h: 3 }, { id: 'net', x: 16, y: 3, w: 8, h: 5 }]
const draw = (p: Item) => <section aria-label={p.id}>{p.id}</section>

describe('DashboardGrid', () => {
  it('puts each item on its columns and rows, with nothing to edit by default', () => {
    renderWithApp(<DashboardGrid items={items} renderItem={draw} itemKey={(p) => p.id} label="Hall" />)
    const cell = screen.getByRole('region', { name: 'ups' }).parentElement!
    expect(cell.style.gridColumn).toBe('17 / span 6')
    expect(cell.style.gridRow).toBe('1 / span 3')
    expect(cell).toHaveClass('is-pair')
    expect(screen.getByRole('region', { name: 'Hall' })).toHaveStyle({ gridTemplateRows: 'repeat(8, 40px)' })
    expect(screen.queryByRole('button', { name: 'Move widget' })).toBeNull()
  })

  it('moves with the arrow keys and resizes with Shift, snapping the height', () => {
    const change = vi.fn()
    renderWithApp(<DashboardGrid items={items} renderItem={draw} onChange={change} />)
    const [, ups] = screen.getAllByRole('button', { name: 'Move widget' })
    fireEvent.keyDown(ups, { key: 'ArrowRight' })
    expect(change.mock.lastCall![0][1]).toMatchObject({ id: 'ups', x: 17, y: 0 })
    fireEvent.keyDown(ups, { key: 'ArrowDown', shiftKey: true })
    expect(change.mock.lastCall![0][1]).toMatchObject({ id: 'ups', w: 6, h: 5 })
    // The one below made room rather than overlapping.
    expect(change.mock.lastCall![0][2]).toMatchObject({ id: 'net', y: 5 })
    fireEvent.keyDown(ups, { key: 'Enter' })
    expect(change).toHaveBeenCalledTimes(2)
  })

  it('takes any height when fit to the screen, and speaks German', () => {
    const change = vi.fn()
    renderWithApp(<DashboardGrid items={items} renderItem={draw} onChange={change} fit cols={24} />, '/', 'de')
    fireEvent.keyDown(screen.getAllByRole('button', { name: 'Widget verschieben' })[1], { key: 'ArrowDown', shiftKey: true })
    expect(change.mock.lastCall![0][1]).toMatchObject({ h: 4 })
  })
})
