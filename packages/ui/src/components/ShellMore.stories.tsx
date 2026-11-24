import { Button, Group, Stack, Text } from '@mantine/core'
import { IconGitPullRequest, IconHome, IconPlayerPlay, IconServer, IconSettings } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { SavedView } from '../savedViews'
import { PhoneDock } from './PhoneDock'
import { SaveViewButton } from './SaveViewButton'
import { PanelField, PanelSection, SidePanel } from './SidePanel'
import { ThemeSwitch } from './ThemeSwitch'

const meta: Meta = { title: 'Shell/More' }
export default meta

const dock = [
  { id: 'home', label: 'Overview', href: '#', icon: <IconHome size={20} /> },
  { id: 'hosts', label: 'Hosts', href: '#', icon: <IconServer size={20} />, active: true, badge: 3 },
  { id: 'prs', label: 'PRs', href: '#', icon: <IconGitPullRequest size={20} /> },
  { id: 'runs', label: 'Runs', href: '#', icon: <IconPlayerPlay size={20} /> },
]

/** Phone width only (the bar hides on wider screens): switch the viewport to a phone. */
export const PhoneBar: StoryObj = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <>
      <Text size="sm">The bar sits at the bottom on a phone. "More" opens every page and the theme.</Text>
      <PhoneDock items={dock} more={[{ items: dock }, { label: 'Setup', items: [{ id: 'settings', label: 'Settings', href: '#', icon: <IconSettings size={18} /> }] }]}
        moreFooter={<ThemeSwitch />} />
    </>
  ),
}

export const SaveView: StoryObj = {
  render: function Render() {
    const [views, setViews] = useState<SavedView[]>([{ name: 'Zurich', path: '/hosts?zone=zurich' }])
    const [path, setPath] = useState('/hosts?state=down')
    return (
      <Stack gap="sm">
        <Group gap="xs">
          <Text size="sm">This page: <code>{path}</code></Text>
          <SaveViewButton views={views} path={path} suggest="Hosts · down" onChange={setViews} />
        </Group>
        <Group gap="xs">{views.map((v) => <Button key={v.path} size="xs" variant="default" onClick={() => setPath(v.path)}>★ {v.name}</Button>)}</Group>
      </Stack>
    )
  },
}

/** Drag the left edge (or focus it and press ← →); the width stays in this browser. */
export const ResizablePanel: StoryObj = {
  render: function Render() {
    const hosts = ['web-1', 'web-2', 'db-1']
    const [at, setAt] = useState(0)
    return (
      <SidePanel title={hosts[at]} eyebrow="Host" subtitle="zurich" onClose={() => {}} resizable={{ storageKey: 'story-side-width' }}
        onPrev={at > 0 ? () => setAt(at - 1) : undefined} onNext={at < hosts.length - 1 ? () => setAt(at + 1) : undefined}
        copyHref={`https://app.example/hosts/${hosts[at]}`} href="#">
        <PanelSection label="Details"><PanelField label="Address">198.51.100.{at + 10}</PanelField></PanelSection>
      </SidePanel>
    )
  },
}
