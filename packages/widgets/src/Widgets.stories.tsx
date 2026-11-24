import { SimpleGrid } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Widget } from '@bitsandbricks-ch/ui'
import { FitWidget } from './FitWidget'
import type { KindPick } from './level'
import { TileCard } from './TileCard'
import { TimeChart } from './TimeChart'

const meta: Meta = { title: 'Widgets' }
export default meta

const base = { id: 'w', label: 'Ports', size: 's', refresh: 60, sub: '', link: '' } as const
const now = 1_764_000_000
const widgets: Record<string, Widget> = {
  stat: { ...base, label: 'Clients', type: 'stat', value: 254, unit: '', tone: 'ok', min: 0, max: 400 },
  status: { ...base, label: 'Switches', type: 'status', items: Array.from({ length: 12 }, (_, i) => ({ label: `sw-${i + 1}`, state: i === 3 ? 'down' : i === 7 ? 'warn' : 'up', detail: `${40 + i} ports` })) },
  list: { ...base, label: 'Zones', type: 'list', items: ['lab', 'iot', 'dmz', 'mgmt', 'guest'].map((z, i) => ({ label: z, value: String(12 - i * 2), number: 12 - i * 2, tone: '' })) },
  series: { ...base, label: 'Uplink', type: 'series', unit: 'bit/s', series: [
    { label: 'in', points: Array.from({ length: 60 }, (_, i) => [now + i * 60, 4e8 + Math.sin(i / 5) * 2e8] as [number, number]) },
    { label: 'out', points: Array.from({ length: 60 }, (_, i) => [now + i * 60, 1e8 + Math.cos(i / 7) * 5e7] as [number, number]) },
  ] },
}

const Box = ({ w, h, children }: { w: number; h: number; children: React.ReactNode }) => (
  <div style={{ width: w, height: h, display: 'flex', border: '1px solid var(--bnb-line)', borderRadius: 10, padding: 12, background: 'var(--bnb-surface)' }}>{children}</div>
)

const kinds: [string, KindPick][] = [['stat', 'stat'], ['stat', 'gauge'], ['status', 'status'], ['status', 'pie'], ['list', 'bar'], ['list', 'column'], ['series', 'graph'], ['series', 'histogram']]

export const Kinds: StoryObj = {
  render: () => (
    <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }}>
      {kinds.map(([data, pick]) => <Box key={`${data}-${pick}`} w={300} h={200}><FitWidget widget={widgets[data]} pick={pick} /></Box>)}
    </SimpleGrid>
  ),
}

export const Levels: StoryObj = {
  name: 'Small, medium, large',
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Box w={160} h={100}><FitWidget widget={widgets.status} /></Box>
      <Box w={300} h={180}><FitWidget widget={widgets.status} /></Box>
      <Box w={560} h={320}><FitWidget widget={widgets.status} /></Box>
    </div>
  ),
}

export const Chart: StoryObj = {
  render: () => (
    <TileCard title="Agent memory" from="Labdex agent">
      <TimeChart label="Memory over the last hour" since={now} until={now + 3600} points={Array.from({ length: 50 }, (_, i) => [now + i * 72, 300 + (i % 9) * 20] as [number, number])} format={(v) => `${v} MB`} />
    </TileCard>
  ),
}
