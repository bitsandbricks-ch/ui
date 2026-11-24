import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { useConfirm } from './components/useConfirm'
import { useT } from './i18n'
import { texts } from './unsaved.texts'

// Changes not saved yet (an edit page, a side panel's form): leaving the page or closing the tab
// asks first instead of dropping them, and Ctrl/⌘ S saves. One registry for the whole app, so a
// router guard asks once for every form on screen. From Labdex and Mason.

interface Entry { what?: string; draft: boolean }
const entries = new Map<string, Entry>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

function beforeUnload(e: BeforeUnloadEvent) {
  if (entries.size) { e.preventDefault(); e.returnValue = '' }
}

function set(id: string, entry: Entry | null) {
  const had = entries.size
  if (entry) entries.set(id, entry)
  else entries.delete(id)
  if (!had && entries.size) window.addEventListener('beforeunload', beforeUnload)
  if (had && !entries.size) window.removeEventListener('beforeunload', beforeUnload)
  emit()
}

/** Is anything on screen unsaved? For a router guard that must decide without asking. */
export const hasUnsaved = () => entries.size > 0

/** Re-renders when something becomes unsaved or saved: a dot on a tab, a disabled "Leave". */
export function useHasUnsaved() {
  return useSyncExternalStore(subscribe, hasUnsaved, () => false)
}

/** Marks changes as unsaved while `dirty` is true.
 *
 *    const unsaved = useUnsaved(form.isDirty(), { what: 'your settings', onSave: save })
 *    unsaved.release()  // before navigating away after a delete
 *
 *  `what` names it in the question ("Leave without saving your settings?"). `onSave` makes Ctrl/⌘ S
 *  save while dirty (and never the browser's "save page"). `draft: true` says the changes stay as
 *  a draft (useDraft), so the question says nothing is lost. */
export function useUnsaved(dirty: boolean, { what, onSave, draft = false }: { what?: string; onSave?: () => void; draft?: boolean } = {}) {
  const id = useId()
  const [released, setReleased] = useState(false)
  // Saved and clean again: a later change counts again.
  if (released && !dirty) setReleased(false)
  const on = dirty && !released
  useEffect(() => {
    set(id, on ? { what, draft } : null)
    return () => set(id, null)
  }, [id, on, what, draft])

  const save = useRef(onSave)
  useEffect(() => { save.current = onSave })
  useEffect(() => {
    if (!onSave) return
    function key(e: KeyboardEvent) {
      if ((e.key === 's' || e.key === 'S') && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        // Not while a dialog asks something: Ctrl S there would save behind its back.
        if (on && !document.querySelector('[role="dialog"][aria-modal="true"]')) save.current?.()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [on, onSave])

  return { release: useCallback(() => { setReleased(true); set(id, null) }, [id]) }
}

/** A function that answers whether leaving is fine: true when nothing is unsaved, otherwise it asks
 *  ("Leave without saving your settings?") and, on yes, forgets the changes. Call it from the
 *  router's blocker (React Router: useBlocker) or before closing a side panel. */
export function useConfirmLeave() {
  const confirm = useConfirm()
  const { t } = useT(texts)
  return useCallback(async () => {
    if (!entries.size) return true
    const list = [...entries.values()]
    const names = [...new Set(list.map((e) => e.what).filter((w): w is string => !!w))]
    const what = names.length > 1 ? t('unsaved.and', { first: names.slice(0, -1).join(', '), last: names[names.length - 1] }) : names[0]
    const ok = await confirm({
      title: what ? t('unsaved.titleWhat', { what }) : t('unsaved.title'),
      body: list.every((e) => e.draft) ? t('unsaved.bodyDraft') : t('unsaved.body'),
      confirmLabel: t('unsaved.leave'),
      cancelLabel: t('unsaved.stay'),
    })
    if (ok) { entries.clear(); window.removeEventListener('beforeunload', beforeUnload); emit() }
    return ok
  }, [confirm, t])
}

// ── Drafts ────────────────────────────────────────────────────────────────────────────────────
// What you changed but didn't save stays in this browser (never on the server: nothing is
// applied) and is offered back when you open the page again.

const PREFIX = 'bnb-draft:'
const DAY = 24 * 3600 * 1000

interface Stored<T> { at: number; data: T }

function readDraft<T>(key: string, maxAge: number): Stored<T> | null {
  try {
    const d = JSON.parse(localStorage.getItem(PREFIX + key) || 'null') as Stored<T> | null
    if (d && Date.now() - d.at < maxAge) return d
    localStorage.removeItem(PREFIX + key)
  } catch { /* storage may be off: drafts are a convenience */ }
  return null
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Keeps unsaved changes as a draft in this browser and offers an older one back.
 *
 *    const draft = useDraft(`host:${name}`, form.values, { dirty, ready: loaded, apply: form.setValues })
 *    draft.offer   // { at } when an older draft differs from what the server said
 *    draft.restore(); draft.discard(); draft.clear()  // clear() after a save
 *
 *  `key` names the thing edited (null: no drafts). Nothing is written until `ready` (the page has
 *  the server's data). A draft older than `maxAgeDays` is dropped. */
export function useDraft<T>(key: string | null, value: T, { dirty, ready = true, apply, maxAgeDays = 14, delay = 800 }: {
  dirty: boolean
  ready?: boolean
  apply: (data: T) => void
  maxAgeDays?: number
  /** Milliseconds after the last change before the draft is written. */
  delay?: number
}) {
  const [offer, setOffer] = useState<Stored<T> | null>(null)
  const latest = useRef({ value, dirty, offer })
  useEffect(() => { latest.current = { value, dirty, offer } })
  // After clear(): nothing is written until the form is clean again (a save that renames
  // navigates away while the old form still looks changed).
  const paused = useRef(false)
  useEffect(() => { if (!dirty) paused.current = false }, [dirty])

  const write = useCallback(() => {
    if (!key || !ready || paused.current) return
    const { value: v, dirty: d, offer: o } = latest.current
    try {
      if (d) localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data: v }))
      else if (!o) localStorage.removeItem(PREFIX + key)
    } catch { /* full or off */ }
  }, [key, ready])

  // Once the page has the server's data, look for an older draft of it.
  useEffect(() => {
    if (!key || !ready) return
    const d = readDraft<T>(key, maxAgeDays * DAY)
    setOffer(d && !same(d.data, latest.current.value) ? d : null)
  }, [key, ready, maxAgeDays])

  const json = JSON.stringify(value)
  useEffect(() => {
    const timer = setTimeout(write, delay)
    return () => clearTimeout(timer)
  }, [json, dirty, write, delay])

  // Leaving the page or closing the tab writes at once, not after the pause.
  useEffect(() => {
    window.addEventListener('pagehide', write)
    return () => { window.removeEventListener('pagehide', write); write() }
  }, [write])

  const remove = () => { try { if (key) localStorage.removeItem(PREFIX + key) } catch { /* */ } }
  return {
    offer: offer ? { at: offer.at } : null,
    restore() {
      if (!offer) return
      apply(offer.data)
      setOffer(null)
    },
    discard() { setOffer(null); remove() },
    clear() { paused.current = true; setOffer(null); remove() },
  }
}
