import { Button, Text } from '@mantine/core'
import { IconPlayerPlay, IconPlus } from '@tabler/icons-react'
import {
  CopyText, DataTable, DetailList, EmptyState, FilterBar, NoMatches, PageHead, PanelSection, SidePanel, StatusBadge, toastWorking,
  UsageBar, useConfirm, useT, type DataColumn, type FilterGroup,
} from '@bitsandbricks/ui'
import { useMemo, useState } from 'react'
import { hosts, type Host } from '../data'
import { go, href } from '../router'
import { texts } from '../texts'

export function Hosts() {
  const { t } = useT(texts)
  const confirm = useConfirm()
  const [search, setSearch] = useState('')
  const [state, setState] = useState('all')
  const [zone, setZone] = useState('all')
  const [picked, setPicked] = useState<string[]>([])
  const [open, setOpen] = useState<string | null>(null)

  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const rows = hosts.filter((h) => (state === 'all' || h.state === state) && (zone === 'all' || h.zone === zone)
    && words.every((w) => `${h.name} ${h.address} ${h.owners.join(' ')}`.toLowerCase().includes(w)))
  const count = (f: (h: Host) => boolean) => hosts.filter(f).length

  const groups: FilterGroup[] = [
    { key: 'state', label: t('host.state'), value: state, defaultValue: 'all', onChange: setState, options: [
      { value: 'all', label: t('filter.all') },
      ...(['up', 'degraded', 'down'] as const).map((s) => ({ value: s, label: t(`state.${s}`), count: count((h) => h.state === s) })),
    ] },
    { key: 'zone', label: t('host.zone'), value: zone, defaultValue: 'all', onChange: setZone, options: [
      { value: 'all', label: t('filter.all') },
      ...(['zurich', 'geneva', 'basel'] as const).map((z) => ({ value: z, label: t(`zone.${z}`), count: count((h) => h.zone === z) })),
    ] },
  ]
  const clear = () => { setSearch(''); setState('all'); setZone('all') }

  const columns: DataColumn<Host>[] = useMemo(() => [
    { id: 'name', header: t('host.name'), sort: (h) => h.name, cell: (h) => h.name, mono: true },
    { id: 'state', header: t('host.state'), sort: (h) => h.state, cell: (h) => <StatusBadge state={h.state} />, text: (h) => h.state, card: 'inline' },
    { id: 'zone', header: t('host.zone'), sort: (h) => h.zone, cell: (h) => t(`zone.${h.zone}`), hideOnPhone: true },
    { id: 'address', header: t('host.address'), cell: (h) => <CopyText text={h.address} />, text: (h) => h.address, hideOnPhone: true },
    { id: 'load', header: t('host.load'), sort: (h) => h.load, cell: (h) => <UsageBar value={h.load} label={t('host.load')} />, numeric: true, descFirst: true, card: 'label' },
    { id: 'disk', header: t('host.disk'), sort: (h) => h.disk, cell: (h) => <UsageBar value={h.disk} label={t('host.disk')} />, numeric: true, descFirst: true, hideOnPhone: true },
  ], [t])

  const restart = async () => {
    const names = hosts.filter((h) => picked.includes(h.id)).map((h) => h.name)
    if (!await confirm({ title: t('hosts.restartAsk', { n: names.length }), body: names.join(', '), confirmLabel: t('hosts.restart') })) return
    const job = toastWorking(t('hosts.restarting', { n: names.length }))
    setTimeout(() => { job.done(t('hosts.restarted', { n: names.length })); setPicked([]) }, 1400)
  }

  const index = rows.findIndex((h) => h.id === open)
  const current = index >= 0 ? rows[index] : null
  return (
    <>
      <PageHead title={t('nav.hosts')} desc={t('hosts.desc')}
        actions={(
          <>
            {picked.length > 0 && <Button variant="default" leftSection={<IconPlayerPlay size={16} />} onClick={restart}>{t('hosts.restartN', { n: picked.length })}</Button>}
            <Button leftSection={<IconPlus size={16} />} onClick={() => go('/forms')}>{t('hosts.add')}</Button>
          </>
        )} />
      <FilterBar search={search} onSearchChange={setSearch} searchLabel={t('hosts.search')} groups={groups} onClear={clear} />
      <DataTable label={t('nav.hosts')} rows={rows} columns={columns} rowKey={(h) => h.id} defaultSort={{ id: 'name' }} urlState={false}
        pageSize={12} cards count={(n) => t('hosts.count', { n })} exportName="hosts"
        selected={open} onSelect={setOpen} onRowClick={(h) => setOpen(h.id)}
        picked={picked} onPick={setPicked} rowLabel={(h) => h.name} isNew={(h) => h.name === 'queue-07'}
        empty={hosts.length ? <NoMatches filters={[search, state !== 'all' ? t(`state.${state}`) : '', zone !== 'all' ? t(`zone.${zone}`) : ''].filter(Boolean)} onClear={clear} />
          : <EmptyState title={t('hosts.none')} />} />
      {current && (
        <SidePanel opened onClose={() => setOpen(null)} title={current.name} eyebrow={`${current.role} · ${t(`zone.${current.zone}`)}`}
          href={href(`/hosts/${current.id}`)} padded={false} resizable={{ storageKey: 'demo-host-panel' }}
          onPrev={index > 0 ? () => setOpen(rows[index - 1].id) : undefined}
          onNext={index < rows.length - 1 ? () => setOpen(rows[index + 1].id) : undefined}>
          <PanelSection label={t('host.now')} right={<StatusBadge state={current.state} />}>
            <DetailList items={[
              { id: 'load', label: t('host.load'), value: <UsageBar value={current.load} label={t('host.load')} /> },
              { id: 'disk', label: t('host.disk'), value: <UsageBar value={current.disk} label={t('host.disk')} /> },
              { id: 'address', label: t('host.address'), value: <CopyText text={current.address} />, mono: true },
              { id: 'seen', label: t('host.seen'), value: t('time.minAgo', { n: current.seen }) },
            ]} />
          </PanelSection>
          <PanelSection label={t('host.owners')} border={false}>
            <Text size="sm">{current.owners.join(", ")}</Text>
          </PanelSection>
        </SidePanel>
      )}
    </>
  )
}
