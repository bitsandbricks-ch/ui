import { useEffect, useState } from 'react'

/** What one device wants to be told, kept in this browser. */
export interface NotifyPrefs {
  on: boolean
  /** Per kind of notification ("jobs", "incidents"); a kind not listed is on. */
  kinds: Record<string, boolean>
  /** Quiet hours, local time on this device, "HH:MM"; they may run past midnight. */
  quiet: boolean
  quietFrom: string
  quietTo: string
  /** Urgent kinds still come through quiet hours. */
  urgentInQuiet: boolean
}

export const NOTIFY_DEFAULTS: NotifyPrefs = { on: false, kinds: {}, quiet: false, quietFrom: '22:00', quietTo: '08:00', urgentInQuiet: true }

export type NotifyPermission = NotificationPermission | 'unsupported'

export interface BrowserNotify {
  /** The localStorage key the settings live under. */
  key: string
  supported: () => boolean
  permission: () => NotifyPermission
  prefs: () => NotifyPrefs
  /** Saves changes; switching on asks the browser for permission first, and stays off if refused. */
  set: (changes: Partial<NotifyPrefs>) => Promise<NotifyPrefs>
  quietNow: (at?: Date) => boolean
  /** Shows a notification if this device wants this kind now. Returns whether it showed one. */
  notify: (kind: string, title: string, options?: { body?: string; tag?: string; url?: string; urgent?: boolean; icon?: string }) => boolean
}

function minutes(hhmm: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  return m ? (Number(m[1]) % 24) * 60 + Number(m[2]) : null
}

/** Whether `at` falls in the quiet hours; they may run past midnight (22:00 to 08:00). */
export function inQuietHours(p: Pick<NotifyPrefs, 'quiet' | 'quietFrom' | 'quietTo'>, at: Date) {
  if (!p.quiet) return false
  const from = minutes(p.quietFrom), to = minutes(p.quietTo)
  if (from === null || to === null || from === to) return false
  const now = at.getHours() * 60 + at.getMinutes()
  return from < to ? now >= from && now < to : now >= from || now < to
}

/** Browser notifications for one app, opt-in per device: while a tab is open, no push service.
 *  The app listens to its own live events and calls `notify(kind, ...)`; this decides whether the
 *  person wants that kind now (on, the kind, quiet hours, permission). From Floorbit. */
export function createBrowserNotify(key: string, icon?: string): BrowserNotify {
  const supported = () => typeof Notification !== 'undefined'
  const permission = (): NotifyPermission => (supported() ? Notification.permission : 'unsupported')
  const prefs = (): NotifyPrefs => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}') as Partial<NotifyPrefs>
      return { ...NOTIFY_DEFAULTS, ...saved, kinds: { ...saved.kinds } }
    } catch { return { ...NOTIFY_DEFAULTS, kinds: {} } }
  }
  async function set(changes: Partial<NotifyPrefs>) {
    const next = { ...prefs(), ...changes }
    if (changes.on && supported() && Notification.permission === 'default') {
      next.on = (await Notification.requestPermission()) === 'granted'
    }
    if (changes.on && permission() !== 'granted') next.on = false
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* storage blocked: lasts until the tab closes */ }
    // Other hooks in this tab; other tabs hear the storage event.
    window.dispatchEvent(new CustomEvent('bnb-notify', { detail: key }))
    return next
  }
  const quietNow = (at = new Date()) => inQuietHours(prefs(), at)
  function notify(kind: string, title: string, options: { body?: string; tag?: string; url?: string; urgent?: boolean; icon?: string } = {}) {
    const p = prefs()
    if (!p.on || p.kinds[kind] === false || permission() !== 'granted') return false
    if (inQuietHours(p, new Date()) && !(options.urgent && p.urgentInQuiet)) return false
    // The same tag in several open tabs shows one notification, not one per tab.
    const n = new Notification(title, { body: options.body, tag: options.tag, icon: options.icon ?? icon })
    n.onclick = () => {
      window.focus()
      if (options.url) location.assign(options.url)
      n.close()
    }
    return true
  }
  return { key, supported, permission, prefs, set, quietNow, notify }
}

/** The settings of a BrowserNotify as state: changes from this tab and others show at once. */
export function useBrowserNotify(store: BrowserNotify) {
  const [prefs, setPrefs] = useState(store.prefs)
  const [permission, setPermission] = useState(store.permission)
  useEffect(() => {
    const reload = () => { setPrefs(store.prefs()); setPermission(store.permission()) }
    const onStorage = (e: StorageEvent) => { if (e.key === store.key) reload() }
    const onLocal = (e: Event) => { if ((e as CustomEvent).detail === store.key) reload() }
    window.addEventListener('storage', onStorage)
    window.addEventListener('bnb-notify', onLocal)
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('bnb-notify', onLocal) }
  }, [store])
  return { prefs, permission, supported: store.supported(), set: store.set }
}
