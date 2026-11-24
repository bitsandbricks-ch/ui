import { Button, Group, Text } from '@mantine/core'
import { IconBellOff } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { NotificationDetail, NotificationLink, NotificationLinks, NotificationsBell, NotificationsPanel, NotificationTag, type NotificationItem } from './Notifications'
import { PanelField, PanelSection } from './SidePanel'

const meta: Meta = { title: 'Shell/Notifications', parameters: { layout: 'fullscreen' } }
export default meta

const items: NotificationItem[] = [
  { id: 'd1', state: 'down', group: 'down', title: 'sw-c-02 is offline', where: 'Hall C · row 4', time: '2 min ago' },
  { id: 'd2', state: 'down', group: 'down', title: 'Uplink to core-1 lost', where: 'Hall A · sw-a-01 port 48', time: '9 min ago' },
  { id: 'w1', state: 'warn', group: 'warn', title: 'Circuit B close to its limit', where: 'Hall B · 14.2 of 16 A', time: '21 min ago' },
  { id: 'w2', state: 'warn', group: 'warn', title: 'Backup is 2 days old', where: 'nas-01', time: '1 h ago' },
  { id: 's1', state: 'warn', group: 'seats', title: 'Seat A-6 runs at half duplex', where: 'Hall A · sw-a-03 port 6' },
  { id: 's2', state: 'warn', group: 'seats', title: 'Seat C-12 port flaps', where: 'Hall C · sw-c-01 port 12' },
]
const filters = [{ value: 'down', label: 'Down' }, { value: 'warn', label: 'Warnings' }, { value: 'seats', label: 'Seats and ports' }]

function Detail({ item }: { item: NotificationItem }) {
  return (
    <NotificationDetail state={item.state} tags={<NotificationTag>{item.group === 'seats' ? 'Port' : 'Switch'}</NotificationTag>}
      time={item.time} title={item.title} where={item.where}
      actions={<>
        <NotificationLink href={`#/problems/${item.id}`} size="xs" variant="default">Open problem</NotificationLink>
        <Button size="xs" variant="default" leftSection={<IconBellOff size={14} aria-hidden="true" />}>Mute</Button>
      </>}>
      <PanelSection label="What and where">
        <PanelField label="Since">{item.time ?? 'a while'}</PanelField>
        <PanelField label="Place">{item.where}</PanelField>
      </PanelSection>
      <NotificationLinks links={[{ href: '#/plan', label: 'Show on the hall plan' }, { href: '#/switches', label: 'Open the switch' }]} />
    </NotificationDetail>
  )
}

/** The bell in the top bar, and its panel: the list with filters and search, the picked one's
 *  details beside it. ↑ ↓ in the header step through the list. On phones the details replace the
 *  list until "Back". */
export const Panel: StoryObj = {
  render: function Panel() {
    const [open, setOpen] = useState(true)
    return (
      <Group p="md" justify="flex-end">
        <NotificationsBell count={items.length} alarm onClick={() => setOpen(true)} />
        {open && (
          <NotificationsPanel items={items} filters={filters} onClose={() => setOpen(false)} eyebrow="Checked 1 min ago · 6 open"
            allHref="#/problems" allLabel="All problems" onSettings={() => {}}
            renderDetail={(item) => <Detail item={item} />} />
        )}
      </Group>
    )
  },
}

/** Nothing open: the green bit and one line. The bell has no count. */
export const AllClear: StoryObj = {
  render: function AllClear() {
    const [open, setOpen] = useState(true)
    return (
      <Group p="md" justify="flex-end">
        <NotificationsBell onClick={() => setOpen(true)} />
        {open && <NotificationsPanel items={[]} onClose={() => setOpen(false)} width={440} />}
      </Group>
    )
  },
}

/** Bells: warnings only, something down, and the phone header's larger icon. */
export const Bells: StoryObj = {
  render: () => (
    <Group p="md" gap="lg">
      <NotificationsBell count={3} onClick={() => {}} />
      <NotificationsBell count={12} alarm onClick={() => {}} />
      <NotificationsBell count={120} alarm compact onClick={() => {}} />
      <Text size="sm" c="dimmed">Warnings in the warning colour, red when something is down.</Text>
    </Group>
  ),
}

/** The details while they load, and once the thing is over. */
export const DetailStates: StoryObj = {
  render: () => (
    <Group p="md" align="flex-start" grow>
      <div style={{ border: '1px solid var(--bnb-line)' }}><NotificationDetail loading /></div>
      <div style={{ border: '1px solid var(--bnb-line)' }}><NotificationDetail gone /></div>
    </Group>
  ),
}
