import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { CardTable, type CardFilter } from './CardTable'

type W = { id: string; name: string; area: 'network' | 'power' }
const items: W[] = Array.from({ length: 30 }, (_, i) => ({ id: String(i), name: `Widget ${i + 1}`, area: i % 3 ? 'network' : 'power' }))
const area: CardFilter<W> = {
  key: 'area', label: 'Area', defaultValue: 'all',
  options: [{ value: 'all', label: 'All' }, { value: 'network', label: 'Network' }, { value: 'power', label: 'Power' }],
  match: (w, v) => w.area === v,
}
const render = (extra: Partial<Parameters<typeof CardTable<W>>[0]> = {}) => renderWithApp(
  <CardTable<W> items={items} itemKey={(w) => w.id} label="Widgets" searchText={(w) => w.name} filters={[area]}
    renderCard={(w) => <article aria-label={w.name}>{w.name}</article>} {...extra} />,
)
const cards = () => within(screen.getByRole('list', { name: 'Widgets' })).getAllByRole('article')

describe('CardTable', () => {
  it('pages the cards and turns pages', () => {
    render({ pageSize: 12 })
    expect(cards()).toHaveLength(12)
    expect(screen.getByText('1–12 of 30')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(cards()).toHaveLength(6)
    expect(cards()[0]).toHaveAccessibleName('Widget 25')
  })

  it('searches and starts again on the first page', () => {
    render({ pageSize: 12 })
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'widget 2' } })
    // "Widget 2" and "Widget 20" to "Widget 29"
    expect(cards()).toHaveLength(11)
    expect(cards()[0]).toHaveAccessibleName('Widget 2')
  })

  it('filters with a count per choice', async () => {
    render()
    fireEvent.click(screen.getByRole('button', { name: /Area/ }))
    const power = await screen.findByRole('menuitem', { name: /Power/ })
    expect(power).toHaveTextContent('10')
    fireEvent.click(power)
    expect(cards()).toHaveLength(10)
    expect(cards().every((c) => Number(c.textContent!.split(' ')[1]) % 3 === 1)).toBe(true)
  })

  it('says when nothing matches, and clears in one go', () => {
    render()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nope' } })
    expect(screen.queryByRole('list', { name: 'Widgets' })).toBeNull()
    expect(screen.getByText('Nothing matches the search or filters.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(cards()).toHaveLength(24)
  })

  it('shows its empty state when there is nothing at all', () => {
    renderWithApp(<CardTable<W> items={[]} itemKey={(w) => w.id} label="Widgets" renderCard={() => null} empty={<p>No widgets yet</p>} />)
    expect(screen.getByText('No widgets yet')).toBeInTheDocument()
  })

  it('leaves out search and filters when there is nothing to search', () => {
    renderWithApp(<CardTable<W> items={[]} itemKey={(w) => w.id} label="Widgets" renderCard={() => null} searchText={(w) => w.name}
      filters={[area]} empty={<p>No widgets yet</p>} />)
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button', { name: /Area/ })).toBeNull()
  })
})
