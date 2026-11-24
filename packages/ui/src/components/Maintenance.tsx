import { Anchor, CloseButton, Paper, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconTool } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useT, type Locale } from '../i18n'
import { texts } from './Maintenance.texts'

// From Hubra's MaintenanceNotice and MaintenanceScreen and Seatbit's maintenance banner (by Mike).
// The app knows when maintenance is (its API, its settings); these only show it.

type When = Date | string | number

const toDate = (v: When | undefined) => {
  if (v === undefined || v === null || v === '') return undefined
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// 24-hour times with the day first, in English too: maintenance often runs at night.
const region = (locale: Locale) => (locale === 'de' ? 'de-CH' : 'en-CH')
const time = (d: Date, locale: Locale) => d.toLocaleTimeString(region(locale), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const day = (d: Date, locale: Locale) => d.toLocaleDateString(region(locale), { weekday: 'short', day: 'numeric', month: 'long' })
const dayTime = (d: Date, locale: Locale) => `${day(d, locale)}, ${time(d, locale)}`

/** "Sat 14 November, 22:00 – 23:00" on one day, else both days. */
function range(a: Date, b: Date, locale: Locale) {
  return a.toDateString() === b.toDateString()
    ? `${dayTime(a, locale)} – ${time(b, locale)}`
    : `${dayTime(a, locale)} – ${dayTime(b, locale)}`
}

/** A strip above the page while maintenance is planned or going on: when, and what the app says
 *  about it. Draws nothing once `endsAt` has passed. With `onDismiss` it has a close button; the
 *  app remembers that (per maintenance) and stops passing it. */
export function MaintenanceBanner({ startsAt, endsAt, message, onDismiss, now: fixedNow }: {
  startsAt?: When
  endsAt?: When
  /** What the app says; for planned work "the app is not available during this time" if left out. */
  message?: string
  onDismiss?: () => void
  /** For tests and stories. */
  now?: number
}) {
  const { t, locale } = useT(texts)
  const [shownAt] = useState(() => Date.now())
  const now = fixedNow ?? shownAt
  const start = toDate(startsAt)
  const end = toDate(endsAt)
  if (end && end.getTime() <= now) return null
  const planned = !!start && start.getTime() > now
  const when = planned
    ? end ? t('maintenance.plannedRange', { range: range(start, end, locale) }) : t('maintenance.plannedFrom', { start: dayTime(start, locale) })
    : end ? t('maintenance.nowUntil', { end: end.toDateString() === new Date(now).toDateString() ? time(end, locale) : dayTime(end, locale) }) : t('maintenance.now')
  const text = message?.trim() || (planned ? t('maintenance.plannedDefault') : t('maintenance.text'))
  return (
    <div role="status" className={`bnb-maintenance-banner${planned ? '' : ' is-now'}`}>
      <IconTool size={18} aria-hidden="true" className="bnb-maintenance-icon" />
      <Text fz="sm" style={{ flex: 1, minWidth: 0 }}>
        <Text span fw={600}>{when}</Text> {text}
      </Text>
      {onDismiss && <CloseButton size="sm" aria-label={t('maintenance.dismiss')} onClick={onDismiss} />}
    </div>
  )
}

/** Covers the whole app while it is down for maintenance (the API answers 503): says so, when it
 *  should be back, and links to a status page. With `stillDown` it asks every `every` ms and
 *  reloads the page once the answer is no. */
export function MaintenanceScreen({ message, until, statusHref, stillDown, every = 30_000 }: {
  message?: string
  until?: When
  statusHref?: string
  /** Asked again and again; false (or a resolved false) reloads the page. */
  stillDown?: () => Promise<boolean> | boolean
  every?: number
}) {
  const { t, locale } = useT(texts)
  const end = toDate(until)
  const ask = useRef(stillDown)
  useEffect(() => { ask.current = stillDown })
  const polls = !!stillDown
  useEffect(() => {
    if (!polls) return
    const timer = window.setInterval(async () => {
      try {
        if (!(await ask.current?.())) window.location.reload()
      } catch {
        /* still down: keep waiting */
      }
    }, every)
    return () => window.clearInterval(timer)
  }, [polls, every])
  return (
    <div className="bnb-maintenance-screen">
      <Paper withBorder shadow="md" p="xl" maw={440} ta="center" role="alert">
        <Stack align="center" gap="md">
          <ThemeIcon size={56} radius="xl" variant="light" color="accent"><IconTool size={30} aria-hidden="true" /></ThemeIcon>
          <Text component="h1" fz={20} fw={700} m={0}>{t('maintenance.title')}</Text>
          <Text size="sm" lh={1.5}>{message?.trim() || t('maintenance.text')}</Text>
          {end && <Text size="sm" c="dimmed">{t('maintenance.until', { time: time(end, locale) })}</Text>}
          {polls && <Text size="xs" c="dimmed">{t('maintenance.reload')}</Text>}
          {statusHref && <Anchor size="sm" href={statusHref}>{t('maintenance.status')}</Anchor>}
        </Stack>
      </Paper>
    </div>
  )
}
