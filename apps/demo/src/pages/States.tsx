import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconServerOff } from '@tabler/icons-react'
import {
  Card, EmptyState, ErrorBanner, LoadingState, NoMatches, Notice, OfflineBanner, PageHead, StatusBadge, STATE_TONE, useT, type State,
} from '@bitsandbricks/ui'
import { useState } from 'react'
import { texts } from '../texts'

const SHOWN: State[] = ['up', 'running', 'paid', 'degraded', 'pending', 'stale', 'down', 'failed', 'overdue', 'unknown', 'draft', 'ended']

export function States() {
  const { t } = useT(texts)
  const [retryAt, setRetryAt] = useState(() => Date.now() + 12_000)
  return (
    <>
      <PageHead title={t('nav.states')} desc={t('states.desc')} />
      <Stack>
        <Notice tone="info" title={t('states.infoTitle')}>{t('states.info')}</Notice>
        <Notice tone="warn">{t('states.warn')}</Notice>
        <Card title={t('states.words')} desc={t('states.wordsDesc')}>
          <Group gap={8}>{SHOWN.map((s) => <StatusBadge key={s} state={s} />)}</Group>
          <Text size="xs" c="dimmed" mt="sm">{t('states.wordCount', { n: Object.keys(STATE_TONE).length })}</Text>
        </Card>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card title={t('states.empty')}>
            <EmptyState icon={<IconServerOff size={28} />} title={t('hosts.none')} description={t('states.emptyDesc')}
              action={{ label: t('hosts.add'), onClick: () => { window.location.hash = '/forms' } }} />
          </Card>
          <Card title={t('states.loading')}>
            <LoadingState lines={4} />
          </Card>
          <Card title={t('states.noMatches')}>
            <NoMatches filters={[t('state.down'), t('zone.basel')]} onClear={() => {}} />
          </Card>
          <Card title={t('states.error')}>
            <ErrorBanner message={t('states.errorText')} onRetry={() => {}} details={'GET /api/hosts: HTTP 503\nupstream timed out after 10 s'} mb={0} />
          </Card>
        </SimpleGrid>
        <Card title={t('states.offline')} desc={t('states.offlineDesc')} padded={false}>
          <OfflineBanner retryAt={retryAt} onRetry={() => setRetryAt(Date.now() + 12_000)} />
        </Card>
        <Group><Button variant="default" onClick={() => setRetryAt(Date.now() + 12_000)}>{t('states.retry')}</Button></Group>
      </Stack>
    </>
  )
}
