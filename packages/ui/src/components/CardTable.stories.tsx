import { Button, Paper, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardTable, type CardFilter } from './CardTable'
import { StatusBadge } from './StatusBadge'

const meta: Meta = { title: 'Components/CardTable' }
export default meta
type Story = StoryObj

type Host = { id: string; name: string; zone: string; state: 'online' | 'offline' }
const hosts: Host[] = Array.from({ length: 64 }, (_, i) => ({
  id: String(i), name: `host-${i + 1}`, zone: ['lab', 'iot', 'dmz', 'mgmt'][i % 4], state: i % 9 === 0 ? 'offline' : 'online',
}))
const zone: CardFilter<Host> = {
  key: 'zone', label: 'Zone', defaultValue: 'all', match: (h, v) => h.zone === v,
  options: [{ value: 'all', label: 'All' }, ...['lab', 'iot', 'dmz', 'mgmt'].map((z) => ({ value: z, label: z }))],
}

/** A gallery with search, a filter (with counts) and pages of 24. */
export const Gallery: Story = {
  render: () => (
    <CardTable<Host> items={hosts} itemKey={(h) => h.id} label="Hosts" searchText={(h) => `${h.name} ${h.zone}`} filters={[zone]}
      actions={<Button leftSection={<IconPlus size={16} />}>Add host</Button>}
      renderCard={(h) => (
        <Paper withBorder radius="lg" p="md" component="article" aria-label={h.name}>
          <Text fw={600}>{h.name}</Text>
          <Text size="sm" c="dimmed" mb="xs">{h.zone}</Text>
          <StatusBadge state={h.state} />
        </Paper>
      )} />
  ),
}
