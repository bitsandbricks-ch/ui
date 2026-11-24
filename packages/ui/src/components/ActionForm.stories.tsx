import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionForm } from './ActionForm'
import { Notice } from './Notice'

const meta: Meta = { title: 'Components/Actions' }
export default meta
type Story = StoryObj

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** A form that toasts how its action ended. Type "taken" to see a failure keep what you typed. */
export const Form: Story = {
  render: () => (
    <ActionForm style={{ maxWidth: 360 }} action={async (form) => {
      await wait(400)
      return form.get('name') === 'taken' ? { error: 'That name is taken.' } : { ok: true }
    }}>
      <Stack>
        <TextInput name="name" label="Clan name" defaultValue="Bits" />
        <Group><Button type="submit">Save</Button></Group>
      </Stack>
    </ActionForm>
  ),
}

/** Asks first, for a step that can't be undone. */
export const WithConfirm: Story = {
  render: () => (
    <ActionForm action={() => wait(300)} done="deleted"
      confirm={{ title: 'Delete the event?', body: 'Everyone who answered gets a mail.', confirmLabel: 'Delete' }}>
      <Button type="submit" color="err" variant="light">Delete event</Button>
    </ActionForm>
  ),
}

/** Saves each toggle as it changes, without a Save button. */
export const AutoSave: Story = {
  render: () => (
    <ActionForm action={() => wait(200)} auto="toggles">
      <Stack gap="xs">
        <Checkbox name="mail" label="Mail me about new events" defaultChecked />
        <Checkbox name="remind" label="Remind me a day before" />
      </Stack>
    </ActionForm>
  ),
}

/** Lines that stay above a page: info, warn and err. */
export const Notices: Story = {
  render: () => (
    <Stack maw={560}>
      <Notice>Seats open on Friday at 18:00.</Notice>
      <Notice tone="warn" title="Tickets sell out soon" onClose={() => {}}>Only 4 tickets are left on the organiser's site.</Notice>
      <Notice tone="err">This event was cancelled by the organiser.</Notice>
    </Stack>
  ),
}
