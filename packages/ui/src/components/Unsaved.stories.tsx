import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useConfirmLeave, useDraft, useHasUnsaved, useUnsaved } from '../unsaved'
import { Card } from './feedback'

const meta: Meta = { title: 'Feedback/Unsaved changes' }
export default meta

function Editor() {
  const [saved, setSaved] = useState('web-01')
  const [name, setName] = useState(saved)
  const dirty = name !== saved
  const draft = useDraft('story:host', name, { dirty, apply: setName })
  const save = () => { setSaved(name); draft.clear() }
  useUnsaved(dirty, { what: 'your changes to the host', onSave: save, draft: true })
  const confirmLeave = useConfirmLeave()
  const unsaved = useHasUnsaved()
  const [left, setLeft] = useState('')
  return (
    <Card title="Edit host" style={{ maxWidth: 440 }}>
      <Stack>
        {draft.offer && (
          <Alert color="info" variant="light">
            <Group justify="space-between">
              <Text size="sm">An unsaved draft from {new Date(draft.offer.at).toLocaleString()}.</Text>
              <Group gap="xs"><Button size="xs" onClick={draft.restore}>Restore</Button><Button size="xs" variant="default" onClick={draft.discard}>Discard</Button></Group>
            </Group>
          </Alert>
        )}
        <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} description="Change it, then press Ctrl S, or Leave." />
        <Group>
          <Button disabled={!dirty} onClick={save}>Save</Button>
          <Button variant="default" onClick={async () => setLeft((await confirmLeave()) ? 'left the page' : 'stayed')}>Leave{unsaved ? ' (unsaved)' : ''}</Button>
          {left && <Text size="sm" c="dimmed">You {left}.</Text>}
        </Group>
      </Stack>
    </Card>
  )
}

export const Guard: StoryObj = { name: 'Guard and draft', render: () => <Editor /> }
