import { ActionIcon, Anchor, Chip, Group, Text, Tooltip } from '@mantine/core'
import { IconExternalLink, IconRefresh } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Timeline.texts'
import type { Tone } from '../status'
import { timeAgo } from '../text'
import { LoadingState } from './feedback'

export interface TimelineEvent {
  id: string
  /** When it happened: an ISO time, a timestamp or a Date. */
  at: string | number | Date
  /** What happened, in a few words. */
  what: ReactNode
  who?: ReactNode
  /** Where it was seen ("github", "yours"): the chips filter by it. */
  source?: string
  /** A short second line. */
  detail?: ReactNode
  /** Longer text that opens on a click (a comment, a command's output). */
  more?: string
  /** The event on its own site, in a new tab. */
  href?: string
  tone?: Tone
}

/** What happened to one thing (a host, a pull request, a release), newest first: the time, a mark,
 *  what and who, a line of detail, and more on a click. With events from several sources, chips
 *  filter by source. The app loads the events and passes `updatedAt` and `onRefresh`. From Mason. */
export function Timeline({ events, sources = {}, loading, updatedAt, onRefresh, empty, title }: {
  events: TimelineEvent[]
  /** source → its chip's word ("mason": "Yours"); a source without one shows as it is. */
  sources?: Record<string, string>
  loading?: boolean
  /** When the events were read; shown as "updated 10:42". */
  updatedAt?: Date
  onRefresh?: () => void
  /** Shown when there are no events. */
  empty?: ReactNode
  /** The heading; "Events" by default. */
  title?: ReactNode
}) {
  const { t, locale } = useT(texts)
  const [source, setSource] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const all = [...new Set(events.map((e) => e.source).filter(Boolean) as string[])]
  const shown = source ? events.filter((e) => e.source === source) : events
  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  return (
    <section className="bnb-timeline" aria-label={typeof title === 'string' ? title : t('timeline.title')}>
      <Group gap="xs" className="bnb-timeline-head" wrap="wrap">
        <Text fw={650} size="sm">{title ?? t('timeline.title')} <Text span c="dimmed" size="sm">({shown.length})</Text></Text>
        {all.length > 1 && (
          <Chip.Group value={source} onChange={(v) => setSource(String(v))}>
            <Group gap={4}>
              <Chip size="xs" value="">{t('timeline.all')}</Chip>
              {all.map((s) => <Chip key={s} size="xs" value={s}>{sources[s] ?? s}</Chip>)}
            </Group>
          </Chip.Group>
        )}
        <span style={{ flex: 1 }} />
        {updatedAt && <Text size="xs" c="dimmed">{t('timeline.updated', { time: updatedAt.toLocaleTimeString(locale === 'de' ? 'de-CH' : locale, { hour: '2-digit', minute: '2-digit' }) })}</Text>}
        {onRefresh && (
          <Tooltip label={t('timeline.refresh')}>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onRefresh} loading={loading} aria-label={t('timeline.refresh')}>
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {loading && !events.length ? <LoadingState lines={3} />
        : !shown.length ? <Text size="sm" c="dimmed" py="sm">{empty ?? t('timeline.none')}</Text>
        : (
          <ol className="bnb-timeline-list">
            {shown.map((e) => {
              const isOpen = open.has(e.id)
              return (
                <li key={e.id} className="bnb-timeline-item" data-tone={e.tone}>
                  <time className="bnb-timeline-when" dateTime={new Date(e.at).toISOString()} title={new Date(e.at).toLocaleString(locale === 'de' ? 'de-CH' : locale)}>
                    {timeAgo(e.at, locale)}
                  </time>
                  <span className="bnb-timeline-mark" aria-hidden="true" />
                  <div className="bnb-timeline-body">
                    <span className="bnb-timeline-what">{e.what}</span>
                    {e.who && <span className="bnb-timeline-who"> · {e.who}</span>}
                    {e.detail && <div className="bnb-timeline-detail">{e.detail}</div>}
                    {e.more && (
                      <button type="button" className="bnb-timeline-more" aria-expanded={isOpen} onClick={() => toggle(e.id)}>
                        {isOpen ? t('common.hideDetails') : t('common.details')}
                      </button>
                    )}
                    {e.more && isOpen && <pre className="bnb-timeline-text">{e.more}</pre>}
                  </div>
                  {e.href && (
                    <Anchor href={e.href} target="_blank" rel="noopener noreferrer" className="bnb-timeline-go" aria-label={t('timeline.openElsewhere')}>
                      <IconExternalLink size={14} />
                    </Anchor>
                  )}
                </li>
              )
            })}
          </ol>
        )}
    </section>
  )
}
