import { Button } from '@mantine/core'
import { IconBell, IconHome, IconNetwork, IconServer, IconSettings, IconStar } from '@tabler/icons-react'
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'
import { Breadcrumbs } from './Breadcrumbs'
import { PageHead } from './PageHead'
import { StatGrid, StatTile } from './StatTile'
import { StatusLine } from './StatusLine'
import { ThemeSwitch } from './ThemeSwitch'

const meta: Meta = { title: 'Shell', parameters: { layout: 'fullscreen' } }
export default meta

const nav = [
  { items: [{ id: 'home', label: 'Overview', href: '#', icon: <IconHome size={18} />, active: true }] },
  { label: 'Inventory', items: [
    { id: 'hosts', label: 'Hosts', href: '#', icon: <IconServer size={18} />, badge: 48 },
    { id: 'networks', label: 'Networks', href: '#', icon: <IconNetwork size={18} /> },
  ] },
  { label: 'Admin', items: [{ id: 'settings', label: 'Settings', href: '#', icon: <IconSettings size={18} /> }] },
]

function Page({ actionsInTopBar }: { actionsInTopBar?: boolean }) {
  return (
    <div style={{ margin: -24 }}>
      <AppShell brand={<strong>BitsAndBricks</strong>} nav={nav} title={<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Overview' }]} />} actionsInTopBar={actionsInTopBar}
        navFooter={<ThemeSwitch />} topBarEnd={<IconBell size={18} aria-label="Notifications" />}
        status={<StatusLine items={[{ id: 'hosts', label: 'All 48 hosts answer', tone: 'ok' }]} end="v0.1.0" />}>
        <PageHead title="Overview" desc="What runs, what needs a look." actions={<Button>Plan changes</Button>} />
        <StatGrid>
          <StatTile label="Hosts" value={48} />
          <StatTile label="Online" value={44} of={48} tone="ok" />
          <StatTile label="Needs a look" value={3} tone="warn" />
          <StatTile label="Down" value={1} tone="err" />
        </StatGrid>
      </AppShell>
    </div>
  )
}

export const Frame: StoryObj = { render: () => <Page /> }
export const ActionsInTopBar: StoryObj = { name: 'Buttons in the top bar', render: () => <Page actionsInTopBar /> }

function Folding() {
  const [folded, setFolded] = useState(false)
  const [open, setOpen] = useState(true)
  const groups = [
    { items: [{ id: 'home', label: 'Overview', href: '#', icon: <IconHome size={18} />, active: true }] },
    { id: 'inventory', label: 'Inventory', collapsible: true, open, onToggle: () => setOpen((o) => !o), items: [
      { id: 'hosts', label: 'Hosts', href: '#', icon: <IconServer size={18} />, badge: 48,
        action: <Button size="compact-xs" variant="subtle" aria-label="Pin Hosts"><IconStar size={14} /></Button> },
      { id: 'networks', label: 'Networks', href: '#', icon: <IconNetwork size={18} /> },
    ] },
    { label: 'Admin', items: [{ id: 'settings', label: 'Settings', href: '#', icon: <IconSettings size={18} /> }] },
  ]
  return (
    <div style={{ margin: -24 }}>
      <AppShell brand={<strong>{folded ? 'B' : 'BitsAndBricks'}</strong>} nav={groups} folded={folded} onFoldedChange={setFolded}
        navTop={folded ? null : <Button variant="default" size="xs" fullWidth>Scope: Spring event</Button>} navFooter={folded ? null : <ThemeSwitch />}
        title="Overview">
        <PageHead title="Overview" desc="Fold the sidebar from its foot, and the Inventory group from its heading." />
      </AppShell>
    </div>
  )
}

export const FoldingSidebar: StoryObj = { name: 'Folding sidebar', render: () => <Folding /> }
