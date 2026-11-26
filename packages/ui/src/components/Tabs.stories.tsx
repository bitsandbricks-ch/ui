import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LinkTabs, PageTabs } from './Tabs'

const meta: Meta = { title: 'Components/Tabs' }
export default meta
type Story = StoryObj

const halls = Array.from({ length: 14 }, (_, i) => ({
  id: `h${i + 1}`, label: `Hall ${i + 1}`, count: 20 + i,
  alert: i === 3 ? 'down' as const : i === 8 ? 'warn' as const : null,
}))

/** More tabs than fit: the ones that fit stay in the row, the rest go under More, and the active tab
 *  always stays visible. A tab that needs a look shows a bit. */
function ManyHalls() {
  const [active, setActive] = useState('h1')
  return <div style={{ maxWidth: 560 }}><PageTabs label="Halls" tabs={halls} active={active} onChange={setActive} /></div>
}

export const ManyTabs: Story = { render: () => <ManyHalls /> }

/** A phone's width: the same tabs, three in the row and the rest under More. */
function PhoneHalls() {
  const [active, setActive] = useState('h9')
  return <div style={{ width: 360, border: '1px dashed var(--bnb-line)' }}><PageTabs label="Halls" tabs={halls} active={active} onChange={setActive} /></div>
}

export const PhoneWidth: Story = { render: () => <PhoneHalls /> }

const helpdesk = [
  { id: 'problems', label: 'Problems', href: '#problems', count: 4, alert: 'warn' as const },
  { id: 'incidents', label: 'Incidents', href: '#incidents', count: 1 },
  { id: 'jobs', label: 'My jobs', href: '#jobs' },
  { id: 'handover', label: 'Handover', href: '#handover' },
  { id: 'drafts', label: 'Status updates', href: '#drafts', hidden: 'Only leads see this for now' },
]

/** Each tab is its own page with its own address: links, so a tab opens in a new browser tab too. */
export const Links: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <LinkTabs label="Helpdesk" tabs={helpdesk} active="problems" />
      <LinkTabs label="Problems" sub active="open" tabs={[
        { id: 'open', label: 'Open', href: '#open', count: 4 },
        { id: 'muted', label: 'Muted', href: '#muted' },
        { id: 'closed', label: 'Closed', href: '#closed' },
      ]} />
    </div>
  ),
}
