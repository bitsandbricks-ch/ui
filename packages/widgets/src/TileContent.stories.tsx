import { Anchor, SimpleGrid, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Widget } from '@bitsandbricks/ui'
import { FitWidget } from './FitWidget'
import { TileCard } from './TileCard'
import { WidgetBody } from './WidgetBody'

const meta: Meta = { title: 'Widgets/Tiles' }
export default meta

const base = { id: 'w', label: '', size: 's', refresh: 60, sub: '', link: '' } as const
const people: Widget = { ...base, type: 'list', total: 23, items: [
  { label: 'Anna Muster', value: '', tone: '', sub: 'Joined on 3 Nov', link: '#/members/1' },
  { label: 'Ben Keller', value: '', tone: '', sub: 'Joined on 28 Oct', link: '#/members/2' },
  { label: 'Chiara Rossi', value: '', tone: '', sub: 'Joined on 21 Oct', link: '#/members/3' },
] }
const note: Widget = { ...base, type: 'text', text: 'The hall key is in the box at the door.\nBring it back after the training, please.\n\nNew code from 1 December: ask the board.' }
const links: Widget = { ...base, type: 'list', items: [
  { label: 'Training plan', value: '', tone: '', link: 'https://example.org/plan' },
  { label: 'Club rules', value: '', tone: '', link: 'https://example.org/rules' },
] }

export const Boxes: StoryObj = {
  name: 'Title, action, rows and notes',
  render: () => (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      <TileCard title="New members" action={<Text size="xs" c="dimmed">212 members</Text>}>
        <WidgetBody widget={people} />
      </TileCard>
      <TileCard title="Note" action={<Anchor size="xs" href="#">Edit</Anchor>}>
        <WidgetBody widget={note} />
      </TileCard>
      <TileCard title="Links">
        <WidgetBody widget={links} />
      </TileCard>
    </SimpleGrid>
  ),
}

export const Fitted: StoryObj = {
  name: 'The same data fitted to a box',
  render: () => (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      {[people, note, links].map((w, i) => (
        <TileCard key={i} title={['New members', 'Note', 'Links'][i]}>
          <div style={{ height: 120, display: 'flex' }}><FitWidget widget={w} /></div>
        </TileCard>
      ))}
    </SimpleGrid>
  ),
}
