import { Button, Group, Stack, Switch, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SidePanel, type SidePanelMode } from './SidePanel'

const meta: Meta = { title: 'Side panel in an editor' }
export default meta

const cards = ['Switches', 'Seats online', 'Bandwidth', 'Incidents', 'Agents', 'Traffic']

/** An editor's settings panel: floating over the canvas while something is picked (the canvas stays
 *  usable), or docked beside it. A sheet from below on phones. */
export const Editor: StoryObj = {
  render: function Editor() {
    const [mode, setMode] = useState<Exclude<SidePanelMode, 'drawer'>>('float')
    const [picked, setPicked] = useState<string | null>('Switches')
    const opened = mode === 'dock' || !!picked
    return (
      <div style={{ display: 'flex', height: 520, border: '1px solid var(--bnb-line)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative', padding: 12, background: 'var(--bnb-bg)' }}>
          <Group gap="sm" mb="sm">
            <Button size="xs" variant="default" onClick={() => setMode(mode === 'float' ? 'dock' : 'float')}>
              {mode === 'float' ? 'Dock the panel' : 'Float the panel'}
            </Button>
          </Group>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {cards.map((c) => (
              <button key={c} type="button" onClick={() => setPicked(c)}
                style={{ height: 110, textAlign: 'left', padding: 10, borderRadius: 8, border: `2px solid ${picked === c ? 'var(--bnb-accent)' : 'var(--bnb-line)'}`, background: 'var(--bnb-surface)', color: 'inherit' }}>
                {c}
              </button>
            ))}
          </div>
          {mode === 'float' && (
            <SidePanel mode="float" opened={opened} width={340} eyebrow="Widget settings" title={picked ?? ''} resizable onClose={() => setPicked(null)}>
              <Stack gap="sm"><TextInput label="Title" placeholder="From the tile" /><Switch label="Hide the title" /></Stack>
            </SidePanel>
          )}
        </div>
        {mode === 'dock' && (
          <SidePanel mode="dock" width={340} eyebrow="Widget settings" title={picked ?? 'Pick a widget'} resizable onClose={() => setPicked(null)}>
            <Stack gap="sm"><TextInput label="Title" placeholder="From the tile" /><Switch label="Hide the title" /></Stack>
          </SidePanel>
        )}
      </div>
    )
  },
}
