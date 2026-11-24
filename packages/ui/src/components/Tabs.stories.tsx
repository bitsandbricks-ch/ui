import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PageTabs } from './Tabs'

const meta: Meta = { title: 'Components/Tabs' }
export default meta
type Story = StoryObj

const halls = Array.from({ length: 14 }, (_, i) => ({
  id: `h${i + 1}`, label: `Hall ${i + 1}`, count: 20 + i,
  alert: i === 3 ? 'down' as const : i === 8 ? 'warn' as const : null,
}))

/** More tabs than fit: the row scrolls sideways, and a tab that needs a look shows a bit. */
function ManyHalls() {
  const [active, setActive] = useState('h1')
  return <div style={{ maxWidth: 560 }}><PageTabs label="Halls" tabs={halls} active={active} onChange={setActive} /></div>
}

export const ManyTabs: Story = { render: () => <ManyHalls /> }
