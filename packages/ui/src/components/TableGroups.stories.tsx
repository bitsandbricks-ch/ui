import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { DataTable, type DataColumn } from './DataTable'

const meta: Meta = { title: 'Components/DataTable/Row groups' }
export default meta
type Story = StoryObj

type Agent = { id: string; name: string; site: string; version: string; state: 'ok' | 'warn' | 'down' }
const sites = ['Hall A', 'Hall B', 'Backstage']
const agents: Agent[] = Array.from({ length: 11 }, (_, i) => ({
  id: `a${i}`, name: `agent-${i + 1}`, site: sites[i % 3], version: `1.${4 + (i % 2)}.0`,
  state: i === 4 ? 'down' : i === 7 ? 'warn' : 'ok',
}))
const columns: DataColumn<Agent>[] = [
  { id: 'name', header: 'Name', cell: (r) => r.name, sort: (r) => r.name, mono: true },
  { id: 'version', header: 'Version', cell: (r) => r.version, sort: (r) => r.version, width: 120 },
  { id: 'state', header: 'State', cell: (r) => <StatusBadge state={r.state} />, sort: (r) => r.state, width: 140 },
]

/** One table, a header row per group: the columns line up, and the sort works inside each group. */
export const Grouped: Story = {
  render: () => (
    <DataTable label="Agents" rows={agents} columns={columns} rowKey={(r) => r.id} urlState={false}
      defaultSort={{ id: 'name' }} groupBy={(r) => r.site} groupOrder={sites} />
  ),
}

function Folding() {
  const [folded, setFolded] = useState(['Backstage'])
  return (
    <DataTable label="Agents" rows={agents} columns={columns} rowKey={(r) => r.id} urlState={false}
      defaultSort={{ id: 'name' }} groupBy={(r) => r.site} groupOrder={sites} pageSize={5} pagerAt="bottom"
      foldable folded={folded} onFold={setFolded}
      groupHeader={(site, rows) => {
        const down = rows.filter((r) => r.state !== 'ok').length
        return <>{site} · {rows.length} agents{down ? <> · <StatusBadge state="warn" label={`${down} need a look`} /></> : null}</>
      }} />
  )
}

/** Groups fold; paging counts the rows that show, and a group cut by the page break shows its header again. */
export const FoldingAndPages: Story = { render: () => <Folding /> }
