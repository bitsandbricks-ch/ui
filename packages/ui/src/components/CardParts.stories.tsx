import { Button, SegmentedControl, Stack, Text, TextInput, Textarea } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CardGrid } from './CardGrid'
import { Card } from './feedback'
import { FormDialog } from './FormDialog'

const meta: Meta = { title: 'Components/Cards and form dialog' }
export default meta

/** A title with a line under it, a header row of its own, and cards side by side. */
export const Cards: StoryObj = {
  render: () => (
    <Stack gap="md">
      <Card title="Backups" desc="Every night at 02:00, kept for 30 days." actions={<Button size="xs" variant="default">Run now</Button>}>
        <Text size="sm">Last run 6 hours ago, 4.2 GB.</Text>
      </Card>
      <Card padded={false}>
        <Card.Header title="Members"><SegmentedControl size="xs" data={['Active', 'Left']} /></Card.Header>
        <Text size="sm" p="md">The list runs to the card's edges.</Text>
      </Card>
      <CardGrid>
        <Card title="Hosts"><Text size="sm">42</Text></Card>
        <Card title="Sites"><Text size="sm">3</Text></Card>
        <Card title="Alerts"><Text size="sm">None</Text></Card>
      </CardGrid>
    </Stack>
  ),
}

/** Enter in a field or the main button sends it. */
export const Dialog: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>New group</Button>
        <FormDialog open={open} onClose={() => setOpen(false)} title="New group" subtitle="Members can join it later."
          onSubmit={() => setOpen(false)}
          footer={<><Button variant="default" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create</Button></>}>
          <TextInput label="Name" data-autofocus />
          <Textarea label="About" rows={2} />
        </FormDialog>
      </>
    )
  },
}
