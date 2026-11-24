import { Alert, Button, Center, Group, Loader, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconAlertTriangle, IconInbox, IconRefresh } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../i18n'

// The states every list and page has: nothing yet, loading, failed (handbook: UI rules).

/** Nothing to show yet: an icon, one line, and the next step. */
export function EmptyState({ icon, title, description, action, compact }: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** The next step: a button's label and what it does, or any node (a link). */
  action?: { label: string; onClick: () => void } | ReactNode
  /** Less room above and below, inside a card or a pane. */
  compact?: boolean
}) {
  const button = action && typeof action === 'object' && 'label' in action && 'onClick' in action
    ? <Button mt="sm" onClick={action.onClick}>{action.label}</Button>
    : action
  return (
    <Center py={compact ? 24 : 56} px="md" className="bnb-empty">
      <Stack align="center" gap={6}>
        <ThemeIcon size={compact ? 40 : 52} radius="xl" variant="light" color="accent" mb={6}>
          {icon ?? <IconInbox size={compact ? 20 : 24} />}
        </ThemeIcon>
        <Text fw={650} fz="md" ta="center">{title}</Text>
        {description && <Text size="sm" c="dimmed" maw={420} ta="center">{description}</Text>}
        {button}
      </Stack>
    </Center>
  )
}

/** Something failed: the reason, and "Try again" when it can be retried. */
export function ErrorBanner({ message, title, onRetry, onDismiss, retryLabel }: {
  message: ReactNode
  title?: ReactNode
  onRetry?: () => void
  onDismiss?: () => void
  retryLabel?: string
}) {
  const { t } = useT()
  return (
    <Alert color="err" variant="light" icon={<IconAlertTriangle size={16} />} my="md" title={title} role="alert"
      withCloseButton={!!onDismiss} onClose={onDismiss} closeButtonLabel={t('common.close')}>
      <Group gap="xs" align="center">
        <Text size="sm" flex={1}>{message}</Text>
        {onRetry && (
          <Button variant="subtle" size="xs" color="err" leftSection={<IconRefresh size={16} />} onClick={onRetry}>
            {retryLabel ?? t('common.retry')}
          </Button>
        )}
      </Group>
    </Alert>
  )
}

/** Loading: a spinner with a line, or grey lines where a list will be (`lines`). */
export function LoadingState({ message, lines, compact }: { message?: ReactNode; lines?: boolean | number; compact?: boolean }) {
  const { t } = useT()
  if (lines) {
    const n = typeof lines === 'number' ? lines : 3
    return (
      <Stack gap={8} aria-busy="true" aria-label={t('common.loading')} role="status">
        {Array.from({ length: n }, (_, i) => <Skeleton key={i} height={14} width={`${90 - i * 12}%`} radius="sm" />)}
      </Stack>
    )
  }
  return (
    <Center mih={compact ? 120 : 240} role="status" aria-live="polite">
      <Stack align="center" gap="xs">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">{message ?? t('common.loading')}</Text>
      </Stack>
    </Center>
  )
}

/** The bordered card every list and form sits in, with an optional header row. */
export function Card({ title, actions, children, padded = true, style }: {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  padded?: boolean
  style?: CSSProperties
}) {
  return (
    <Paper withBorder className="bnb-card" style={{ overflow: 'hidden', ...style }}>
      {(title || actions) && (
        <Group justify="space-between" align="center" gap="sm" className="bnb-card-head" wrap="wrap">
          {title && <Text fw={650} fz="md">{title}</Text>}
          {actions}
        </Group>
      )}
      <div className={padded ? 'bnb-card-body' : undefined}>{children}</div>
    </Paper>
  )
}
