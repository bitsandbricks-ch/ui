import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { DataTable, type DataColumn } from './DataTable'

type Agent = { id: string; name: string; site: string; seen: number }
const rows: Agent[] = [
  { id: 'a1', name: 'agent-2', site: 'Hall A', seen: 3 },
  { id: 'b1', name: 'agent-9', site: 'Hall B', seen: 1 },
  { id: 'a2', name: 'agent-10', site: 'Hall A', seen: 7 },
  { id: 'b2', name: 'agent-1', site: 'Hall B', seen: 2 },
  { id: 'a3', name: 'agent-1', site: 'Hall A', seen: 5 },
]
const columns: DataColumn<Agent>[] = [
  { id: 'name', header: 'Name', cell: (r) => r.name, sort: (r) => r.name },
  { id: 'seen', header: 'Seen', cell: (r) => r.seen, sort: (r) => r.seen, numeric: true },
]
const names = () => screen.getAllByRole('row').map((r) => r.textContent)

describe('DataTable row groups', () => {
  it('draws one table with a header row per group, sorted inside each group', () => {
    renderWithApp(<DataTable label="Agents" rows={rows} columns={columns} rowKey={(r) => r.id} urlState={false}
      defaultSort={{ id: 'name' }} groupBy={(r) => r.site} />)
    expect(screen.getAllByRole('table')).toHaveLength(1)
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getByRole('rowheader', { name: 'Hall A 3' })).toHaveAttribute('scope', 'rowgroup')
    expect(names()).toEqual(['NameSeen', 'Hall A 3', 'agent-15', 'agent-23', 'agent-107', 'Hall B 2', 'agent-12', 'agent-91'])
  })

  it('follows groupOrder and takes the header from groupHeader', () => {
    renderWithApp(<DataTable label="Agents" rows={rows} columns={columns} rowKey={(r) => r.id} urlState={false}
      groupBy={(r) => r.site} groupOrder={['Hall B', 'Hall A']} groupHeader={(key, all) => `${key}: ${all.length} agents`} />)
    const heads = screen.getAllByRole('rowheader').map((h) => h.textContent)
    expect(heads).toEqual(['Hall B: 2 agents', 'Hall A: 3 agents'])
  })

  it('folds a group away and pages the rows that show, repeating a header cut by the break', () => {
    renderWithApp(<DataTable label="Agents" rows={rows} columns={columns} rowKey={(r) => r.id} urlState={false}
      defaultSort={{ id: 'name' }} groupBy={(r) => r.site} pageSize={2} pagerAt="bottom" foldable />)
    const page = () => screen.getAllByRole('rowheader').map((h) => h.textContent)
    expect(page()).toEqual(['Hall A 3'])
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(page()).toEqual(['Hall A 3', 'Hall B 2'])
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    const fold = within(screen.getByRole('rowheader', { name: /Hall A/ })).getByRole('button')
    expect(fold).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(fold)
    expect(within(screen.getByRole('rowheader', { name: /Hall A/ })).getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(page()).toEqual(['Hall A 3', 'Hall B 2'])
    expect(screen.queryByText('agent-10')).toBeNull()
    expect(screen.getByText('agent-9')).toBeInTheDocument()
  })
})
