import { Group, Paper, SimpleGrid, Switch, Text, Title } from '@mantine/core'
import { IconServer } from '@tabler/icons-react'
import { DashboardGrid, flowGrid, PageHead, StatGrid, StatTile, Timeline, useT, type GridBox, type TimelineEvent } from '@bitsandbricks/ui'
import { FitWidget, TileCard, TimeChart, type KindPick } from '@bitsandbricks/widgets'
import { useMemo, useState } from 'react'
import { ago, counts, NOW, widgets } from '../data'
import { href } from '../router'
import { texts } from '../texts'

type Pane = GridBox & { id: string; widget: string; pick?: KindPick }

// One widget's data can be drawn several ways (`pick`); each pane picks how, and the widget picks
// how much detail fits the pane's size.
const START: Pane[] = flowGrid<Omit<Pane, "x" | "y">>([
  { id: 'clients', widget: 'clients', w: 3, h: 3 },
  { id: 'power', widget: 'power', pick: 'gauge', w: 3, h: 3 },
  { id: 'hosts', widget: 'hosts', w: 6, h: 3 },
  { id: 'uplink', widget: 'uplink', pick: 'graph', w: 8, h: 5 },
  { id: 'roles', widget: 'roles', pick: 'pie', w: 4, h: 5 },
  { id: 'zones', widget: 'zones', pick: 'bar', w: 4, h: 5 },
  { id: 'latency', widget: 'latency', pick: 'histogram', w: 4, h: 5 },
  { id: 'note', widget: 'note', w: 4, h: 5 },
], 12)

export function Overview() {
  const { t } = useT(texts)
  const [editing, setEditing] = useState(false)
  const [panes, setPanes] = useState(START)
  const data = useMemo(() => widgets(t), [t])
  const events: TimelineEvent[] = [
    { id: 'e1', at: ago(2), what: t('event.down', { host: 'cache-03' }), tone: 'err', source: 'monitor' },
    { id: 'e2', at: ago(14), what: t('event.deploy', { version: '2.14.0' }), who: 'Cleo', source: 'deploy', detail: t('event.deployDetail'), more: 'web-01 ✓\nweb-02 ✓\nweb-11 ✓\nweb-12 ✓' },
    { id: 'e3', at: ago(50), what: t('event.disk', { host: 'db-02' }), tone: 'warn', source: 'monitor' },
    { id: 'e4', at: ago(180), what: t('event.added', { host: 'queue-07' }), who: 'Finn', source: 'deploy', tone: 'ok' },
  ]
  return (
    <>
      <PageHead title={t('nav.overview')} desc={t('overview.desc')}
        actions={<Switch label={t('overview.edit')} checked={editing} onChange={(e) => setEditing(e.currentTarget.checked)} />} />
      <StatGrid>
        <StatTile label={t('stat.hosts')} value={counts.all} icon={<IconServer size={18} />} href={href('/hosts')} trend={[30, 31, 31, 33, 34, 36]} trendLabel={t('stat.trend')} />
        <StatTile label={t('stat.up')} value={counts.up} of={counts.all} tone="ok" />
        <StatTile label={t('stat.degraded')} value={counts.degraded} tone="warn" change={{ value: 2, goodWhen: 'down', since: t('stat.since') }} />
        <StatTile label={t('stat.down')} value={counts.down} tone="err" change={{ value: -1, goodWhen: 'down', since: t('stat.since') }} />
      </StatGrid>

      <Group justify="space-between" mt="xl" mb="sm">
        <Title order={2} fz="lg">{t('overview.dashboard')}</Title>
        <Text size="sm" c="dimmed">{editing ? t('overview.editHint') : t('overview.fitHint')}</Text>
      </Group>
      <DashboardGrid items={panes} cols={12} itemKey={(p) => p.id} label={t('overview.dashboard')} onChange={editing ? setPanes : undefined}
        renderItem={(p) => (
          <Paper withBorder radius="lg" p="sm" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
            <Text fw={700} size="sm" truncate>{data[p.widget].label}</Text>
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}><FitWidget widget={data[p.widget]} pick={p.pick} /></div>
          </Paper>
        )} />

      <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl">
        <TileCard title={t('overview.memory')} from="db-02">
          <TimeChart label={t('overview.memory')} since={NOW - 3600} until={NOW}
            points={Array.from({ length: 60 }, (_, i) => [NOW - 3600 + i * 60, 3100 + ((i * 17) % 23) * 9 + (i > 45 ? 380 : 0)] as [number, number])}
            format={(v) => `${Math.round(v)} MB`} />
        </TileCard>
        <Timeline title={t('overview.history')} events={events} sources={{ monitor: t('source.monitor'), deploy: t('source.deploy') }} updatedAt={ago(0)} />
      </SimpleGrid>
    </>
  )
}
