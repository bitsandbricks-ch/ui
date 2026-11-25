import { Button, Group, Paper, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { CopyField } from './CopyField'
import { texts } from './OneTimeSecret.texts'

/** A new token, key or enrolment code, shown once right after it is made: a warning that it won't
 *  be shown again, the value with Copy, and a button to close it. The server keeps only a hash, so
 *  the page drops the value on `onDone`. From Floorbit's API tokens page. */
export function OneTimeSecret({ secret, label, title, children, onDone, doneLabel }: {
  secret: string
  /** What the value is ("API token for grafana"). */
  label?: ReactNode
  title?: ReactNode
  /** How to use it, under the value (a header to send, a command to run). */
  children?: ReactNode
  onDone: () => void
  doneLabel?: ReactNode
}) {
  const { t } = useT(texts)
  return (
    <Paper withBorder radius="lg" p="md" className="bnb-secret" role="region" aria-label={typeof title === 'string' ? title : t('secret.title')}>
      <Stack gap="sm">
        <Group gap={8} wrap="nowrap" align="flex-start">
          <IconAlertTriangle size={18} aria-hidden="true" className="bnb-secret-icon" />
          <div>
            <Text fw={600}>{title ?? t('secret.title')}</Text>
            <Text size="sm" c="dimmed">{t('secret.once')}</Text>
          </div>
        </Group>
        <CopyField value={secret} label={label ?? t('secret.label')} />
        {children && <Text size="sm" component="div">{children}</Text>}
        <Group justify="flex-end">
          <Button onClick={onDone}>{doneLabel ?? t('secret.done')}</Button>
        </Group>
      </Stack>
    </Paper>
  )
}
