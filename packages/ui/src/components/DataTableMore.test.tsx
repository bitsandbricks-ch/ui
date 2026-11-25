import { act, fireEvent, renderHook, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { useSeen } from '../useSeen'
import { DataTable, type DataColumn } from './DataTable'

type Row = { id: string; name: string; ports: number }
const rows: Row[] = [3, 1, 2].map((n) => ({ id: `s${n}`, name: `sw-${n}`, ports: n * 2 }))
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Name', sort: (r) => r.name, cell: (r) => r.name },
  { id: 'ports', header: 'Ports', sort: (r) => r.ports, cell: (r) => `${r.ports} ports`, text: (r) => r.ports },
]

function Keyed({ onOpen = () => {}, onPicked = () => {} }: { onOpen?: (r: Row) => void; onPicked?: (k: string[]) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  return (
    <DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} urlState={false}
      selected={selected} onSelect={setSelected} onRowClick={onOpen} rowLabel={(r) => r.name}
      picked={picked} onPick={(k) => { setPicked(k); onPicked(k) }} />
  )
}
const selectedName = () => within(screen.getByRole('table')).getAllByRole('row').find((r) => r.getAttribute('aria-selected') === 'true')?.textContent

describe('DataTable with keys', () => {
  it('moves with the arrows and j k, and opens with Enter', () => {
    const open = vi.fn()
    renderWithApp(<Keyed onOpen={open} />)
    const table = screen.getByRole('table')
    fireEvent.keyDown(table, { key: 'ArrowDown' })
    expect(selectedName()).toContain('sw-1')
    fireEvent.keyDown(table, { key: 'j' })
    fireEvent.keyDown(table, { key: 'j' })
    fireEvent.keyDown(table, { key: 'j' })
    expect(selectedName()).toContain('sw-3')
    fireEvent.keyDown(table, { key: 'g' })
    expect(selectedName()).toContain('sw-1')
    fireEvent.keyDown(table, { key: 'Enter' })
    expect(open).toHaveBeenCalledWith(rows[1])
  })

  it('picks rows with the boxes, a span with shift, all from the header, and Space', () => {
    const picked = vi.fn()
    renderWithApp(<Keyed onPicked={picked} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pick sw-1' }))
    expect(picked).toHaveBeenLastCalledWith(['s1'])
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pick sw-3' }), { shiftKey: true })
    expect(picked).toHaveBeenLastCalledWith(['s1', 's2', 's3'])
    expect(screen.getByText('· 3 picked')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pick every row' }))
    expect(picked).toHaveBeenLastCalledWith([])
    const table = screen.getByRole('table')
    fireEvent.keyDown(table, { key: 'ArrowDown' })
    fireEvent.keyDown(table, { key: ' ' })
    expect(picked).toHaveBeenLastCalledWith(['s1'])
  })
})

describe('DataTable extras', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('downloads the sorted rows as CSV, every page', async () => {
    let csv = ''
    let name = ''
    const create = vi.fn((b: Blob) => { void b.text().then((t) => { csv = t }); return 'blob:x' })
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { name = this.download })
    renderWithApp(<DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} pageSize={2} exportName="Switches" urlState={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }))
    await vi.waitFor(() => expect(csv).not.toBe(''))
    expect(csv).toBe('Name,Ports\r\nsw-1,2\r\nsw-2,4\r\nsw-3,6\r\n')
    expect(name).toMatch(/^switches-\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('marks new rows, in German too', () => {
    renderWithApp(<DataTable label="Switches" rows={rows} columns={columns} rowKey={(r) => r.id} isNew={(r) => r.id === 's2'} urlState={false} />, '/', 'de')
    const row = within(screen.getByRole('table')).getAllByRole('row').find((r) => r.textContent?.includes('sw-2'))
    expect(row).toHaveTextContent('Neu seit dem letzten Besuch')
  })
})

describe('useSeen', () => {
  it('marks nothing on the first visit and what is new on the next', () => {
    localStorage.clear()
    const first = renderHook(() => useSeen('test:list', ['a', 'b']))
    expect(first.result.current.count).toBe(0)
    first.unmount()
    const next = renderHook(() => useSeen('test:list', ['a', 'b', 'c']))
    expect(next.result.current.isNew('c')).toBe(true)
    expect(next.result.current.isNew('a')).toBe(false)
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    expect(JSON.parse(localStorage.getItem('bnb-seen:test:list') || '[]')).toEqual(['a', 'b', 'c'])
  })
})

describe('DataTable column names', () => {
  it('names a column without a heading for screen readers', () => {
    const columns: DataColumn<{ id: string }>[] = [
      { id: 'name', header: 'Name', cell: (r) => r.id },
      { id: 'del', header: '', cell: () => <button type="button">×</button> },
    ]
    renderWithApp(<DataTable label="Hosts" rows={[{ id: 'a' }]} columns={columns} rowKey={(r) => r.id} />)
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Actions'])
  })
})

describe('DataTable open row', () => {
  it('marks the row whose panel is open, without taking the keys', () => {
    renderWithApp(<DataTable label="Apps" urlState={false} rowKey={(r) => r.id} selected="b" onRowClick={vi.fn()}
      rows={[{ id: 'a', name: 'Steam' }, { id: 'b', name: 'Riot' }]}
      columns={[{ id: 'name', header: 'Name', cell: (r: { id: string; name: string }) => r.name }]} />)
    const row = screen.getByText('Riot').closest('tr')
    expect(row).toHaveAttribute('data-selected')
    expect(row).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Steam').closest('tr')).not.toHaveAttribute('data-selected')
    expect(screen.getByRole('table')).not.toHaveClass('is-keyed')
  })
})
