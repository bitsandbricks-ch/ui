import type { Widget, WidgetState } from '@bitsandbricks/ui'

// Made-up data for the showcase: a small network in three zones. Fixed numbers (no Math.random),
// so every visit and every screenshot looks the same.

export type HostState = 'up' | 'degraded' | 'down'

export interface Host {
  id: string
  name: string
  zone: 'zurich' | 'geneva' | 'basel'
  role: 'web' | 'db' | 'cache' | 'queue'
  state: HostState
  /** CPU load in per cent. */
  load: number
  /** Disk use in per cent. */
  disk: number
  address: string
  /** Minutes since it last answered. */
  seen: number
  owners: string[]
}

const ROLES: Host['role'][] = ['web', 'web', 'db', 'cache', 'queue']
const ZONES: Host['zone'][] = ['zurich', 'geneva', 'basel']
export const PEOPLE = ['Anna', 'Ben', 'Cleo', 'Dario', 'Elif', 'Finn']

export const hosts: Host[] = Array.from({ length: 36 }, (_, i) => {
  const role = ROLES[i % ROLES.length]
  const n = Math.floor(i / ROLES.length) + 1
  return {
    id: `h${i + 1}`,
    name: `${role}-${String(n + (i % 2) * 10).padStart(2, '0')}`,
    zone: ZONES[i % 3],
    role,
    state: i % 11 === 4 ? 'down' : i % 7 === 2 ? 'degraded' : 'up',
    load: (i * 37 + 11) % 97,
    disk: (i * 53 + 23) % 99,
    address: `192.0.2.${10 + i}`,
    seen: i % 11 === 4 ? 42 + i : i % 3,
    owners: [PEOPLE[i % PEOPLE.length], PEOPLE[(i + 2) % PEOPLE.length]].slice(0, 1 + (i % 2)),
  }
})

export const hostById = (id: string) => hosts.find((h) => h.id === id)

export const counts = {
  all: hosts.length,
  up: hosts.filter((h) => h.state === 'up').length,
  degraded: hosts.filter((h) => h.state === 'degraded').length,
  down: hosts.filter((h) => h.state === 'down').length,
}

// ── Dashboard widgets, in the shape a plugin's backend sends (`Widget` from @bitsandbricks/ui) ──

const base = { size: 'm', refresh: 60, sub: '', link: '' } as const
/** The end of every time series: this minute, so the charts and the history read "just now". */
export const NOW = Math.floor(Date.now() / 60_000) * 60
const minutes = (n: number, f: (i: number) => number): [number, number][] =>
  Array.from({ length: n }, (_, i) => [NOW - (n - 1 - i) * 60, Math.round(f(i))])

const stateOf = (s: HostState): WidgetState => (s === 'degraded' ? 'warn' : s)

export function widgets(t: (key: string) => string): Record<string, Widget> {
  return {
    clients: { ...base, id: 'clients', label: t('w.clients'), type: 'stat', value: 254, unit: '', tone: 'ok', min: 0, max: 400, sub: t('w.clientsSub') },
    power: { ...base, id: 'power', label: t('w.power'), type: 'stat', value: 71, unit: '%', tone: 'warn', min: 0, max: 100, sub: t('w.powerSub') },
    hosts: { ...base, id: 'hosts', label: t('w.hosts'), type: 'status', items: hosts.slice(0, 24).map((h) => ({ label: h.name, state: stateOf(h.state), detail: h.zone })) },
    zones: {
      ...base, id: 'zones', label: t('w.zones'), type: 'list',
      items: ZONES.map((z) => {
        const n = hosts.filter((h) => h.zone === z).reduce((sum, h) => sum + h.load, 0)
        return { label: t(`zone.${z}`), value: `${n}`, number: n, tone: '' as const }
      }),
    },
    roles: {
      ...base, id: 'roles', label: t('w.roles'), type: 'list',
      items: (['web', 'db', 'cache', 'queue'] as const).map((r) => {
        const n = hosts.filter((h) => h.role === r).length
        return { label: r, value: String(n), number: n, tone: '' as const }
      }),
    },
    uplink: {
      ...base, id: 'uplink', label: t('w.uplink'), type: 'series', unit: 'bit/s',
      series: [
        { label: t('w.in'), points: minutes(90, (i) => 4.2e8 + Math.sin(i / 6) * 1.6e8 + (i % 7) * 1e7) },
        { label: t('w.out'), points: minutes(90, (i) => 1.3e8 + Math.cos(i / 9) * 4e7 + (i % 5) * 6e6) },
      ],
      marks: [{ t: NOW - 50 * 60, label: t('w.deploy'), tone: 'info' }],
    },
    latency: {
      ...base, id: 'latency', label: t('w.latency'), type: 'series', unit: 'ms',
      series: [{ label: 'p95', points: minutes(60, (i) => 18 + ((i * 7) % 13) + (i > 40 && i < 46 ? 30 : 0)) }],
    },
    note: { ...base, id: 'note', label: t('w.note'), type: 'text', text: t('w.noteText') },
  }
}

// ── Notifications and history ──

export interface Problem { id: string; state: 'down' | 'warn'; host: string; minutes: number; kind: 'offline' | 'disk' | 'load' }

export const problems: Problem[] = hosts.flatMap((h): Problem[] => {
  if (h.state === 'down') return [{ id: `p-${h.id}`, state: 'down', host: h.id, minutes: h.seen, kind: 'offline' }]
  if (h.disk > 90) return [{ id: `p-${h.id}`, state: 'warn', host: h.id, minutes: 15 + h.disk, kind: 'disk' }]
  if (h.state === 'degraded') return [{ id: `p-${h.id}`, state: 'warn', host: h.id, minutes: 5 + h.load, kind: 'load' }]
  return []
})

/** Minutes ago as a time, for the timeline. */
export const ago = (min: number) => new Date(NOW * 1000 - min * 60_000)
