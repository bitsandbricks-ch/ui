import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { Where } from '../../../../test/Where'
import { ConfirmIcon } from './Confirm'
import { DataTable, type DataColumn } from './DataTable'

type Row = { id: string; name: string; ports: number }
const rows: Row[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `sw-${i + 1}`, ports: (i * 7) % 5 }))
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Name', sort: (r) => r.name, cell: (r) => r.name },
  { id: 'ports', header: 'Ports', sort: (r) => r.ports, cell: (r) => String(r.ports), numeric: true },
  { id: 'note', header: 'Note', cell: () => '–' },
]

const names = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent)

describe('DataTable', () => {
  it('sorts names naturally, turns on a header click, and keeps it in the address', () => {
    renderWithApp(<><DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} pageSize={5} count={(n) => `${n} switches`} /><Where /></>)
    expect(names()).toEqual(['sw-1', 'sw-2', 'sw-3', 'sw-4', 'sw-5'])
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByText('12 switches')).toBeInTheDocument()
    expect(within(screen.getByRole('columnheader', { name: 'Note' })).queryByRole('button')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Name/ }))
    expect(names()[0]).toBe('sw-12')
    expect(screen.getByTestId('where').textContent).toBe('?sort=-name')

    fireEvent.click(within(screen.getByRole('navigation', { name: 'Pages, above the table' })).getByRole('button', { name: 'Next page' }))
    expect(names()[0]).toBe('sw-7')
    expect(screen.getByTestId('where').textContent).toBe('?sort=-name&page=2')
  })

  it('opens on the view the address names', () => {
    renderWithApp(<DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} pageSize={5} />, '/?sort=ports&page=3')
    expect(screen.getByRole('columnheader', { name: /Ports/ })).toHaveAttribute('aria-sort', 'ascending')
    expect(names()).toHaveLength(2)
  })

  it('keeps its view to itself where several tables share a page', () => {
    renderWithApp(<><DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} urlState={false} pageSize={0} /><Where /></>)
    expect(names()).toHaveLength(12)
    fireEvent.click(screen.getByRole('button', { name: /Ports/ }))
    expect(screen.getByTestId('where').textContent).toBe('')
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull()
  })

  it('shows the page buttons above and below the table, and scrolls up when turned below', () => {
    renderWithApp(<DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} pageSize={5} urlState={false} />)
    const top = screen.getByRole('navigation', { name: 'Pages, above the table' })
    expect(within(top).getByText('1–5 of 12')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Next page' })).toHaveLength(2)

    const scroll = vi.fn()
    top.scrollIntoView = scroll
    top.getBoundingClientRect = () => ({ top: -400 }) as DOMRect
    const [, below] = screen.getAllByRole('button', { name: 'Previous page' })
    fireEvent.click(screen.getAllByRole('button', { name: 'Next page' })[1])
    expect(names()[0]).toBe('sw-6')
    expect(scroll).toHaveBeenCalledWith({ block: 'start' })

    fireEvent.click(below)
    expect(names()[0]).toBe('sw-1')
    expect(scroll).toHaveBeenCalledTimes(2)

    // From the buttons above, the top is already in view.
    top.getBoundingClientRect = () => ({ top: 80 }) as DOMRect
    fireEvent.click(within(top).getByRole('button', { name: 'Next page' }))
    expect(names()[0]).toBe('sw-6')
    expect(scroll).toHaveBeenCalledTimes(2)
  })

  it('shows the page buttons only where pagerAt says, and none above a single page', () => {
    const props = { label: 'Switches', rows, columns, rowKey: (r: Row) => r.id, pageSize: 5, urlState: false }
    const { rerender } = renderWithApp(<DataTable {...props} pagerAt="bottom" />)
    expect(screen.queryByRole('navigation', { name: 'Pages, above the table' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Next page' })).toHaveLength(1)

    rerender(<DataTable {...props} pagerAt="top" />)
    expect(within(screen.getByRole('navigation', { name: 'Pages, above the table' })).getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Next page' })).toHaveLength(1)

    rerender(<DataTable {...props} pager="compact" />)
    expect(within(screen.getByRole('navigation', { name: 'Pages, above the table' })).getByText('1–5 of 12')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Next page' })).toHaveLength(2)

    rerender(<DataTable {...props} pageSize={20} />)
    expect(screen.queryByRole('navigation', { name: 'Pages, above the table' })).toBeNull()
  })

  it('pages at 50 rows by default', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ id: String(i), name: `h-${i}`, ports: i }))
    renderWithApp(<DataTable label="Hosts" rows={many} columns={columns} rowKey={(r) => r.id} />)
    expect(names()).toHaveLength(50)
  })

  it('says so when there is nothing to show, and shows lines while loading', () => {
    const { rerender } = renderWithApp(<DataTable label="Switches" rows={[]} columns={columns} rowKey={(r) => r.id} empty="No switches yet." />)
    expect(screen.getByText('No switches yet.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
    rerender(<DataTable label="Switches" rows={[]} columns={columns} rowKey={(r) => r.id} loading />)
    expect(screen.getByRole('status', { name: 'Loading…' })).toBeInTheDocument()
  })

  it('opens a row on click and on Enter', () => {
    const open = vi.fn()
    renderWithApp(<DataTable label="Switches" rows={rows.slice(0, 2)} columns={columns} rowKey={(r) => r.id} onRowClick={open} />)
    const [, first, second] = screen.getAllByRole('row')
    fireEvent.click(first)
    fireEvent.keyDown(second, { key: 'Enter' })
    expect(open.mock.calls.map((c) => c[0].name)).toEqual(['sw-1', 'sw-2'])
  })

  it('leaves the row closed when a button in it, or the dialog it opens, is clicked', async () => {
    const open = vi.fn()
    const remove = vi.fn()
    const withDelete: DataColumn<Row>[] = [...columns,
      { id: 'del', header: '', cell: (r) => <ConfirmIcon label={`Delete ${r.name}`} onConfirm={remove}>×</ConfirmIcon> }]
    renderWithApp(<DataTable label="Switches" rows={rows.slice(0, 1)} columns={withDelete} rowKey={(r) => r.id} onRowClick={open} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete sw-1' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(open).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByRole('row')[1])
    expect(open).toHaveBeenCalledTimes(1)
  })
})
