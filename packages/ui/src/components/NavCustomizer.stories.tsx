import { Button } from '@mantine/core'
import { IconAdjustments, IconDots, IconHome, IconKey, IconNetwork, IconServer, IconSettings, IconUser, IconUsers } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { NavPrefs, NavSection } from '../navPrefs'
import { AppShell } from './AppShell'
import { NavCustomizer, useCustomNav } from './NavCustomizer'
import { PageHead } from './PageHead'

const meta: Meta = { title: 'Shell/Customise sidebar', parameters: { layout: 'fullscreen' } }
export default meta

const sections: NavSection[] = [
  { id: 'top', items: [{ id: 'home', label: 'Overview', href: '#', icon: <IconHome size={18} />, active: true }] },
  { id: 'inventory', label: 'Inventory', items: [
    { id: 'hosts', label: 'Hosts', href: '#', icon: <IconServer size={18} />, badge: 48 },
    { id: 'networks', label: 'Networks', href: '#', icon: <IconNetwork size={18} /> },
  ] },
  { id: 'admin', label: 'Admin', items: [
    { id: 'users', label: 'Users', href: '#', icon: <IconUsers size={18} /> },
    { id: 'keys', label: 'API keys', href: '#', icon: <IconKey size={18} /> },
    { id: 'settings', label: 'Settings', href: '#', icon: <IconSettings size={18} /> },
  ] },
  { id: 'me', label: 'Account', locked: true, items: [{ id: 'profile', label: 'Profile', href: '#', icon: <IconUser size={18} /> }] },
]

function Demo({ initial, open = false, categories = true }: { initial: NavPrefs; open?: boolean; categories?: boolean }) {
  // An app keeps the prefs on the account or in localStorage; here they live in state.
  const [prefs, setPrefs] = useState<NavPrefs>(initial)
  const [opened, setOpened] = useState(open)
  const { nav, more } = useCustomNav(sections, prefs)
  // The app shows what was put away behind a "More" link (or on a page of cards).
  const shown = more.length ? [...nav, { id: 'more', items: [{ id: 'more', label: 'More', href: '#', icon: <IconDots size={18} />, badge: more.length }] }] : nav
  return (
    <div style={{ margin: -24 }}>
      <AppShell brand={<strong>BitsAndBricks</strong>} nav={shown}
        navFooter={<Button variant="subtle" color="gray" size="xs" leftSection={<IconAdjustments size={16} />} onClick={() => setOpened(true)}>Customise sidebar</Button>}>
        <PageHead title="Overview" desc="Pin, put away and move entries in the dialog; the sidebar follows at once." />
        <NavCustomizer opened={opened} onClose={() => setOpened(false)} sections={sections} prefs={prefs} onChange={setPrefs} categories={categories} />
      </AppShell>
    </div>
  )
}

const customised: NavPrefs = { pinned: ['hosts'], hidden: ['keys'], categories: [{ id: 'c1', label: 'Daily' }], sections: { users: 'c1' } }

/** The dialog on its own. Over AppShell, Mantine's modal header counts as a second banner landmark in
 *  jsdom's axe run, so the shell stories open it from their button instead. */
function Dialog({ categories = true }: { categories?: boolean }) {
  const [prefs, setPrefs] = useState<NavPrefs>(customised)
  return <NavCustomizer opened onClose={() => {}} sections={sections} prefs={prefs} onChange={setPrefs} categories={categories} />
}

export const Customised: StoryObj = { name: 'Dialog: favourites, a category, More', render: () => <Dialog /> }
export const PinsOnly: StoryObj = { name: 'Dialog: pins and order only', render: () => <Dialog categories={false} /> }
export const InShell: StoryObj = { name: 'In the shell', render: () => <Demo initial={customised} /> }
export const Closed: StoryObj = { name: 'Sidebar only', render: () => <Demo initial={{ pinned: ['networks', 'settings'], labels: { admin: 'Setup' } }} /> }
