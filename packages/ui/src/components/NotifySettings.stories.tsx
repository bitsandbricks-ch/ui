import { Button } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { createBrowserNotify } from '../notify'
import { NotifySettings } from './NotifySettings'

const meta: Meta = { title: 'Components/NotifySettings' }
export default meta
type Story = StoryObj

const kinds = [
  { id: 'jobs', label: 'A job sent to me', urgent: true },
  { id: 'incidents', label: 'New incidents' },
  { id: 'switches', label: 'A switch going down' },
]

function Settings({ seed }: { seed: object }) {
  // A key of its own per story, seeded, so the story always opens the same way.
  const [store] = useState(() => {
    const key = `bnb-notify-story-${Object.keys(seed).join('-') || 'off'}`
    try { localStorage.setItem(key, JSON.stringify(seed)) } catch { /* storage blocked */ }
    return createBrowserNotify(key)
  })
  const [open, setOpen] = useState(true)
  return <>
    <Button onClick={() => setOpen(true)}>Notifications</Button>
    <NotifySettings store={store} kinds={kinds} opened={open} onClose={() => setOpen(false)} />
  </>
}

/** Off: the kinds wait until it is switched on (which asks the browser first). */
export const Off: Story = { render: () => <Settings seed={{}} /> }

/** On, with quiet hours: urgent kinds can still come through. */
export const QuietHours: Story = {
  render: () => <Settings seed={{ on: true, quiet: true, kinds: { switches: false } }} />,
}
