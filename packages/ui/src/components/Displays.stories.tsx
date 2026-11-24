import type { Meta, StoryObj } from '@storybook/react-vite'
import { AttentionList } from './AttentionList'
import { DetailItem, DetailList } from './DetailList'
import { Card } from './feedback'
import { StateStrip, type StateCell } from './StateStrip'
import { StatusBadge } from './StatusBadge'
import { Steps } from './Steps'
import { UsageBar } from './UsageBar'

const meta: Meta = { title: 'Displays' }
export default meta

export const Details: StoryObj = {
  name: 'Detail list',
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <Card title="web-01">
        <DetailList columns={3} items={[
          { id: 'ip', label: 'Address', value: '192.0.2.10', mono: true, hint: 'from DHCP' },
          { id: 'os', label: 'System', value: 'Debian 13' },
          { id: 'owner', label: 'Owner', value: null },
        ]}>
          <DetailItem label="State"><StatusBadge state="degraded" /></DetailItem>
          <DetailItem label="Notes" wide value="Moved to rack B in March; the old cable is still labelled A-12." />
        </DetailList>
      </Card>
      <Card title="Inline">
        <DetailList layout="inline" items={[
          { id: 'email', label: 'Email', value: 'anna@example.ch' },
          { id: 'phone', label: 'Phone', value: '+41 44 000 00 00', mono: true },
          { id: 'since', label: 'Member since', value: '2019' },
        ]} />
      </Card>
    </div>
  ),
}

export const Usage: StoryObj = {
  name: 'Usage bar',
  render: () => (
    <div style={{ display: 'grid', gap: 10, width: 160 }}>
      <UsageBar value={32} label="CPU" />
      <UsageBar value={78} label="Memory" />
      <UsageBar value={94} label="Disk" />
      <UsageBar value={null} label="Disk" />
    </div>
  ),
}

const hours: StateCell[] = Array.from({ length: 48 }, (_, i) => ({
  tone: i < 6 ? 'none' : i === 30 || i === 31 ? 'err' : i === 40 ? 'off' : 'ok',
  title: `${47 - i} h ago`,
}))

export const Strip: StoryObj = {
  name: 'State strip',
  render: () => <div style={{ maxWidth: 480 }}><StateStrip cells={hours} label="2 hours with an outage in the last 48 hours" /></div>,
}

export const Stepper: StoryObj = {
  name: 'Steps',
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 680 }}>
      <Steps label="Where this change stands" steps={[
        { id: 'plan', label: 'Plan', state: 'done', detail: '5 min ago' },
        { id: 'review', label: 'Review', state: 'done', detail: '2 approvals' },
        { id: 'apply', label: 'Apply', state: 'current', detail: 'applying…' },
        { id: 'verify', label: 'Verify', state: 'todo' },
      ]} />
      <Steps label="Where this change stands" steps={[
        { id: 'plan', label: 'Plan', state: 'done', detail: '1 h ago' },
        { id: 'review', label: 'Review', state: 'done', detail: 'approved' },
        { id: 'apply', label: 'Apply', state: 'failed', detail: 'failed' },
        { id: 'verify', label: 'Verify', state: 'skipped' },
      ]} />
    </div>
  ),
}

export const Attention: StoryObj = {
  name: 'Attention list',
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <Card title="Needs attention" padded={false}>
        <AttentionList items={[
          { id: 'u', tone: 'info', title: '3 unknown devices on the network', detail: 'seen by discovery', action: { label: 'Add to inventory', href: '#' } },
          { id: 'j', tone: 'err', title: 'Backup failed', detail: 'restic · nas-01', time: '12 min ago', action: { label: 'Open log', href: '#' } },
          { id: 's', tone: 'warn', title: '4 security updates waiting', detail: '2 hosts, 1 needs a reboot', action: { label: 'Plan patch run', onClick: () => {} } },
        ]} />
      </Card>
      <Card title="All good" padded={false}><AttentionList items={[]} /></Card>
    </div>
  ),
}
