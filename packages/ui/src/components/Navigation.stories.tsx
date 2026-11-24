import { Stack, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Card } from './feedback'
import { GlanceList } from './GlanceList'
import { SectionLayout, type SectionDef } from './SectionLayout'
import { Segmented } from './Segmented'
import { PageTabs } from './Tabs'

const meta: Meta = { title: 'Components/Navigation' }
export default meta
type Story = StoryObj

const sections: SectionDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People', status: '14 coming, 3 not sure' },
  { id: 'costs', label: 'Costs', status: 'You owe CHF 12', dot: true },
  { id: 'travel', label: 'Travel', status: '3 cars, 2 seats free' },
  { id: 'settings', label: 'Settings' },
]

function Sections() {
  const [active, setActive] = useState('overview')
  const section = sections.find((s) => s.id === active)!
  return (
    <SectionLayout label="Sections" sections={sections} active={active} onSelect={setActive}>
      <Card title={section.label}><Text size="sm">The {section.label.toLowerCase()} section. Narrow the window to see the phone layout.</Text></Card>
    </SectionLayout>
  )
}

/** Rows on the hub on phones (with a back link inside a section), a sticky sidebar on wide screens. */
export const Sections_: Story = { name: 'SectionLayout', render: () => <Sections /> }

/** The overview's list of tabs, each with what is going on there. */
export const Glance: Story = {
  name: 'GlanceList',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <GlanceList title="At a glance" rows={[
        { id: 'people', label: 'People', href: '#people', status: '14 coming, 3 not sure' },
        { id: 'costs', label: 'Costs', href: '#costs', status: 'You owe CHF 12', dot: true },
        { id: 'seats', label: 'Seats', href: '#seats', status: 'Draft plan', hidden: 'Only organisers see this for now' },
        { id: 'games', label: 'Games', status: 'Opens a week before' },
      ]} />
    </div>
  ),
}

function TabsDemo() {
  const [active, setActive] = useState('overview')
  return (
    <div style={{ maxWidth: 420 }}>
      <PageTabs label="Event" active={active} onChange={setActive} tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'people', label: 'People', count: 14 },
        { id: 'costs', label: 'Costs', alert: 'warn' },
        { id: 'seats', label: 'Seats', hidden: 'Only organisers see this for now' },
        { id: 'travel', label: 'Travel' },
        { id: 'games', label: 'Games' },
      ]} />
      <Text size="sm" c="dimmed">Pick a tab far right: the row keeps it in view.</Text>
    </div>
  )
}

/** A tab only organisers see yet: muted, with a crossed-out eye. */
export const HiddenTab: Story = { render: () => <TabsDemo /> }

function SegmentedDemo({ fill }: { fill?: boolean }) {
  const [view, setView] = useState('car')
  return (
    <Stack maw={fill ? 360 : undefined}>
      <Segmented label="Trip" value={view} onChange={setView} fill={fill} options={[
        { value: 'car', label: 'Carpool', count: 3 },
        { value: 'sleep', label: 'Sleeping', dot: true, dotLabel: '2 to confirm' },
        { value: 'pack', label: 'Packing', count: 12 },
      ]} />
      <Text size="sm" c="dimmed">Showing: {view}</Text>
    </Stack>
  )
}

/** A switch inside a card, with counts and a dot. */
export const Segmented_: Story = { name: 'Segmented', render: () => <SegmentedDemo /> }
/** `fill`: the full width on phones. */
export const SegmentedFill: Story = { render: () => <SegmentedDemo fill /> }
