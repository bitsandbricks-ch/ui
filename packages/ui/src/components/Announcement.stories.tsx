import { Group } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AnnouncementBadge, AnnouncementEditor, type Announcement } from './Announcement'

const meta: Meta = { title: 'Components/Announcement' }
export default meta
type Story = StoryObj

const at = new Date('2026-03-16T09:45:00+01:00').getTime()

/** New announcements are tinted by their level; once read, an outline. The phone shows only the icon. */
export const Badges: Story = {
  render: () => (
    <Group gap="sm" style={{ justifyContent: 'flex-end', maxWidth: 720 }}>
      <AnnouncementBadge storageKey="story-info" notice={{ text: 'Doors open at 18:00, crew briefing at 17:30', level: 'info', at, by: 'Mike' }} />
      <AnnouncementBadge storageKey="story-warn" notice={{ text: 'Hall B power off at 22:00', level: 'warn', at, by: 'Mike', until: at + 4 * 3600000 }} />
      <AnnouncementBadge storageKey="story-compact" compact notice={{ text: 'Hall B power off at 22:00', level: 'warn', at }} />
    </Group>
  ),
}

function Editing() {
  const [notice, setNotice] = useState<Announcement | null>({ text: 'Hall B power off at 22:00', level: 'warn', at, by: 'Mike' })
  const [open, setOpen] = useState(true)
  return <>
    <AnnouncementBadge storageKey="story-edit" notice={notice} onEdit={() => setOpen(true)} onTakeDown={() => setNotice(null)} />
    <AnnouncementEditor opened={open} current={notice} onClose={() => setOpen(false)} onTakeDown={() => { setNotice(null); setOpen(false) }}
      onSave={(d) => { setNotice({ text: d.text, level: d.level, at: Date.now(), by: 'Mike' }); setOpen(false) }} />
  </>
}

/** Someone allowed to puts one up, changes it or takes it down. */
export const Editor: Story = { render: () => <Editing /> }
