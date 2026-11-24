import { Stack, Title } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NestedBars, NestedColumns } from './NestedCharts'

const meta: Meta = { title: 'Widgets/Nested charts' }
export default meta

const months = ['Dez', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov']
const usage = months.map((m, i) => ({
  key: m, label: m, title: `${m} 2026`,
  values: [40 + i * 4, 12 + Math.round(Math.abs(Math.sin(i)) * 30)],
  note: i === 7 ? 'Summer LAN' : undefined,
}))
const weeks = Array.from({ length: 30 }, (_, i) => ({ key: `w${i}`, label: `${(i % 28) + 1}.`, title: `Week ${i + 1}`, values: [5 + Math.round(Math.abs(Math.cos(i / 3)) * 20)] }))

const events = [
  { id: '1', label: 'Winter LAN', sub: 'Sa 14.02.2026', values: [24, 21, 17] },
  { id: '2', label: 'Spring LAN with a rather long name', sub: 'Sa 18.04.2026', values: [26, 18, 15] },
  { id: '3', label: 'Summer LAN', sub: 'Fr 07.08.2026', values: [30, 27, 25] },
  { id: '4', label: 'Autumn LAN', sub: 'Sa 28.11.2026 · upcoming', values: [31, 12, 9] },
].map((e) => ({ ...e, href: `#/events/${e.id}` }))

export const Columns: StoryObj = {
  render: () => (
    <Stack gap="xl" maw={720}>
      <Title order={4}>Two series: accounts, active</Title>
      <NestedColumns series={['Accounts', 'Active']} columns={usage} />
      <Title order={4}>One series, 30 weeks (every third label, scrolls on phones)</Title>
      <NestedColumns series={['Sign-ins']} columns={weeks} height={140} />
    </Stack>
  ),
}

export const Bars: StoryObj = {
  render: () => (
    <Stack maw={720}>
      <NestedBars series={['Asked', 'Answered', 'Came']} rows={events} foot="The table below has every number." />
    </Stack>
  ),
}
