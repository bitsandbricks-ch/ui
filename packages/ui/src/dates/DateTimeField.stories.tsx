import { Code, Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DateTimeField } from './DateTimeField'

const meta: Meta<typeof DateTimeField> = {
  title: 'Dates/DateTimeField',
  component: DateTimeField,
  args: { label: 'Starts', defaultTime: '18:00' },
}
export default meta
type Story = StoryObj<typeof DateTimeField>

function Controlled(props: Parameters<typeof DateTimeField>[0]) {
  const [value, setValue] = useState('2026-11-14T18:00')
  return (
    <Stack maw={320}>
      <DateTimeField {...props} value={value} onChange={setValue} />
      <Code>{value || '(empty)'}</Code>
    </Stack>
  )
}

/** Type "14.11. 18" or paste "Sat 14.11.2026, 18:00", or open the calendar. */
export const Default: Story = { render: (args) => <Controlled {...args} /> }

export const Empty: Story = { args: { description: 'Leave it empty when nobody knows yet.' } }

export const Required: Story = { args: { required: true, quickTimes: false, defaultValue: '2026-12-31T23:59' } }

export const WithError: Story = { args: { defaultValue: '2026-11-14T18:00', error: 'Must be after the start' } }
