import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { Where } from '../../../../test/Where'
import { useFilters } from '../useFilters'
import { activeFilters, FilterBar, type FilterGroup } from './FilterBar'


function List({ layout }: { layout?: 'menus' | 'panel' }) {
  const f = useFilters({ state: 'all' })
  return (
    <>
      <FilterBar search={f.search} onSearchChange={f.setSearch} searchLabel="Search" layout={layout} onClear={f.clear}
        groups={f.groups([{ key: 'state', label: 'Show', options: [{ value: 'all', label: 'All', count: 5 }, { value: 'down', label: 'Down', count: 2 }] }])} />
      <Where />
    </>
  )
}

describe('FilterBar', () => {
  it('keeps search and filters in the address, with counts, and clears them', async () => {
    renderWithApp(<List />, '/list?page=3')
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show: All (5)' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /Down/ }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'sw' } })
    // A new filter starts the list on its first page again.
    expect(screen.getByRole('status')).toHaveTextContent('?state=down&q=sw')
    expect(screen.getByRole('button', { name: 'Show: Down (2)' })).toHaveTextContent('2')
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('opens on the address it was given', () => {
    renderWithApp(<List />, '/list?state=down')
    expect(screen.getByRole('button', { name: 'Show: Down (2)' })).toBeInTheDocument()
  })

  it('shows the active filters as chips in the panel layout, and removes one', () => {
    renderWithApp(<List layout="panel" />, '/list?state=down')
    const chip = screen.getByRole('button', { name: 'Remove Show: Down' })
    fireEvent.click(chip)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('works with groups the page controls itself', () => {
    const onChange = vi.fn()
    const groups: FilterGroup[] = [
      { key: 'tier', label: 'Tier', value: 'gold', defaultValue: '', onChange, options: [{ value: '', label: 'All' }, { value: 'gold', label: 'Gold' }] },
      { key: 'old', label: 'Old', value: '', defaultValue: '', onChange, hidden: true },
    ]
    expect(activeFilters(groups).map((g) => g.key)).toEqual(['tier'])
    renderWithApp(<FilterBar groups={groups} layout="panel" />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tier: Gold' }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
