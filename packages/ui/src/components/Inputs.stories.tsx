import { Avatar, Stack, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CopyField } from './CopyField'
import { Fold } from './Fold'
import { MultiPick, type MultiPickOption } from './MultiPick'
import { ShareButton } from './ShareButton'

const meta: Meta = { title: 'Components/Inputs' }
export default meta
type Story = StoryObj

/** A value to paste elsewhere, with a Copy button. */
export const Copy: Story = {
  name: 'CopyField',
  render: () => (
    <Stack maw={420}>
      <CopyField label="Invite link" description="Anyone with the link can join the clan." value="https://example.com/join/8f3k2q" />
    </Stack>
  ),
}

/** The share sheet on phones, copy with a toast on desktop. */
export const Share: Story = {
  name: 'ShareButton',
  render: () => (
    <Stack align="flex-start">
      <ShareButton url="https://example.com/events/42" title="Winter LAN" text="Coming along?" />
      <ShareButton url="https://example.com/events/42" title="Winter LAN" iconOnly />
    </Stack>
  ),
}

const names = ['Anna', 'Ben', 'Cleo', 'Dario', 'Elif', 'Finn', 'Gina']
const people: MultiPickOption[] = names.map((n, i) => ({
  value: n.toLowerCase(), label: n, hint: i === 1 ? 'not coming' : undefined,
  icon: <Avatar size={22} radius="xl" color="initials" name={n} />,
}))

function Picker() {
  const [value, setValue] = useState<string[]>(['anna', 'cleo'])
  return (
    <Stack maw={420}>
      <MultiPick label="Drivers" name="driver" options={people} value={value} onChange={setValue}
        presets={[{ label: 'Everyone coming', values: people.filter((p) => !p.hint).map((p) => p.value) }, { label: 'Nobody', values: [] }]} />
      <Text size="sm" c="dimmed">Posts: {value.join(', ') || '(nothing)'}</Text>
    </Stack>
  )
}

/** Several people from a searchable list, with quick picks. */
export const Pick: Story = { name: 'MultiPick', render: () => <Picker /> }

/** Remembers that it was opened, across reloads. */
export const Folded: Story = {
  name: 'Fold',
  render: () => (
    <Stack maw={520}>
      <Fold storageKey="story-fold-packing" summary={<>Packing list <Text span c="dimmed" size="sm">12 items</Text></>}>
        <Text size="sm">Cable, mouse, headset, power strip…</Text>
      </Fold>
      <Fold storageKey="story-fold-seats" summary="Seat plan" open>
        <Text size="sm">Forced open while it is in use.</Text>
      </Fold>
    </Stack>
  ),
}
