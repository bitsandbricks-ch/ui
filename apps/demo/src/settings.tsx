import type { Accent, Locale } from '@bitsandbricks/ui'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

// Accents live in the apps, never in a package. These are the showcase's own picks, the same
// samples Storybook offers, so you can see one page in each app's colour.
export const accents = {
  hubra: { name: 'Hubra', accent: { light: '#7441e0', dark: '#9f7cf8' } },
  labdex: { name: 'Labdex', accent: { light: '#b85a0a', dark: '#f59a23' } },
  bit: { name: '…bit', accent: '#2ee59d' },
  none: { name: 'None', accent: undefined },
} satisfies Record<string, { name: string; accent: Accent | undefined }>

export type AccentKey = keyof typeof accents

interface Settings {
  locale: Locale
  setLocale: (locale: Locale) => void
  accent: AccentKey
  setAccent: (accent: AccentKey) => void
}

const SettingsContext = createContext<Settings | null>(null)

// The choice is kept in this browser when it can be; a private window just starts fresh.
function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* not kept */ }
}

const browserLocale = (): Locale => (typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en')

export function SettingsProvider({ children }: { children: (settings: Settings) => ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => read('demo-locale', ['en', 'de'] as const, browserLocale()))
  const [accent, setAccentState] = useState<AccentKey>(() => read('demo-accent', Object.keys(accents) as AccentKey[], 'hubra'))
  const setLocale = useCallback((value: Locale) => { setLocaleState(value); write('demo-locale', value); document.documentElement.lang = value }, [])
  const setAccent = useCallback((value: AccentKey) => { setAccentState(value); write('demo-accent', value) }, [])
  const value = useMemo(() => ({ locale, setLocale, accent, setAccent }), [locale, setLocale, accent, setAccent])
  return <SettingsContext.Provider value={value}>{children(value)}</SettingsContext.Provider>
}

export function useSettings() {
  const settings = useContext(SettingsContext)
  if (!settings) throw new Error('useSettings outside SettingsProvider')
  return settings
}
