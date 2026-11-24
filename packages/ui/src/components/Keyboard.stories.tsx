import { Button, Group, Kbd, Stack, Text } from '@mantine/core'
import { IconFile, IconLetterCase, IconMoon, IconPlus, IconServer } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { useKeys } from '../keys'
import { CommandPalette, createCommandPalette, type PaletteGroup } from '../spotlight/CommandPalette'
import { KeysSheet } from './KeysSheet'

const meta: Meta = { title: 'Keyboard' }
export default meta

const HOSTS = ['web-1', 'web-2', 'db-1', 'db-2', 'backup', 'mail']

function Demo({ start }: { start?: 'palette' | 'keys' }) {
  const [[store, palette]] = useState(() => createCommandPalette())
  const [keys, setKeys] = useState(start === 'keys')
  const [last, setLast] = useState('')
  const [dark, setDark] = useState(false)
  useKeys({ '?': () => setKeys(true), r: () => setLast('reloaded') })
  const groups: PaletteGroup[] = [
    { id: 'pages', label: 'Pages', items: ['Overview', 'Hosts', 'Settings'].map((p) => ({ id: p, label: p, href: `#${p}`, icon: <IconFile size={16} /> })) },
    { id: 'create', label: 'Create', commands: true, items: [{ id: 'new-host', label: 'New host', icon: <IconPlus size={16} />, onSelect: () => setLast('new host') }] },
    { id: 'appearance', label: 'Appearance', commands: true, items: [
      { id: 'theme', label: 'Switch the theme', description: `now ${dark ? 'dark' : 'light'}`, keywords: ['dark', 'light', 'night'], icon: <IconMoon size={16} />, onSelect: () => setDark((d) => !d) },
      { id: 'text', label: 'Bigger text', keywords: ['font', 'size', 'zoom'], icon: <IconLetterCase size={16} />, onSelect: () => setLast('bigger text') },
    ] },
  ]
  // The app's own search, slow on purpose: hosts matching the query.
  const search = (q: string, signal: AbortSignal) => new Promise<PaletteGroup[]>((resolve) => {
    const timer = setTimeout(() => resolve([{ id: 'hosts', label: 'Hosts', items: HOSTS.filter((h) => h.includes(q.toLowerCase()))
      .map((h) => ({ id: h, label: h, description: 'zurich', href: `#${h}`, icon: <IconServer size={16} /> })) }]), 600)
    signal.addEventListener('abort', () => clearTimeout(timer))
  })
  useEffect(() => { if (start === 'palette') palette.open() }, [start, palette])
  return (
    <main>
      <Stack gap="sm">
        <Text size="sm">Press <Kbd>ctrl</Kbd> <Kbd>k</Kbd> or <Kbd>/</Kbd> to jump, <Kbd>?</Kbd> for the keys. Type <Kbd>&gt;</Kbd> first for commands only.</Text>
        <Group gap="xs">
          <Button aria-keyshortcuts="r" onClick={() => setLast('reloaded')}>Reload</Button>
          <Button aria-keyshortcuts="n" variant="default" disabled>New host</Button>
          <Button variant="default" onClick={palette.open}>Jump to…</Button>
        </Group>
        {last && <Text size="sm" c="dimmed">Last: {last}</Text>}
      </Stack>
      <CommandPalette store={store} groups={groups} search={search} recent={[{ id: 'web-2', label: 'web-2', description: 'zurich', href: '#web-2', icon: <IconServer size={16} /> }]}
        onNavigate={(href) => setLast(href)} />
      <KeysSheet opened={keys} onClose={() => setKeys(false)} everywhere={[
        { key: 'ctrl+k', label: 'Jump to a page, a host or a command' },
        { key: '/', label: 'The same' },
        { key: '?', label: 'These keys' },
      ]} />
    </main>
  )
}

export const CommandPaletteOpen: StoryObj = { render: () => <Demo start="palette" /> }
export const KeysSheetOpen: StoryObj = { render: () => <Demo start="keys" /> }
export const Closed: StoryObj = { render: () => <Demo /> }
