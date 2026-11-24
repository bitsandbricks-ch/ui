import { Button } from '@mantine/core'
import { IconPlus, IconServer } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ConfirmButton, ConfirmIcon } from './Confirm'
import { DataTable, type DataColumn } from './DataTable'
import { Card, EmptyState, ErrorBanner, LoadingState } from './feedback'
import { FilterBar, type FilterGroup } from './FilterBar'
import { PageHead } from './PageHead'
import { Pager } from './Pager'
import { PanelField, PanelSection, SidePanel } from './SidePanel'
import { StatGrid, StatTile } from './StatTile'
import { StatusBadge, StatusBit } from './StatusBadge'
import { PageTabs } from './Tabs'
import { ThemeSwitch, ThemeToggle } from './ThemeSwitch'
import { toastDone, toastFailed } from '../toast'
import { useFilters } from '../useFilters'

const meta: Meta = { title: 'Components' }
export default meta
type Story = StoryObj

export const Head: Story = {
  render: () => (
    <PageHead eyebrow="Inventory" title="Hosts" desc="Every machine in the lab, with its zone and address."
      icon={<IconServer size={20} />} actions={<><Button variant="default">Import</Button><Button leftSection={<IconPlus size={16} />}>Add host</Button></>} />
  ),
}

export const Stats: Story = {
  render: () => (
    <StatGrid>
      <StatTile label="Hosts" value={48} sub="6 zones" />
      <StatTile label="Online" value={44} of={48} tone="ok" trend={[40, 41, 43, 42, 44]} change={{ value: 2, goodWhen: 'up' }} />
      <StatTile label="Needs a look" value={3} tone="warn" />
      <StatTile label="Down" value={1} tone="err" change={{ value: 1, goodWhen: 'down', since: 'since 07:24' }} href="#" />
    </StatGrid>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {(['online', 'paid', 'degraded', 'due', 'offline', 'overdue', 'unknown', 'draft'] as const).map((s) => <StatusBadge key={s} state={s} />)}
      <StatusBadge state="failed" label="3 failed" />
      <StatusBit state="up" /> <StatusBit state="warn" /> <StatusBit state="down" />
    </div>
  ),
}

type Host = { id: string; name: string; zone: string; ip: string; state: 'online' | 'offline' | 'degraded' }
const hosts: Host[] = Array.from({ length: 64 }, (_, i) => ({
  id: String(i), name: `host-${i + 1}`, zone: ['lab', 'iot', 'dmz', 'mgmt'][i % 4], ip: `198.51.100.${i + 10}`,
  state: i % 11 === 0 ? 'offline' : i % 7 === 0 ? 'degraded' : 'online',
}))
const columns: DataColumn<Host>[] = [
  { id: 'name', header: 'Name', sort: (h) => h.name, cell: (h) => h.name, card: 'inline' },
  { id: 'state', header: 'State', sort: (h) => h.state, cell: (h) => <StatusBadge state={h.state} />, card: 'inline' },
  { id: 'zone', header: 'Zone', sort: (h) => h.zone, cell: (h) => h.zone, card: 'label' },
  { id: 'ip', header: 'Address', sort: (h) => h.ip, cell: (h) => h.ip, mono: true, hideOnPhone: true },
  { id: 'del', header: '', cell: (h) => <ConfirmIcon label={`Delete ${h.name}`} onConfirm={() => toastDone(`${h.name} deleted`)}>×</ConfirmIcon>, card: 'actions', width: 44 },
]

function HostList({ layout }: { layout: 'menus' | 'panel' }) {
  const f = useFilters({ zone: 'all', state: 'all' })
  const [open, setOpen] = useState<Host | null>(null)
  const zone: FilterGroup['options'] = ['all', 'lab', 'iot', 'dmz', 'mgmt'].map((z) => ({ value: z, label: z === 'all' ? 'All' : z, count: z === 'all' ? hosts.length : hosts.filter((h) => h.zone === z).length }))
  const rows = hosts.filter((h) => (f.values.zone === 'all' || h.zone === f.values.zone) && (f.values.state === 'all' || h.state === f.values.state) && h.name.includes(f.search))
  return (
    <>
      <FilterBar layout={layout} search={f.search} onSearchChange={f.setSearch} onClear={f.clear} searchLabel="Find a host"
        groups={f.groups([
          { key: 'zone', label: 'Zone', options: zone },
          { key: 'state', label: 'State', options: [{ value: 'all', label: 'All' }, { value: 'online', label: 'Online' }, { value: 'degraded', label: 'Degraded' }, { value: 'offline', label: 'Offline' }] },
        ])}
        actions={<Button variant="default">Export</Button>} />
      <DataTable label="Hosts" rows={rows} columns={columns} rowKey={(h) => h.id} defaultSort={{ id: 'name' }} pageSize={20} cards
        onRowClick={setOpen} count={(n) => `${n} hosts`}
        empty={<EmptyState title="No host matches" description="Change the filters or clear them." />} />
      {open && (
        <SidePanel title={open.name} eyebrow={open.zone} href={`#/hosts/${open.id}`} onClose={() => setOpen(null)} padded={false}
          actions={<StatusBadge state={open.state} />}>
          <PanelSection label="Facts">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <PanelField label="Address">{open.ip}</PanelField>
              <PanelField label="Zone">{open.zone}</PanelField>
            </div>
          </PanelSection>
          <PanelSection label="Actions" border={false}>
            <ConfirmButton label="Reboot" danger onConfirm={() => toastFailed(new Error('The agent did not answer.'))} />
          </PanelSection>
        </SidePanel>
      )}
    </>
  )
}

export const TableWithMenus: Story = { name: 'Table, filters as menus', render: () => <HostList layout="menus" /> }
export const TableWithPanel: Story = { name: 'Table, filters in a panel', render: () => <HostList layout="panel" /> }

export const ServerPaging: Story = {
  render: function Render() {
    const [page, setPage] = useState(2)
    const [perPage, setPerPage] = useState(25)
    return <Card padded={false}><Pager page={page} perPage={perPage} total={312} onPage={setPage} onPerPage={setPerPage} /></Card>
  },
}

export const Feedback: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="Empty"><EmptyState title="No backups yet" description="Backups run every night at 02:00." action={{ label: 'Run one now', onClick: () => toastDone('Backup started') }} /></Card>
      <ErrorBanner title="Couldn't load the hosts" message="The server answered 502." onRetry={() => {}} />
      <Card title="Loading"><LoadingState lines={4} /></Card>
      <LoadingState compact />
      <LoadingState rows={2} />
      <ErrorBanner error={new Error('The server answered 502.')} />
    </div>
  ),
}

export const Tabs: Story = {
  render: function Render() {
    const [tab, setTab] = useState('hosts')
    const [sub, setSub] = useState('all')
    return (
      <>
        <PageTabs active={tab} onChange={setTab} tabs={[{ id: 'hosts', label: 'Hosts', count: 48 }, { id: 'networks', label: 'Networks' }, { id: 'zones', label: 'Zones' }]} />
        <PageTabs sub label="Show" active={sub} onChange={setSub} tabs={[{ id: 'all', label: 'All' }, { id: 'mine', label: 'Mine' }]} />
      </>
    )
  },
}

export const Theme: Story = {
  render: () => <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><ThemeSwitch /><ThemeToggle /></div>,
}
