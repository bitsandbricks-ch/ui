import { SimpleGrid } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Widget } from '@bitsandbricks/ui'
import { FitWidget } from './FitWidget'
import type { Shaping } from './kinds/combine'
import type { Display } from './kinds/display'
import { TileCard } from './TileCard'
import { usePaneData, type PaneSource } from './usePaneData'

const meta: Meta = { title: 'Widgets/Pane data' }
export default meta

const base = { id: 'w', size: 's', refresh: 60, sub: '', link: '' } as const
const halls: PaneSource[] = ['A', 'B', 'C'].map((h, i) => ({
  data: { ...base, label: `Hall ${h}`, type: 'stat', value: [42, 17, 28][i], unit: 'kW', tone: '', max: 60 } satisfies Widget,
}))
const switches: Widget = { ...base, label: 'Switches', type: 'status', items: Array.from({ length: 14 }, (_, i) => ({
  label: `sw-${i + 1}`, state: i % 5 === 0 ? 'down' : i % 4 === 0 ? 'warn' : 'up', detail: `hall ${(i % 3) + 1}` })) }

function Pane({ title, sources, how = {}, display }: { title: string; sources: PaneSource[]; how?: Shaping; display?: Display }) {
  const { data, isPending, error } = usePaneData(sources, how, [], display)
  return (
    <TileCard title={title}>
      <div style={{ height: 180, display: 'flex' }}>
        {isPending ? 'Loading…' : error ? error.message : data && <FitWidget widget={data} />}
      </div>
    </TileCard>
  )
}

export const Sources: StoryObj = {
  name: 'Merged, grouped and shown',
  render: () => (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      <Pane title="Three halls, one list" sources={halls} display={{ sort: 'value-desc', thresholds: [{ at: 40, tone: 'warn' }] }} />
      <Pane title="Switches by state" sources={[{ data: switches }]} how={{ group_by: 'state', reduce: 'count' }} />
      <Pane title="First source still loading" sources={[{ isPending: true }, ...halls]} />
    </SimpleGrid>
  ),
}
