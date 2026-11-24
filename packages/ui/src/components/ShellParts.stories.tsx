import { IconMapPin } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { ScopeSwitcher } from './ScopeSwitcher'
import { StatusLine } from './StatusLine'

const meta: Meta = { title: 'Shell/Parts' }
export default meta

export const Crumbs: StoryObj = {
  name: 'Breadcrumbs',
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Breadcrumbs items={[{ label: 'Inventory' }, { label: 'Hosts', href: '#' }, { label: 'web-01.zh.example.net' }]} />
    </div>
  ),
}

function Switcher() {
  const [site, setSite] = useState('')
  return (
    <div style={{ width: 240 }}>
      <ScopeSwitcher label="Site" value={site} onChange={setSite} icon={<IconMapPin size={16} />} allLabel="All sites"
        options={[{ value: 'zh', label: 'Zürich', description: '31 hosts' }, { value: 'be', label: 'Bern', description: '17 hosts' }]} />
    </div>
  )
}

export const Scope: StoryObj = { name: 'Scope switcher', render: () => <Switcher /> }

export const Status: StoryObj = {
  name: 'Status line',
  render: () => (
    <footer className="bnb-status">
      <StatusLine end={<><a href="#">Docs</a><span>v1.2.0</span></>} items={[
        { id: 'live', label: 'live', tone: 'ok', title: 'Changes show as they happen' },
        { id: 'zh', label: 'zh 4f2a1c synced 3 min ago', href: '#', hideOnPhone: true },
        { id: 'agents', label: 'agents 12/14', tone: 'warn', href: '#', hideOnPhone: true },
      ]} />
    </footer>
  ),
}
