import { Kbd, Loader, Modal, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { rankItems } from '../rank'

export interface JumpItem {
  /** Unique among the items. */
  id: string
  label: string
  /** A second, dimmer text; it matches too when it holds the query as typed. */
  hint?: string
  /** What it is ("page", "host", "command"): its tag, from `kinds`, and its order on a tie. */
  kind?: string
  /** A place to go: given to `onNavigate`. */
  href?: string
  /** Or something to do (switch the theme, sign out). */
  run?: () => void
  icon?: ReactNode
}

/** ctrl+k (⌘k): a few letters of a page, a record or a command, Enter goes there or runs it.
 *  ↑↓ (or ctrl+n, ctrl+p) pick, Esc closes. The app gives the items and the words for their kinds;
 *  with nothing typed it shows `recent`, then the items of the first kind. From Mason. */
export function JumpBox({ opened, onClose, items, recent = [], kinds = {}, onNavigate, onQuery, loading, limit = 12, placeholder }: {
  opened: boolean
  onClose: () => void
  items: JumpItem[]
  /** Offered before anything is typed (what was opened last). */
  recent?: JumpItem[]
  /** kind → its tag ("page": "Page"). The order of the keys is the order on a tie. */
  kinds?: Record<string, string>
  /** Goes to an item's href (the app's router). Default: a full page load. */
  onNavigate?: (href: string, item: JumpItem) => void
  /** The query as it is typed, for an app that searches its server. */
  onQuery?: (query: string) => void
  /** The items are still coming. */
  loading?: boolean
  limit?: number
  placeholder?: string
}) {
  const { t } = useT()
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()
  const order = useMemo(() => Object.keys(kinds), [kinds])

  const shown = useMemo(() => {
    if (query.trim()) return rankItems(items, query, limit, order)
    const first = order[0]
    const rest = first ? items.filter((i) => i.kind === first) : items
    return [...recent, ...rest.filter((i) => !recent.some((r) => r.id === i.id))].slice(0, limit)
  }, [items, recent, query, limit, order])

  // Opening starts afresh: no query, the first row picked.
  const [wasOpen, setWasOpen] = useState(opened)
  if (opened !== wasOpen) {
    setWasOpen(opened)
    if (opened) { setQuery(''); setAt(0) }
  }
  useEffect(() => { onQuery?.(query) }, [query, onQuery])

  function go(item: JumpItem | undefined) {
    if (!item) return
    onClose()
    if (item.run) item.run()
    else if (item.href) {
      if (onNavigate) onNavigate(item.href, item)
      else window.location.assign(item.href)
    }
  }
  function key(e: KeyboardEvent<HTMLInputElement>) {
    const k = e.key
    if (k === 'ArrowDown' || (k === 'n' && e.ctrlKey)) setAt((i) => Math.min(i + 1, shown.length - 1))
    else if (k === 'ArrowUp' || (k === 'p' && e.ctrlKey)) setAt((i) => Math.max(i - 1, 0))
    else if (k === 'Enter') go(shown[at])
    else return
    e.preventDefault()
  }

  const recentIds = new Set(recent.map((r) => r.id))
  const optionId = (i: number) => `${listId}-${i}`
  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} size="lg" yOffset="12vh" padding={0}
      aria-label={t('jump.label')} classNames={{ content: 'bnb-jump' }} trapFocus returnFocus
      onEnterTransitionEnd={() => input.current?.focus()}>
      <div className="bnb-jump-head">
        <TextInput ref={input} data-autofocus value={query} onChange={(e) => { setQuery(e.currentTarget.value); setAt(0) }} onKeyDown={key}
          placeholder={placeholder ?? t('jump.placeholder')} aria-label={t('jump.label')} variant="unstyled"
          leftSection={<IconSearch size={16} aria-hidden="true" />} rightSection={loading ? <Loader size={14} aria-label={t('common.loading')} /> : null}
          role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={shown.length ? optionId(at) : undefined} style={{ flex: 1 }} />
      </div>
      <ul id={listId} role="listbox" aria-label={t('jump.label')} className="bnb-jump-list">
        {shown.map((it, i) => (
          <li key={it.id} id={optionId(i)} role="option" aria-selected={i === at} className="bnb-jump-item"
            data-selected={i === at || undefined} onMouseMove={() => setAt(i)} onClick={() => go(it)}>
            <span className="bnb-jump-kind">{!query.trim() && recentIds.has(it.id) ? t('jump.recent') : (it.kind && kinds[it.kind]) || ''}</span>
            {it.icon && <span className="bnb-jump-icon" aria-hidden="true">{it.icon}</span>}
            <span className="bnb-jump-label">{it.label}</span>
            {it.hint && <span className="bnb-jump-hint">{it.hint}</span>}
          </li>
        ))}
        {!shown.length && <li className="bnb-jump-none" role="presentation">{loading ? t('common.loading') : t('jump.none')}</li>}
      </ul>
      <div className="bnb-jump-foot" aria-hidden="true">
        <span><Kbd size="xs">↑</Kbd><Kbd size="xs">↓</Kbd> {t('jump.pick')}</span>
        <span><Kbd size="xs">⏎</Kbd> {t('jump.go')}</span>
        <span><Kbd size="xs">esc</Kbd> {t('jump.close')}</span>
      </div>
    </Modal>
  )
}
