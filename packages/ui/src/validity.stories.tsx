import { Button, Stack, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useValidityText } from './validity'

const meta: Meta = { title: 'Components/Inputs/Field messages' }
export default meta

/** Press "Save" with the fields as they are: the browser's bubble speaks the app's language
 *  (switch the story to German to see it). */
export const FieldMessages: StoryObj = {
  render: function Render() {
    useValidityText()
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <Stack maw={360} gap="sm">
          <TextInput label="Name" required />
          <TextInput label="Email" type="email" defaultValue="not an address" />
          <TextInput label="Seats" type="number" min={2} defaultValue={1} />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    )
  },
}
