// One look per state on every page and in every app: "offline" is red everywhere.

/** The four looks a state can have: working, broken, needs a look, nothing to say. */
export type Tone = 'ok' | 'warn' | 'err' | 'off'

/** A tone that also allows "no tone" (''), as plugin widgets send it. */
export type MaybeTone = Tone | 'info' | ''

/** Every state word the apps use, and its one tone. Labels are `state.<word>`. */
export const STATE_TONE = {
  up: 'ok', ok: 'ok', online: 'ok', live: 'ok', active: 'ok', connected: 'ok', paid: 'ok', running: 'ok',
  down: 'err', offline: 'err', failed: 'err', crit: 'err', tripped: 'err', overdue: 'err',
  warn: 'warn', degraded: 'warn', stale: 'warn', planning: 'warn', due: 'warn', pending: 'warn',
  unknown: 'off', closed: 'off', idle: 'off', ended: 'off', disconnected: 'off', draft: 'off', info: 'off',
} as const satisfies Record<string, Tone>

/** A state word the apps share. */
export type State = keyof typeof STATE_TONE

/** The tone of a state word; words the map doesn't know have nothing to say. */
export const toneOf = (state: string | null | undefined): Tone =>
  (state && (STATE_TONE as Record<string, Tone>)[state]) || 'off'

/** The Mantine colour for a tone (the theme registers ok, warn and err). */
export const toneColor = (tone: Tone): string => (tone === 'off' ? 'gray' : tone)

/** Floorbit's older tone names (up, down) and Hubra's (success, danger), mapped to the shared ones. */
export function normalizeTone(tone: string | null | undefined): Tone {
  switch (tone) {
    case 'ok': case 'up': case 'success': case 'green': return 'ok'
    case 'warn': case 'warning': case 'orange': return 'warn'
    case 'err': case 'down': case 'danger': case 'error': case 'red': return 'err'
    default: return 'off'
  }
}
