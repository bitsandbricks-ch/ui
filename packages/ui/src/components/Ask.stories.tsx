import { Button, Group, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useChoose, usePrompt, useTell } from './useConfirm'

const meta: Meta = { title: 'Feedback/Choose, prompt, tell' }
export default meta

function Demo() {
  const choose = useChoose()
  const prompt = usePrompt()
  const tell = useTell()
  const [answer, setAnswer] = useState('')
  return (
    <>
      <Group gap="xs">
        <Button onClick={async () => setAnswer(String(await choose({ title: 'Bump web: version.txt says 1.2.3', choices: [
          { value: 'patch', label: 'Patch → 1.2.4', key: 'p', hint: 'fixes', group: 'Next version' },
          { value: 'minor', label: 'Minor → 1.3.0', key: 'm', hint: 'new features', group: 'Next version' },
          { value: 'major', label: 'Major → 2.0.0', key: 'M', hint: 'breaking changes', group: 'Next version' },
          { value: 'other', label: 'Another version…', key: 'v' },
        ] })))}>Choose</Button>
        <Button variant="default" onClick={async () => setAnswer(String(await prompt({ title: 'Save this view as', placeholder: 'Hosts in Zurich' })))}>Prompt</Button>
        <Button variant="default" onClick={async () => { await tell({ title: 'Revoke it at GitHub',
          body: 'The token here is deleted, but only GitHub can revoke it.',
          links: [{ href: 'https://github.com/settings/applications', label: 'GitHub › Applications' }] }); setAnswer('told') }}>Tell</Button>
      </Group>
      {answer && <Text size="sm" c="dimmed" mt="sm">Answer: {answer}</Text>}
    </>
  )
}

export const Questions: StoryObj = { render: () => <Demo /> }
