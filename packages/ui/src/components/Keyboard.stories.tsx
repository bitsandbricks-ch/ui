import { Button, Group, Kbd, Stack, Text } from '@mantine/core'
import { IconFile, IconMoon, IconServer } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useKeys, useModKey } from '../keys'
import { JumpBox, type JumpItem } from './JumpBox'
import { KeysSheet } from './KeysSheet'

const meta: Meta = { title: 'Keyboard' }
export default meta

const items: JumpItem[] = [
  { id: 'p:overview', label: 'Overview', kind: 'page', href: '#overview', icon: <IconFile size={14} /> },
  { id: 'p:hosts', label: 'Hosts', hint: 'every machine', kind: 'page', href: '#hosts', icon: <IconFile size={14} /> },
  { id: 'p:settings', label: 'Settings', kind: 'page', href: '#settings', icon: <IconFile size={14} /> },
  ...['web-1', 'web-2', 'db-1', 'backup'].map((h) => ({ id: `h:${h}`, label: h, hint: 'zurich', kind: 'host', href: `#${h}`, icon: <IconServer size={14} /> })),
  { id: 'c:theme', label: 'Switch the theme', hint: 'now dark (t)', kind: 'command', run: () => {}, icon: <IconMoon size={14} /> },
]
const kinds = { page: 'Page', host: 'Host', command: 'Do' }

function Demo({ startOpen }: { startOpen?: 'jump' | 'keys' }) {
  const [jump, setJump] = useState(startOpen === 'jump')
  const [keys, setKeys] = useState(startOpen === 'keys')
  const [went, setWent] = useState('')
  useModKey('k', () => setJump((o) => !o))
  useKeys({ '?': () => setKeys(true), r: () => setWent('reloaded') })
  return (
    <main>
      <Stack gap="sm">
        <Text size="sm">Press <Kbd>ctrl</Kbd> <Kbd>k</Kbd> to jump, <Kbd>?</Kbd> for the keys.</Text>
        <Group gap="xs">
          <Button aria-keyshortcuts="r" onClick={() => setWent('reloaded')}>Reload</Button>
          <Button aria-keyshortcuts="n" variant="default" disabled>New host</Button>
          <Button variant="default" onClick={() => setJump(true)}>Jump to…</Button>
        </Group>
        {went && <Text size="sm" c="dimmed">Last: {went}</Text>}
      </Stack>
      <JumpBox opened={jump} onClose={() => setJump(false)} items={items} kinds={kinds}
        recent={[items[4]]} onNavigate={(href) => setWent(href)} />
      <KeysSheet opened={keys} onClose={() => setKeys(false)} everywhere={[
        { key: 'ctrl+k', label: 'Jump to a page, a host or a command' },
        { key: '?', label: 'These keys' },
      ]} />
    </main>
  )
}

export const JumpBoxOpen: StoryObj = { render: () => <Demo startOpen="jump" /> }
export const KeysSheetOpen: StoryObj = { render: () => <Demo startOpen="keys" /> }
export const Closed: StoryObj = { render: () => <Demo /> }
