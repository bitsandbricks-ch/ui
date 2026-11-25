import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterBar, pickedValues, type FilterGroup } from './FilterBar'

const meta: Meta = { title: 'Lists/Filter bar, several choices' }
export default meta
type Story = StoryObj

const kinds = ['Security', 'Service', 'Power', 'Seats', 'Check-in', 'Link', 'Wi-Fi', 'Log', 'IP range', 'Duplex']
const counts = [3, 3, 2, 19, 9, 2, 1, 5, 18, 1]

function Problems({ layout }: { layout: 'menus' | 'panel' }) {
  const [type, setType] = useState('security,service')
  const [level, setLevel] = useState('all')
  const groups: FilterGroup[] = [
    { key: 'type', label: 'Type', value: type, defaultValue: '', onChange: setType, multiple: true,
      options: kinds.map((k, i) => ({ value: k.toLowerCase(), label: k, count: counts[i] })) },
    { key: 'level', label: 'Severity', value: level, defaultValue: 'all', onChange: setLevel,
      options: [{ value: 'all', label: 'All' }, { value: 'down', label: 'Down' }, { value: 'warn', label: 'To look at' }] },
  ]
  return (
    <>
      <FilterBar layout={layout} groups={groups} search="" onSearchChange={() => {}} searchLabel="Search problems" />
      <p>Picked: {pickedValues(groups[0]).join(', ') || 'every type'}</p>
    </>
  )
}

export const Menus: Story = { name: 'As menus', render: () => <Problems layout="menus" /> }
export const Panel: Story = { name: 'In a panel', render: () => <Problems layout="panel" /> }
