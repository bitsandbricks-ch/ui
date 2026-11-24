import { createContext, useContext, useMemo, type ReactNode } from 'react'

// The package's own texts, in English and German. An app with i18next passes its `t` to
// BnbProvider: a key the app knows wins (Floorbit's keys are the same), anything else falls back
// to these. Plurals follow i18next: `key_one` and `key_other` with a `count`.

export type Messages = Record<string, string>
export type Vars = Record<string, string | number | undefined>
export type Locale = 'en' | 'de'

export const en: Messages = {
  'common.cancel': 'Cancel',
  'common.confirm': 'Yes, go ahead',
  'common.areYouSure': '{{label}}: are you sure?',
  'common.close': 'Close',
  'common.loading': 'Loading…',
  'common.retry': 'Try again',
  'common.delete': 'Delete',
  'common.open': 'Open',
  'common.nothingYet': 'Nothing here yet.',
  'common.error': 'Something went wrong: {{message}}',
  'filters.search': 'Search…',
  'filters.filter': 'Filter',
  'filters.clear': 'Clear filters',
  'filters.clearSearch': 'Clear search',
  'filters.reset': 'Reset',
  'filters.done': 'Done',
  'filters.remove': 'Remove {{chip}}',
  'table.empty': 'Nothing here yet.',
  'table.rowsOf': '{{from}}–{{to}} of {{count}}',
  'table.perPage': 'Rows per page',
  'table.previous': 'Previous page',
  'table.next': 'Next page',
  'table.first': 'First page',
  'table.last': 'Last page',
  'stat.of': 'of {{count}}',
  'stat.trend': '{{name}} over time',
  'stat.change.up': 'up by {{value}} since before',
  'stat.change.down': 'down by {{value}} since before',
  'stat.change.flat': 'no change since before',
  'state.up': 'Up',
  'state.ok': 'OK',
  'state.online': 'Online',
  'state.live': 'Live',
  'state.active': 'Active',
  'state.connected': 'Connected',
  'state.paid': 'Paid',
  'state.down': 'Down',
  'state.offline': 'Offline',
  'state.failed': 'Failed',
  'state.crit': 'Critical',
  'state.tripped': 'Tripped',
  'state.overdue': 'Overdue',
  'state.warn': 'Needs a look',
  'state.degraded': 'Degraded',
  'state.stale': 'Stale',
  'state.planning': 'Planning',
  'state.due': 'Due',
  'state.pending': 'Pending',
  'state.info': 'Info',
  'state.running': 'Running',
  'state.unknown': 'Unknown',
  'state.closed': 'Closed',
  'state.idle': 'Idle',
  'state.ended': 'Ended',
  'state.disconnected': 'Not connected',
  'state.draft': 'Draft',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'Like the device',
  'shell.menu': 'Menu',
  'shell.nav': 'Main',
  'shell.skip': 'Skip to content',
  'jump.label': 'Jump to',
  'jump.placeholder': 'Jump to a page or run a command',
  'jump.none': 'Nothing matches',
  'jump.recent': 'Recent',
  'jump.pick': 'pick',
  'jump.go': 'go',
  'jump.close': 'close',
  'keys.title': 'Keys',
  'keys.here': 'On this page',
  'keys.everywhere': 'Everywhere',
  'keys.notNow': '(not now)',
  'keys.none': 'No keys here.',
}

export const de: Messages = {
  'common.cancel': 'Abbrechen',
  'common.confirm': 'Ja, weiter',
  'common.areYouSure': '{{label}}: sicher?',
  'common.close': 'Schliessen',
  'common.loading': 'Wird geladen …',
  'common.retry': 'Nochmals versuchen',
  'common.delete': 'Löschen',
  'common.open': 'Öffnen',
  'common.nothingYet': 'Hier ist noch nichts.',
  'common.error': 'Etwas ist schiefgegangen: {{message}}',
  'filters.search': 'Suchen …',
  'filters.filter': 'Filter',
  'filters.clear': 'Filter löschen',
  'filters.clearSearch': 'Suche löschen',
  'filters.reset': 'Zurücksetzen',
  'filters.done': 'Fertig',
  'filters.remove': '{{chip}} entfernen',
  'table.empty': 'Hier ist noch nichts.',
  'table.rowsOf': '{{from}}–{{to}} von {{count}}',
  'table.perPage': 'Einträge pro Seite',
  'table.previous': 'Vorherige Seite',
  'table.next': 'Nächste Seite',
  'table.first': 'Erste Seite',
  'table.last': 'Letzte Seite',
  'stat.of': 'von {{count}}',
  'stat.trend': '{{name}} im Verlauf',
  'stat.change.up': 'um {{value}} gestiegen',
  'stat.change.down': 'um {{value}} gesunken',
  'stat.change.flat': 'unverändert',
  'state.up': 'Läuft',
  'state.ok': 'OK',
  'state.online': 'Online',
  'state.live': 'Live',
  'state.active': 'Aktiv',
  'state.connected': 'Verbunden',
  'state.paid': 'Bezahlt',
  'state.down': 'Ausgefallen',
  'state.offline': 'Offline',
  'state.failed': 'Fehlgeschlagen',
  'state.crit': 'Kritisch',
  'state.tripped': 'Ausgelöst',
  'state.overdue': 'Überfällig',
  'state.warn': 'Prüfen',
  'state.degraded': 'Eingeschränkt',
  'state.stale': 'Veraltet',
  'state.planning': 'In Planung',
  'state.due': 'Fällig',
  'state.pending': 'Ausstehend',
  'state.info': 'Info',
  'state.running': 'Läuft',
  'state.unknown': 'Unbekannt',
  'state.closed': 'Geschlossen',
  'state.idle': 'Untätig',
  'state.ended': 'Beendet',
  'state.disconnected': 'Nicht verbunden',
  'state.draft': 'Entwurf',
  'theme.light': 'Hell',
  'theme.dark': 'Dunkel',
  'theme.system': 'Wie das Gerät',
  'shell.menu': 'Menü',
  'shell.nav': 'Hauptmenü',
  'shell.skip': 'Zum Inhalt springen',
  'jump.label': 'Springen zu',
  'jump.placeholder': 'Zu einer Seite springen oder einen Befehl ausführen',
  'jump.none': 'Nichts passt',
  'jump.recent': 'Zuletzt',
  'jump.pick': 'wählen',
  'jump.go': 'los',
  'jump.close': 'schliessen',
  'keys.title': 'Tasten',
  'keys.here': 'Auf dieser Seite',
  'keys.everywhere': 'Überall',
  'keys.notNow': '(gerade nicht)',
  'keys.none': 'Hier gibt es keine Tasten.',
}

const BUILT_IN: Record<Locale, Messages> = { en: { ...en }, de: { ...de } }

/** Adds a package's own texts (the widgets do this on import). App texts still win. */
export function registerMessages(locale: Locale, messages: Messages) {
  Object.assign(BUILT_IN[locale], messages)
}

/** An app's translate function, such as i18next's `t`. Return undefined (or the key) when unknown. */
export type Translate = (key: string, vars?: Vars) => string | undefined

/** `{{name}}` placeholders, filled from `vars`. */
export function interpolate(text: string, vars: Vars = {}) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => String(vars[name] ?? ''))
}

/** A `t` over built-in texts in `locale`, the app's own `translate` first, then `messages`. */
export function createT(locale: Locale = 'en', translate?: Translate, messages: Messages = {}) {
  const plural = new Intl.PluralRules(locale)
  const lookup = (key: string) => messages[key] ?? BUILT_IN[locale][key]
  return (key: string, vars?: Vars): string => {
    const fromApp = translate?.(key, vars)
    if (fromApp !== undefined && fromApp !== key) return fromApp
    let text = lookup(key)
    if (vars?.count !== undefined && plural) {
      const form = plural.select(Number(vars.count))
      text = lookup(`${key}_${form}`) ?? lookup(`${key}_other`) ?? text
    }
    return interpolate(text ?? BUILT_IN.en[key] ?? key, vars)
  }
}

export type T = ReturnType<typeof createT>

interface I18n {
  t: T
  locale: Locale
}

const I18nContext = createContext<I18n>({ t: createT('en'), locale: 'en' })

export function I18nProvider({ locale = 'en', translate, messages, children }: {
  locale?: Locale
  translate?: Translate
  messages?: Messages
  children: ReactNode
}) {
  const value = useMemo(() => ({ t: createT(locale, translate, messages), locale }), [locale, translate, messages])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** The package's texts in the app's language. Shaped like react-i18next's hook. */
export function useT() {
  const { t, locale } = useContext(I18nContext)
  return { t, locale, i18n: { language: locale } }
}
