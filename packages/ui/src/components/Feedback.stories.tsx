import { Button, Group, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CopyText } from './CopyText'
import { useConfirm } from './useConfirm'

const meta: Meta = { title: 'Feedback/Ask and copy' }
export default meta

function Ask() {
  const confirm = useConfirm()
  const [answer, setAnswer] = useState('')
  return (
    <Group>
      <Button color="err" onClick={async () => setAnswer(String(await confirm({ title: 'Delete web-01?', body: 'Its addresses go back to the pool. This cannot be undone.', confirmLabel: 'Delete' })))}>
        Delete web-01
      </Button>
      <Button variant="default" onClick={async () => setAnswer(String(await confirm({ title: 'Leave without saving?', body: 'Your changes stay as a draft in this browser.', confirmLabel: 'Leave', tone: 'accent' })))}>
        Leave
      </Button>
      {answer && <Text size="sm" c="dimmed">Answer: {answer}</Text>}
    </Group>
  )
}

export const Confirm: StoryObj = { name: 'useConfirm', render: () => <Ask /> }

export const Copy: StoryObj = {
  name: 'Copy text',
  render: () => (
    <Text size="sm">Address <CopyText text="192.0.2.10" />, token <CopyText text="tok_4f2a1c9e">tok_4f2a…</CopyText></Text>
  ),
}
