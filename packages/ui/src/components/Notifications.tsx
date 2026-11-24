import { ActionIcon, Badge, Button, Group, Stack, Text, Tooltip, useMatches, type ButtonProps } from '@mantine/core'
import { IconArrowRight, IconBell, IconBellCog, IconChevronLeft } from '@tabler/icons-react'
import { createContext, createElement, useContext, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import type { State } from '../status'
import { EmptyState, ErrorBanner, LoadingState } from './feedback'
import { FilterBar, type FilterGroup } from './FilterBar'
import { Pager } from './Pager'
import { LinkContext, PanelSection, SidePanel } from './SidePanel'
import { StatusBadge, StatusBit } from './StatusBadge'
import { texts } from './Notifications.texts'

// The bell, its panel and one notification's details, from Floorbit. The app brings the items and
// draws the details; the package does the list: filters, search, paging at 50, picking, stepping
// with ↑ ↓, and on phones the details in place of the list until "Back".

/** One row in the panel. Sort the list the way it should show (worst first); the panel keeps it. */
export interface NotificationItem {
  id: string
  /** The bit beside the title: down, warn, info, … */
  state: State | (string & {})
  title: ReactNode
  /** Which thing, where: "Hall B · sw-b-03". */
  where?: ReactNode
  /** When it started, already in words ("3 min ago"). */
  time?: ReactNode
  /** The filter it belongs to (a `filters` value). */
  group?: string
  /** What the search looks at. Without it, the title and place when they are text. */
  search?: string
}

/** A filter above the list, besides "All". The count comes from the items' `group`. */
export interface NotificationFilter {
  value: string
  label: string
}

/** What a details view gets from the panel. */
export interface NotificationView {
  /** Closes the panel: call it when a link leads to another page. NotificationLink does. */
  leave: () => void
  /** Phones: back to the list. Undefined on a computer, where the list stays beside the details. */
  back?: () => void
}

const ViewContext = createContext<NotificationView>({ leave: () => {} })

const PER_PAGE = 50

function searchText(it: NotificationItem) {
  if (it.search !== undefined) return it.search
  return [it.title, it.where].filter((x) => typeof x === 'string' || typeof x === 'number').join(' ')
}

function matches(it: NotificationItem, filter: string, words: string[]) {
  if (filter !== 'all' && it.group !== filter) return false
  if (!words.length) return true
  const text = searchText(it).toLowerCase()
  return words.every((w) => text.includes(w))
}

/** The bell for the top bar or the phone header, with the open count on it. `alarm` paints the count
 *  red (something is down); otherwise it is the warning colour. */
export function NotificationsBell({ count = 0, alarm, onClick, compact, label }: {
  count?: number
  alarm?: boolean
  onClick: () => void
  /** The phone header's larger icon. */
  compact?: boolean
  label?: string
}) {
  const { t } = useT(texts)
  const name = label ?? t('nav.notifications')
  return (
    <Tooltip label={name}>
      <ActionIcon variant="subtle" color="gray" size={36} className={`bnb-bell${compact ? ' is-compact' : ''}`} onClick={onClick}
        aria-label={count ? `${name} (${count})` : name}>
        <IconBell size={compact ? 20 : 18} aria-hidden="true" />
        {count > 0 && <span className={`bnb-bell-count${alarm ? ' is-alarm' : ''}`} aria-hidden="true">{count > 99 ? '99+' : count}</span>}
      </ActionIcon>
    </Tooltip>
  )
}

/** What needs a look right now, in a panel from the right: the list on the left, the picked one's
 *  details (`renderDetail`) beside it. On a phone the details replace the list until "Back".
 *  Render it only while open, so its data loads when the bell is pressed. */
export function NotificationsPanel({ opened = true, onClose, items, loading, title, eyebrow, filters = [], renderDetail,
  allHref, allLabel, onSettings, actions, empty, width = 960, storageKey }: {
  opened?: boolean
  onClose: () => void
  items: NotificationItem[]
  /** The first load: rows of placeholders. */
  loading?: boolean
  title?: ReactNode
  /** Above the title: "Checked 1 min ago · 4 open". */
  eyebrow?: ReactNode
  /** Filters besides "All"; empty: only the search. */
  filters?: NotificationFilter[]
  /** One notification's details, usually a NotificationDetail. Without it the panel is a list. */
  renderDetail?: (item: NotificationItem, view: NotificationView) => ReactNode
  /** The page with every notification: a "Show all" link in the header. */
  allHref?: string
  allLabel?: string
  /** Adds a settings button to the header (signed-in people). */
  onSettings?: () => void
  /** More header buttons. */
  actions?: ReactNode
  /** Nothing open: the line under the green bit. */
  empty?: ReactNode
  width?: number
  /** Keeps the dragged width in this browser. */
  storageKey?: string
}) {
  const { t } = useT(texts)
  const Link = useContext(LinkContext)
  const phone = useMatches({ base: true, sm: false }, { getInitialValueInEffect: false })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [picked, setPicked] = useState<string | null>(null)

  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = items.filter((it) => matches(it, filter, words))
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE))
  // A page past the end (the list got shorter while open) shows the last one.
  const onPage = Math.min(page, pages)
  const rows = shown.slice((onPage - 1) * PER_PAGE, onPage * PER_PAGE)
  // The picked one while it is still listed; on a computer the first row otherwise, so the details are never empty.
  const pickedIndex = shown.findIndex((it) => it.id === picked)
  const index = pickedIndex >= 0 ? pickedIndex : phone || !rows.length || !renderDetail ? -1 : (onPage - 1) * PER_PAGE
  const current = renderDetail && index >= 0 ? shown[index] : null
  const step = (by: number) => {
    const next = shown[index + by]
    if (!next) return
    setPicked(next.id)
    setPage(Math.floor((index + by) / PER_PAGE) + 1)
  }
  const leave = () => { setPicked(null); onClose() }
  const view: NotificationView = { leave, back: phone ? () => setPicked(null) : undefined }

  const groups: FilterGroup[] = filters.length ? [{
    key: 'show', label: t('notifications.show'), value: filter, defaultValue: 'all',
    onChange: (v) => { setFilter(v); setPage(1) },
    options: [{ value: 'all', label: t('notifications.filter.all'), count: items.length },
      ...filters.map((f) => ({ value: f.value, label: f.label, count: items.filter((it) => it.group === f.value).length }))],
  }] : []
  // Phones: an arrow only, so the title keeps its room in the header.
  const allName = allLabel ?? t('nav.notify.all')
  const allRoot = allHref && (Link
    ? { renderRoot: (props: Record<string, unknown>) => createElement(Link, { to: allHref, ...props }) }
    : { component: 'a' as const, href: allHref })
  const all = allRoot && (phone
    ? (
      <Tooltip label={allName}>
        <ActionIcon variant="subtle" onClick={leave} aria-label={allName} {...allRoot}><IconArrowRight size={16} aria-hidden="true" /></ActionIcon>
      </Tooltip>
    )
    : (
      <Button size="xs" variant="subtle" onClick={leave} rightSection={<IconArrowRight size={14} aria-hidden="true" />} {...allRoot}>
        {allName}
      </Button>
    ))
  const listShown = !phone || !current
  return (
    <SidePanel opened={opened} onClose={leave} title={title ?? t('nav.notifications')} eyebrow={eyebrow} padded={false}
      width={width} resizable={{ storageKey, min: 640 }}
      onPrev={current && index > 0 ? () => step(-1) : undefined}
      onNext={current && index < shown.length - 1 ? () => step(1) : undefined}
      actions={<>
        {onSettings && (
          <Tooltip label={t('nav.notify.settings')}>
            <ActionIcon variant="default" onClick={onSettings} aria-label={t('nav.notify.settings')}>
              <IconBellCog size={16} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
        )}
        {actions}
        {all}
      </>}
    >
      <div className={`bnb-notify${current && !phone ? ' has-detail' : ''}`}>
        {listShown && (
          <div className="bnb-notify-list">
            {items.length > 0 && (
              <FilterBar padded search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }}
                searchLabel={t('notifications.search')} groups={groups} />
            )}
            {loading ? <LoadingState rows={6} /> : (
              <>
                {items.length === 0 && (
                  <div className="bnb-notify-empty"><span className="bnb-bit is-ok" aria-hidden="true" />{empty ?? t('nav.notify.empty')}</div>
                )}
                {items.length > 0 && shown.length === 0 && <div className="bnb-notify-empty">{t('notifications.noMatch')}</div>}
                {rows.length > 0 && (
                  <ul className="bnb-notify-rows" aria-label={typeof title === 'string' ? title : t('nav.notifications')}>
                    {rows.map((it) => {
                      const on = current?.id === it.id
                      return (
                        <li key={it.id}>
                          <button type="button" className={`bnb-notify-row${on ? ' is-picked' : ''}`}
                            aria-current={on ? 'true' : undefined} onClick={() => setPicked(it.id)}>
                            <StatusBit state={it.state} />
                            <span className="bnb-notify-text">
                              <b>{it.title}</b>
                              {it.where && <small>{it.where}</small>}
                            </span>
                            {it.time ? <span className="bnb-notify-when">{it.time}</span> : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
                <div className="bnb-notify-pager">
                  <Pager page={onPage} perPage={PER_PAGE} total={shown.length} onPage={setPage} />
                </div>
              </>
            )}
          </div>
        )}
        {current && renderDetail && (
          <div className="bnb-notify-detail" key={current.id}>
            <ViewContext.Provider value={view}>{renderDetail(current, view)}</ViewContext.Provider>
          </div>
        )}
      </div>
    </SidePanel>
  )
}

/** One notification beside the list: state, kind and time, the title and place, its buttons, then
 *  the app's sections (PanelSection, NotificationLinks). While it loads, fails or is gone it shows
 *  that instead, and "Back" on a phone in every case. */
export function NotificationDetail({ state, stateLabel, tags, time, title, where, actions, loading, error, gone, children }: {
  state?: State | (string & {})
  /** The badge's word, when the state word isn't exact enough. */
  stateLabel?: ReactNode
  /** More badges after the state: the kind. */
  tags?: ReactNode
  time?: ReactNode
  title?: ReactNode
  where?: ReactNode
  /** Buttons under the title: open its page, report, mute. */
  actions?: ReactNode
  loading?: boolean
  /** Loading it failed. */
  error?: Error | string | null
  /** It no longer exists (it's over): true for the default words, or your own. */
  gone?: boolean | { title: ReactNode; description?: ReactNode }
  children?: ReactNode
}) {
  const { t } = useT(texts)
  const { back } = useContext(ViewContext)
  const backButton = back && (
    <Button variant="subtle" size="compact-sm" leftSection={<IconChevronLeft size={14} aria-hidden="true" />} onClick={back} mb="xs">
      {t('notifications.back')}
    </Button>
  )
  if (loading) return <div className="bnb-notify-pad">{backButton}<LoadingState rows={4} /></div>
  if (gone) {
    const g = typeof gone === 'object' ? gone : { title: t('problem.over'), description: t('problem.overDesc') }
    return <div className="bnb-notify-pad">{backButton}<EmptyState title={g.title} description={g.description} /></div>
  }
  if (error) return <div className="bnb-notify-pad">{backButton}<ErrorBanner error={error} /></div>
  return (
    <>
      <div className="bnb-notify-head">
        {backButton}
        {(state || tags || time) && (
          <Group gap={6} mb={6}>
            {state && <StatusBadge state={state} label={stateLabel} />}
            {tags}
            {time ? <Text size="xs" c="dimmed" ff="monospace">{time}</Text> : null}
          </Group>
        )}
        {title && <Text fw={650} size="lg" lh={1.3} className="bnb-notify-title">{title}</Text>}
        {where && <Text size="sm" c="dimmed">{where}</Text>}
        {actions && <Group gap="xs" mt="sm">{actions}</Group>}
      </div>
      {children}
    </>
  )
}

/** A small grey tag beside the state badge: the notification's kind. */
export function NotificationTag({ children }: { children: ReactNode }) {
  return <Badge size="sm" variant="light" color="gray">{children}</Badge>
}

/** A button to another page that closes the panel on the way. Goes through the app's router link;
 *  `native` (a page the server draws) makes it a plain link. */
export function NotificationLink({ href, native, onClick, ...props }: ButtonProps & {
  href: string
  native?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  const Link = useContext(LinkContext)
  const { leave } = useContext(ViewContext)
  if (native || !Link) return <Button {...props} component="a" href={href} onClick={() => { onClick?.(); if (!native) leave() }} />
  return <Button {...props} onClick={() => { onClick?.(); leave() }} renderRoot={(root) => createElement(Link, { to: href, ...root })} />
}

/** "Where to look next": a full-width button per place, or a line when there's nowhere to go. */
export function NotificationLinks({ links, label, empty, border = false }: {
  links: { href: string; label: ReactNode; native?: boolean }[]
  label?: ReactNode
  empty?: ReactNode
  border?: boolean
}) {
  const { t } = useT(texts)
  return (
    <PanelSection label={label ?? t('problem.next')} border={border}>
      {links.length ? (
        <Stack gap={6}>
          {links.map((x) => (
            <NotificationLink key={x.href} href={x.href} native={x.native} variant="default" justify="space-between" fullWidth
              rightSection={<IconArrowRight size={14} aria-hidden="true" />}>{x.label}</NotificationLink>
          ))}
        </Stack>
      ) : <Text size="sm" c="dimmed">{empty ?? t('problem.nowhere')}</Text>}
    </PanelSection>
  )
}
