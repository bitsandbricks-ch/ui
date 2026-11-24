import { NumberInput, Select, Stack, Switch, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HelpTip } from './HelpTip'

const meta: Meta<typeof HelpTip> = { title: 'Help tip', component: HelpTip }
export default meta

/** Labels with a ? instead of a description line under each field. */
export const Fields: StoryObj = {
  render: () => (
    <Stack maw={360} gap="md">
      <TextInput label={<HelpTip label="Title" help="Optional. Plan panes name their hall and area by themselves." />} placeholder="From the tile" />
      <NumberInput label={<HelpTip label="Rotate halls every (seconds)" help="Plan panes showing a whole hall without a fixed hall switch to the next one." />} placeholder="Off" />
      <Select label={<HelpTip label="Time shown" help="Every graph that can, unless its pane picks its own. Viewers can change it for themselves." />}
        data={['Auto', 'Last hour', 'Last 24 hours']} defaultValue="Auto" />
      <Switch label={<HelpTip label="Sound for new problems" help="A short tone on full screen when something goes down and nobody has taken it yet." />} />
    </Stack>
  ),
}

/** The ? on its own, after any text. */
export const Alone: StoryObj = {
  render: () => <span>Drag by the handle, resize by the corner <HelpTip name="Editing" help="Arrows move the picked widget, Shift+arrows resize it." /></span>,
}
