import { Button, Code, Group, Stack, Text, Title } from '@mantine/core'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './PageError.texts'

// From Floorbit's PageError and Hubra's ErrorBoundary (by Mike).

const RELOADED = 'bnb-reloaded-for-update'

/** The browser asked for a piece of the app's code that is gone: the app was updated while this
 *  tab was open, and the old file names no longer exist. */
export function isStaleCode(error: unknown): boolean {
  const text = String((error as Error)?.message ?? error)
  return /dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically/i.test(text)
}

function reloadOnceForUpdate(): boolean {
  try {
    if (sessionStorage.getItem(RELOADED)) return false
    sessionStorage.setItem(RELOADED, '1')
  } catch {
    return false   // no storage: let the person press Reload instead of looping
  }
  window.location.reload()
  return true
}

function Fallback({ error, onRetry, reportHref, fullPage }: {
  error: unknown; onRetry: () => void; reportHref?: string; fullPage?: boolean
}) {
  const { t } = useT(texts)
  const stale = isStaleCode(error)
  const message = String((error as Error)?.message ?? error).slice(0, 500)
  return (
    <div role="alert" className={`bnb-page-error${fullPage ? ' is-full' : ''}`}>
      <Stack gap="sm" maw={560}>
        <IconAlertTriangle size={32} aria-hidden="true" className="bnb-page-error-icon" />
        <Title order={2}>{t(stale ? 'crash.updatedTitle' : 'crash.title')}</Title>
        <Text>{t(stale ? 'crash.updatedText' : 'crash.text')}</Text>
        <Group gap="xs">
          <Button leftSection={<IconRefresh size={16} aria-hidden="true" />} onClick={() => window.location.reload()}>
            {t('crash.reload')}
          </Button>
          {!stale && <Button variant="subtle" onClick={onRetry}>{t('crash.retry')}</Button>}
          {!stale && reportHref && (
            <Button component="a" href={reportHref} variant="default">{t('crash.report')}</Button>
          )}
        </Group>
        {!stale && (
          <details>
            <summary>{t('crash.details')}</summary>
            <Code block mt="xs">{message}</Code>
          </details>
        )}
      </Stack>
    </div>
  )
}

type Props = {
  children: ReactNode
  /** A new value (the page's path) starts over, so going to another page clears the error. */
  resetKey?: string
  /** Where "Report the problem" leads (a support form with the address filled in); left out without it. */
  reportHref?: string
  /** Fill the window instead of the page area: for the boundary around the whole app. */
  fullPage?: boolean
  /** Told about every error, to log or send it somewhere. Not called for the reload after an update. */
  onError?: (error: unknown, info: ErrorInfo) => void
}
type State = { error: unknown; key?: string }

/** A page that throws while drawing shows this in its place instead of a blank window: put it
 *  around the page area, inside the shell, so the sidebar stays and people can go elsewhere. After
 *  an update, an open tab asks for code that is gone; then it reloads once by itself, and if that
 *  doesn't help it says a new version is out. */
export class PageError extends Component<Props, State> {
  state: State = { error: null, key: this.props.resetKey }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isStaleCode(error) && reloadOnceForUpdate()) return
    if (this.props.onError) this.props.onError(error, info)
    else console.error('[bnb] page failed', error, info.componentStack)
  }

  render() {
    if (this.state.error === null) return this.props.children
    return (
      <Fallback error={this.state.error} onRetry={() => this.setState({ error: null })}
        reportHref={this.props.reportHref} fullPage={this.props.fullPage} />
    )
  }
}
