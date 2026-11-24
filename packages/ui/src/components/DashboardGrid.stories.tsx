import { Paper, Switch, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DashboardGrid } from './DashboardGrid'
import { flowGrid, type GridBox } from './gridLayout'

const meta: Meta = { title: 'Components/Dashboard grid' }
export default meta

type Box = GridBox & { id: string; title: string }
const card = (p: Box) => (
  <Paper withBorder radius="lg" p="md">
    <Text fw={700} size="sm">{p.title}</Text>
    <Text size="xs" c="dimmed">{p.w} × {p.h}</Text>
  </Paper>
)

const hall: Box[] = [
  { id: 'hall', title: 'Hall plan', x: 0, y: 0, w: 14, h: 8 },
  { id: 'ups', title: 'UPS load', x: 14, y: 0, w: 5, h: 3 },
  { id: 'clients', title: 'Clients', x: 19, y: 0, w: 5, h: 3 },
  { id: 'net', title: 'Network', x: 14, y: 3, w: 10, h: 5 },
  { id: 'notes', title: 'Notes', x: 0, y: 8, w: 24, h: 3 },
]

function Editable({ start, cols, fit }: { start: Box[]; cols?: number; fit?: boolean }) {
  const [items, setItems] = useState(start)
  const [editing, setEditing] = useState(true)
  return (
    <div style={fit ? { height: 520, display: 'flex', flexDirection: 'column', gap: 12 } : { display: 'grid', gap: 12 }}>
      <Switch label="Edit" checked={editing} onChange={(e) => setEditing(e.currentTarget.checked)} />
      <DashboardGrid items={items} renderItem={card} itemKey={(p) => p.id} cols={cols} fit={fit} label="Dashboard"
        onChange={editing ? setItems : undefined} />
    </div>
  )
}

export const Edit: StoryObj = { name: 'Edit (24 columns)', render: () => <Editable start={hall} /> }
export const Fit: StoryObj = { name: 'Fit to the screen', render: () => <Editable start={hall} fit /> }

// An ordered list of sizes (small 4, medium 6, large 12 columns) laid out once with flowGrid.
const ordered = flowGrid([
  { id: 'members', title: 'Members', w: 4, h: 3 }, { id: 'events', title: 'Next events', w: 4, h: 5 },
  { id: 'finance', title: 'Open invoices', w: 4, h: 3 }, { id: 'posts', title: 'Recent posts', w: 6, h: 5 },
  { id: 'note', title: 'Note', w: 6, h: 3 }, { id: 'chart', title: 'Joins and leaves', w: 12, h: 5 },
], 12)
export const TwelveColumns: StoryObj = { name: 'From an ordered list (12 columns)', render: () => <Editable start={ordered} cols={12} /> }
