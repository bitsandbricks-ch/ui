import { useEffect, useRef } from 'react'

// Single keys for a page, like a terminal app's: "r" reloads, "n" makes a new one, "?" shows the keys.
// From Mason. The keys are what the keyboard types (event.key), so "?" and "R" work on any layout.

/** Whether a key press is someone typing: in a text field, a select or an editable block. */
export function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el || typeof el.tagName !== 'string') return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable === true
}

/** Whether a modal dialog is open: a page's keys wait until it is closed. */
export function dialogOpen(doc: Document = document) {
  return !!doc.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]')
}

export type KeyMap = Record<string, ((event: KeyboardEvent) => void) | undefined | false>

export interface UseKeysOptions {
  /** false switches the keys off (a hidden tab, a page that isn't shown). Default true. */
  enabled?: boolean
  /** Also when a modal dialog is open. Default false: a dialog's keys are its own. */
  inDialogs?: boolean
}

/** A page's own single keys, while it is shown: `useKeys({ r: reload, n: create, '?': showKeys })`.
 *  Nothing fires while someone types in a field, with ctrl, ⌘ or alt held, when a list already used
 *  the key (it called preventDefault) or while a dialog is open. */
export function useKeys(map: KeyMap, { enabled = true, inDialogs = false }: UseKeysOptions = {}) {
  // The latest map, without registering the listener again on every render.
  const ref = useRef(map)
  useEffect(() => { ref.current = map })
  useEffect(() => {
    if (!enabled) return
    function on(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      if (!inDialogs && dialogOpen()) return
      const fn = ref.current[e.key]
      if (!fn) return
      e.preventDefault()
      fn(e)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [enabled, inDialogs])
}

/** ctrl+key (⌘+key on a Mac) from anywhere, even a text field: the jump box's ctrl+k. */
export function useModKey(key: string, fn: () => void, enabled = true) {
  const ref = useRef(fn)
  useEffect(() => { ref.current = fn })
  useEffect(() => {
    if (!enabled) return
    function on(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== key.toLowerCase()) return
      e.preventDefault()
      ref.current()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [key, enabled])
}

export interface KeyRow {
  /** What to press, as shown: "r", "ctrl+k", "↑ ↓". */
  key: string
  label: string
  /** The button is there but can't be used now. */
  off?: boolean
}

/** The keys of what is on screen, read from its buttons' `aria-keyshortcuts`, so a keys sheet never
 *  names a key that isn't there. One row per key, an enabled button first, in the order they show.
 *  `skip` leaves out keys the sheet already lists elsewhere. */
export function keysOn(root: ParentNode | null | undefined, skip: Iterable<string> = []): KeyRow[] {
  const leave = new Set(skip)
  const out = new Map<string, KeyRow>()
  for (const el of root ? Array.from(root.querySelectorAll<HTMLElement>('[aria-keyshortcuts]')) : []) {
    const key = (el.getAttribute('aria-keyshortcuts') || '').trim()
    const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()
    if (!key || !label || leave.has(key)) continue
    const off = (el as HTMLButtonElement).disabled === true || el.getAttribute('aria-disabled') === 'true'
    const had = out.get(key)
    if (!had || (had.off && !off)) out.set(key, { key, label, off })
  }
  return [...out.values()]
}
