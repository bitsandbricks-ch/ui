import { Button, Card as MCard, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconRefresh, IconServer } from '@tabler/icons-react'
import {
  Card, DangerZone, DetailList, ItemPage, PageTabs, StatusBadge, Steps, Timeline, toastDone, toastWorking, UsageBar, useT, type Step,
} from '@bitsandbricks/ui'
import { QrCode } from '@bitsandbricks/ui/qr'
import { useState } from 'react'
import { ago, hostById } from '../data'
import { go, href } from '../router'
import { texts } from '../texts'

export function Host({ id }: { id: string }) {
  const { t } = useT(texts)
  const host = hostById(id)
  const [tab, setTab] = useState('overview')
  const steps: Step[] = [
    { id: 'plan', label: t('rollout.plan'), state: 'done', detail: t('time.minAgo', { n: 40 }) },
    { id: 'review', label: t('rollout.review'), state: 'done', detail: t('rollout.approvals') },
    { id: 'apply', label: t('rollout.apply'), state: host?.state === 'down' ? 'failed' : 'current' },
    { id: 'verify', label: t('rollout.verify'), state: 'todo' },
  ]
  return (
    <ItemPage title={host?.name} back={{ href: href('/hosts'), label: t('nav.hosts') }} icon={<IconServer size={22} />}
      eyebrow={host && `${host.role} · ${t(`zone.${host.zone}`)}`} desc={host && t('host.desc', { owners: host.owners.join(', ') })}
      missing={host ? null : { title: t('host.missing'), desc: t('host.missingDesc') }}
      actions={host && (
        <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={() => {
          const job = toastWorking(t('host.checking', { host: host.name }))
          setTimeout(() => job.done(t('host.checked')), 1200)
        }}>{t('host.check')}</Button>
      )}>
      {host && (
        <>
          <PageTabs active={tab} onChange={setTab} tabs={[
            { id: 'overview', label: t('tab.overview') },
            { id: 'activity', label: t('tab.activity'), count: 4 },
            { id: 'settings', label: t('tab.settings'), alert: host.state === 'down' ? 'down' : null },
          ]} />
          {tab === 'overview' && (
            <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
              <Card title={t('host.now')} actions={<StatusBadge state={host.state} />}>
                <DetailList items={[
                  { id: 'load', label: t('host.load'), value: <UsageBar value={host.load} label={t('host.load')} /> },
                  { id: 'disk', label: t('host.disk'), value: <UsageBar value={host.disk} label={t('host.disk')} /> },
                  { id: 'address', label: t('host.address'), value: host.address, mono: true },
                  { id: 'seen', label: t('host.seen'), value: t('time.minAgo', { n: host.seen }) },
                ]} />
              </Card>
              <Card title={t('rollout.title')} desc={t('rollout.desc')}>
                <Steps label={t('rollout.title')} steps={steps} />
              </Card>
              <Card title={t('host.qr')} desc={t('host.qrDesc')}>
                <Group align="center" wrap="nowrap">
                  <QrCode value={`https://example.com/hosts/${host.id}`} size={120} />
                  <Text size="sm" c="dimmed">example.com/hosts/{host.id}</Text>
                </Group>
              </Card>
            </SimpleGrid>
          )}
          {tab === 'activity' && (
            <Stack mt="md">
              <Timeline events={[
                { id: 'a1', at: ago(3), what: t('event.checked'), source: 'monitor', tone: host.state === 'down' ? 'err' : 'ok' },
                { id: 'a2', at: ago(40), what: t('event.deploy', { version: '2.14.0' }), who: host.owners[0], source: 'deploy' },
                { id: 'a3', at: ago(60 * 26), what: t('event.restart'), who: host.owners.at(-1), source: 'deploy' },
                { id: 'a4', at: ago(60 * 24 * 9), what: t('event.added', { host: host.name }), who: 'Finn', source: 'deploy', tone: 'ok' },
              ]} sources={{ monitor: t('source.monitor'), deploy: t('source.deploy') }} />
            </Stack>
          )}
          {tab === 'settings' && (
            <Stack mt="md">
              <MCard withBorder radius="lg">
                <Text size="sm">{t('host.settingsNote')}</Text>
              </MCard>
              <DangerZone label={t('host.remove')} question={t('host.removeAsk', { host: host.name })} desc={t('host.removeDesc')}
                onConfirm={() => { toastDone(t('host.removed', { host: host.name })); go('/hosts') }} />
            </Stack>
          )}
        </>
      )}
    </ItemPage>
  )
}
