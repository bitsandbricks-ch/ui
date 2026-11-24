import { Alert, Button, Center, Group, Loader, Paper, Skeleton, Stack, Text, ThemeIcon, type MantineSpacing } from '@mantine/core'
import { IconAlertTriangle, IconFilterOff, IconInbox, IconPlugConnectedX, IconRefresh } from '@tabler/icons-react'
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './feedback.texts'

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

/** Something failed: the reason, and "Try again" when it can be retried. Pass `error` straight from
 *  a query or mutation: without one the banner draws nothing, so pages need no guard. `details` is
 *  the raw text (what the server or a command said), behind a "Details" toggle under the plain words. */
export function ErrorBanner({ message, error, title, details, onRetry, onDismiss, retryLabel, mb }: {
  message?: ReactNode
  /** An Error or the server's words; shown as "Something went wrong: …". */
  error?: Error | string | null
  title?: ReactNode
  details?: string
  onRetry?: () => void
  onDismiss?: () => void
  retryLabel?: string
  /** Space below; the default is the page rhythm above and below. */
  mb?: MantineSpacing
}) {
  const { t } = useT(texts)
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const text = message ?? (error ? t('common.error', { message: typeof error === 'string' ? error : error.message }) : null)
  if (text == null) return null
  const more = !!details && details !== text
  return (
    <Alert color="err" variant="light" icon={<IconAlertTriangle size={16} />} my={mb === undefined ? 'md' : undefined} mb={mb}
      title={title} role="alert" withCloseButton={!!onDismiss} onClose={onDismiss} closeButtonLabel={t('common.close')}>
      <Group gap="xs" align="center">
        <Text size="sm" flex={1}>{text}</Text>
        {more && (
          <Button variant="subtle" size="xs" color="err" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen((o) => !o)}>
            {open ? t('common.hideDetails') : t('common.details')}
          </Button>
        )}
        {onRetry && (
          <Button variant="subtle" size="xs" color="err" leftSection={<IconRefresh size={16} />} onClick={onRetry}>
            {retryLabel ?? t('common.retry')}
          </Button>
        )}
      </Group>
      {more && open && <pre id={detailsId} className="bnb-error-details">{details}</pre>}
    </Alert>
  )
}

/** Loading: a spinner with a line, grey lines where a list will be (`lines`), or the shape of a
 *  page (`rows`: one tall block, then shorter ones) for apps that keep spinners inside buttons. */
export function LoadingState({ message, lines, rows, compact }: {
  message?: ReactNode
  lines?: boolean | number
  rows?: number
  compact?: boolean
}) {
  const { t } = useT(texts)
  if (lines) {
    const n = typeof lines === 'number' ? lines : (rows ?? 3)
    return (
      <Stack gap={8} aria-busy="true" aria-label={t('common.loading')} role="status">
        {Array.from({ length: n }, (_, i) => <Skeleton key={i} height={14} width={`${90 - (i % 3) * 12}%`} radius="sm" />)}
      </Stack>
    )
  }
  if (rows) {
    return (
      <Stack gap="sm" aria-busy="true" aria-label={t('common.loading')} role="status">
        {Array.from({ length: rows }, (_, i) => <Skeleton key={i} height={i === 0 ? 120 : 64} radius="lg" />)}
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

/** A filtered list that shows nothing. "Nothing here yet" was wrong when a filter hid the rows: it
 *  named the filters that are on and offers to clear them. From Mason.
 *  `filters`: the active filters in words ("state: closed", "mine"); empty ones are left out. */
export function NoMatches({ filters = [], onClear, compact }: {
  filters?: (string | false | null | undefined)[]
  onClear?: () => void
  compact?: boolean
}) {
  const { t } = useT(texts)
  const on = filters.filter(Boolean) as string[]
  return (
    <EmptyState compact={compact} icon={<IconFilterOff size={compact ? 20 : 24} />} title={t('filters.noMatches')}
      description={on.length ? t('filters.activeAre', { filters: on.join(' · ') }) : undefined}
      action={onClear ? { label: t('filters.clear'), onClick: onClear } : undefined} />
  )
}

/** How long to wait before the next try: 2s, 4s, 8s … up to 30s. */
export function nextRetryDelay(attempt: number) {
  return Math.min(30_000, 2000 * 2 ** Math.max(0, attempt))
}

/** The server doesn't answer: one line at the top instead of a stream of errors, with the seconds
 *  until the next try (`retryAt`, a time in ms) and "Try now". The app does the trying. From Mason. */
export function OfflineBanner({ retryAt, onRetry, message }: {
  retryAt?: number
  onRetry?: () => void
  /** Instead of "Can't reach the server". */
  message?: ReactNode
}) {
  const { t } = useT(texts)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!retryAt) return
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [retryAt])
  const secs = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1000)) : 0
  return (
    <div className="bnb-offline" role="alert">
      <IconPlugConnectedX size={16} aria-hidden="true" />
      <span className="bnb-offline-text">
        {message ?? t('offline.title')}
        <span className="bnb-offline-when"> · {secs ? t('offline.retryIn', { count: secs }) : t('offline.retrying')}</span>
      </span>
      {onRetry && <Button variant="subtle" size="compact-xs" color="err" onClick={onRetry}>{t('offline.tryNow')}</Button>}
    </div>
  )
}
