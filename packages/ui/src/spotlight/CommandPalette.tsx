import { Kbd, Loader } from '@mantine/core'
import { createSpotlight, Spotlight, type SpotlightStore } from '@mantine/spotlight'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { rankItems } from '../rank'
import { texts } from './CommandPalette.texts'

export interface PaletteItem {
  /** Unique among all the items. */
  id: string
  label: string
  /** A second, dimmer line; matches when it holds the query as typed. */
  description?: string
  /** More words it should be found by ("dark", "night" for the theme). */
  keywords?: string[]
  icon?: ReactNode
  /** A place to go: given to `onNavigate`, or a full page load without one. */
  href?: string
  /** Or something to do (switch the theme, make the text bigger, sign out). */
  onSelect?: () => void
}

export interface PaletteGroup {
  id: string
  /** The group's heading: "Pages", "Create", "Actions", "Appearance". */
  label: string
  items: PaletteItem[]
  /** Commands: what a leading ">" narrows to. */
  commands?: boolean
}

/** The palette's own store, to open it from a button: `const [store, palette] = createCommandPalette()`,
 *  then `<CommandPalette store={store} …/>` and `palette.open()`. */
export const createCommandPalette = createSpotlight

/** "mod + K" is ctrl+k, or ⌘k on a Mac. "/" is ignored while someone types in a field. */
const SHORTCUTS = ['mod + K', '/']

/** Groups with their items ranked against `query`, best first, at most `limit` each; empty ones go. */
export function filterGroups(groups: PaletteGroup[], query: string, limit = 8) {
  const commandsOnly = query.trimStart().startsWith('>')
  const q = commandsOnly ? query.trimStart().slice(1).trim() : query.trim()
  return groups
    .filter((g) => !commandsOnly || g.commands)
    .map((g) => {
      const ranked = q
        ? rankItems(g.items.map((it) => ({ it, label: it.label, hint: [it.description, ...(it.keywords ?? [])].filter(Boolean).join(' ') })), q, limit).map((x) => x.it)
        : g.items.slice(0, limit)
      return { ...g, items: ranked }
    })
    .filter((g) => g.items.length > 0)
}

/** ctrl+k (⌘k) or "/": a box to jump to a page or a record, or to run a command. The app gives the
 *  groups (pages, create, actions, appearance); `search` adds its own results as they come (debounced,
 *  with a spinner). A leading ">" shows the commands only. With nothing typed it shows `recent` and
 *  then every group. ↑↓ pick, Enter goes, Esc closes. On @mantine/spotlight, from Mason and Labdex.
 *  The app imports '@mantine/spotlight/styles.css' once. */
export function CommandPalette({ groups, search, debounce = 250, minQuery = 2, recent = [], onNavigate, store, shortcut = SHORTCUTS, limit = 8, placeholder }: {
  groups: PaletteGroup[]
  /** The app's own results for a query (records, people): a promise of groups. A new query aborts the
   *  last one (`signal`). */
  search?: (query: string, signal: AbortSignal) => Promise<PaletteGroup[]>
  /** ms to wait after the last key before `search`. */
  debounce?: number
  /** Letters before `search` is asked. */
  minQuery?: number
  /** Offered first with nothing typed: what was opened last. */
  recent?: PaletteItem[]
  /** Goes to an item's href with the app's router. */
  onNavigate?: (href: string, item: PaletteItem) => void
  /** From createCommandPalette(), to open it from a button. Default: Mantine's shared spotlight. */
  store?: SpotlightStore
  /** Keys that open it; null for none. */
  shortcut?: string[] | null
  /** Items per group. */
  limit?: number
  placeholder?: string
}) {
  const { t } = useT(texts)
  const [query, setQuery] = useState('')
  // The app's results, with the query they answer, so an old answer never shows for a new query.
  const [found, setFound] = useState<{ query: string; groups: PaletteGroup[] }>({ query: '', groups: [] })
  const [asking, setAsking] = useState('')

  const q = query.trim()
  const wanted = search && !q.startsWith('>') && q.length >= minQuery ? q : ''
  useEffect(() => {
    if (!wanted || !search) return
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      setAsking(wanted)
      search(wanted, ctrl.signal)
        .then((groups) => { if (!ctrl.signal.aborted) setFound({ query: wanted, groups }) })
        .catch(() => { if (!ctrl.signal.aborted) setFound({ query: wanted, groups: [] }) })
        .finally(() => { if (!ctrl.signal.aborted) setAsking('') })
    }, debounce)
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [wanted, search, debounce])
  const loading = !!wanted && (asking === wanted || found.query !== wanted)

  const shown = useMemo(() => {
    const own = filterGroups(groups, query, limit)
    const theirs = wanted && found.query === wanted ? found.groups.filter((g) => g.items.length) : []
    if (!q && recent.length) return [{ id: 'bnb-recent', label: t('palette.recent'), items: recent.slice(0, limit) }, ...own]
    return [...own, ...theirs]
  }, [groups, query, q, limit, wanted, found, recent, t])

  // Mantine picks the first row when the text changes, but the app's results come later: when
  // nothing is picked once they are in (only they match), pick the first so Enter goes there.
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = list.current
    if (el && !el.querySelector('[data-selected]')) el.querySelector('[data-action]')?.setAttribute('data-selected', 'true')
  }, [shown])

  function go(item: PaletteItem) {
    if (item.onSelect) item.onSelect()
    else if (item.href) {
      if (onNavigate) onNavigate(item.href, item)
      else window.location.assign(item.href)
    }
  }

  return (
    <Spotlight.Root store={store} query={query} onQueryChange={setQuery} shortcut={shortcut} clearQueryOnClose
      scrollable maxHeight="min(60vh, 460px)" size="lg" classNames={{ content: 'bnb-palette' }}>
      <Spotlight.Search placeholder={placeholder ?? t('palette.placeholder')} aria-label={t('palette.label')}
        leftSection={<IconSearch size={16} aria-hidden="true" />} rightSection={loading ? <Loader size={14} aria-label={t('palette.searching')} /> : null} />
      <Spotlight.ActionsList ref={list} aria-label={t('palette.label')}>
        {shown.map((g) => (
          <Spotlight.ActionsGroup key={g.id} label={g.label} role="group" aria-label={g.label}>
            {g.items.map((it) => (
              <Spotlight.Action key={`${g.id}:${it.id}`} label={it.label} description={it.description} leftSection={it.icon}
                onClick={() => go(it)} />
            ))}
          </Spotlight.ActionsGroup>
        ))}
        {!shown.length && <Spotlight.Empty>{loading ? t('palette.searching') : t('palette.none')}</Spotlight.Empty>}
      </Spotlight.ActionsList>
      <Spotlight.Footer className="bnb-palette-foot" aria-hidden="true">
        <span><Kbd size="xs">↑</Kbd><Kbd size="xs">↓</Kbd> {t('palette.pick')}</span>
        <span><Kbd size="xs">⏎</Kbd> {t('palette.go')}</span>
        <span><Kbd size="xs">&gt;</Kbd> {t('palette.commands')}</span>
        <span><Kbd size="xs">esc</Kbd> {t('palette.close')}</span>
      </Spotlight.Footer>
    </Spotlight.Root>
  )
}
