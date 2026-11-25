import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DataTable, type DataColumn } from './DataTable'
import { StatusBadge } from './StatusBadge'

const meta: Meta = { title: 'Table extras' }
export default meta

type Host = { id: string; name: string; zone: string; state: 'up' | 'down' | 'degraded'; load: number }
const hosts: Host[] = Array.from({ length: 14 }, (_, i) => ({
  id: `h${i + 1}`, name: `web-${i + 1}`, zone: i % 3 ? 'zurich' : 'geneva',
  state: i % 7 === 3 ? 'down' : i % 5 === 2 ? 'degraded' : 'up', load: (i * 13) % 100,
}))
const columns: DataColumn<Host>[] = [
  { id: 'name', header: 'Name', sort: (r) => r.name, cell: (r) => r.name },
  { id: 'zone', header: 'Zone', sort: (r) => r.zone, cell: (r) => r.zone },
  { id: 'state', header: 'State', sort: (r) => r.state, cell: (r) => <StatusBadge state={r.state} />, text: (r) => r.state },
  { id: 'load', header: 'Load', sort: (r) => r.load, cell: (r) => `${r.load} %`, numeric: true, descFirst: true },
]

/** Click the table, then ↑↓ (or j k) move, Space picks, shift+click picks a span. */
export const KeysPicksExport: StoryObj = {
  render: function Render() {
    const [selected, setSelected] = useState<string | null>('h2')
    const [picked, setPicked] = useState<string[]>(['h4', 'h5'])
    return (
      <DataTable label="Hosts" rows={hosts} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} urlState={false}
        selected={selected} onSelect={setSelected} picked={picked} onPick={setPicked} rowLabel={(r) => r.name}
        exportName="Hosts" isNew={(r) => r.id === 'h3' || r.id === 'h9'} pageSize={10} count={(n) => `${n} hosts`} />
    )
  },
}

/** A list next to a side panel: the row whose panel is open stays marked; the keys stay with the page. */
export const OpenRow: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState<string | null>('h3')
    return (
      <DataTable label="Hosts" rows={hosts.slice(0, 6)} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} urlState={false}
        selected={open} onRowClick={(r) => setOpen(r.id)} pageSize={0} />
    )
  },
}
