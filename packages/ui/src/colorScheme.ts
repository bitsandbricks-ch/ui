import type { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core'

const SCHEMES: readonly MantineColorScheme[] = ['light', 'dark', 'auto']

const parse = (value: string | null | undefined): MantineColorScheme | null =>
  (SCHEMES as readonly string[]).includes(value ?? '') ? (value as MantineColorScheme) : null

function readCookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : ''
}

export interface ColorSchemeOptions {
  /** The cookie that holds the choice; shared by every app on the same parent domain. */
  cookie?: string
  /** Write the cookie on the parent domain (.example.com for app.example.com), so sibling apps follow. */
  parentDomain?: boolean
  /** Also save the choice elsewhere (on the account), so other devices follow. */
  onSave?: (value: MantineColorScheme) => void
}

/** The saved scheme, or null when none was chosen yet (then the device decides). */
export function readColorScheme(cookie = 'bnb_theme'): MantineColorScheme | null {
  const fromCookie = parse(readCookie(cookie))
  if (fromCookie) return fromCookie
  try {
    return parse(localStorage.getItem('mantine-color-scheme-value'))
  } catch {
    return null
  }
}

/** Mantine's colour scheme store, backed by a cookie (from Hubra): light, dark or like the device,
 *  the same in every app that shares the cookie. Pair it with theme-script.js in <head>. */
export function createColorSchemeManager({ cookie = 'bnb_theme', parentDomain = false, onSave }: ColorSchemeOptions = {}): MantineColorSchemeManager {
  const write = (value: MantineColorScheme) => {
    const labels = window.location.hostname.split('.')
    const domain = parentDomain && labels.length > 2 ? `; domain=.${labels.slice(1).join('.')}` : ''
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${cookie}=${value}; Max-Age=31536000; path=/; SameSite=Lax${domain}${secure}`
  }
  let onFocus: (() => void) | null = null
  return {
    get: (defaultValue) => readColorScheme(cookie) ?? defaultValue,
    set: (value) => {
      if (parse(readCookie(cookie)) === value) return
      write(value)
      onSave?.(value)
    },
    // Another app may have changed it while this tab was in the background.
    subscribe: (onUpdate) => {
      onFocus = () => {
        const value = readColorScheme(cookie)
        if (value) onUpdate(value)
      }
      window.addEventListener('focus', onFocus)
    },
    unsubscribe: () => {
      if (onFocus) window.removeEventListener('focus', onFocus)
      onFocus = null
    },
    clear: () => write('auto'),
  }
}
