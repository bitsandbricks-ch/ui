import type { ComponentType } from 'react'
import type { MaybeTone } from './status'

// The plugin UI contract the apps share. Two halves, each from the app that had it:
//   - components a plugin's frontend bundle registers (Hubra's PluginDefinition): pages, tabs,
//     slots, search and dashboard widgets;
//   - data a plugin's backend sends (Floorbit's widgets and tiles), which the app draws with
//     @bitsandbricks-ch/widgets, so a plugin needs no frontend code for a number or a chart.
// Each app names its own slots: `PluginDefinition<MySlots>`.

/** Shown only while `module` is on and the user has `perm`. */
export interface PluginGate {
  module?: string
  perm?: string
  order?: number
}

/** A page of its own, under the app's plugin path. */
export interface PluginRoute extends PluginGate {
  path: string
  component: ComponentType
}

/** A tab on one of the app's pages. */
export interface PluginTab extends PluginGate {
  /** The page it goes on, named by the app. */
  screen: string
  id: string
  /** A translation key. */
  label: string
  component: ComponentType
  /** The tab this one sits under as a sub-tab, when the page groups its tabs. */
  group?: string
}

/** A component the app renders at one of its named slots, with that slot's props. */
export interface PluginSlotEntry<Slots extends object = Record<string, object>, K extends keyof Slots = keyof Slots> extends PluginGate {
  slot: K
  component: ComponentType<Slots[K]>
}

/** One thing a plugin's search found; matched on `label`, `sub` and `keywords`. */
export interface SearchHit {
  id: string | number
  label: string
  sub?: string
  /** The app path it opens. */
  path: string
  /** More text to match, not shown. */
  keywords?: string
}

/** A list the app's search (Ctrl K) looks through. */
export interface PluginSearch extends PluginGate {
  id: string
  /** A translation key: the label on each hit. */
  label: string
  /** Loaded once the search is first used. */
  load: () => Promise<SearchHit[]>
}

/** How wide a widget starts: s (a third), m (half), l (full). */
export type WidgetSize = 's' | 'm' | 'l'

/** Floorbit's older sizes, mapped. */
export const widgetSize = (size: string | undefined): WidgetSize =>
  size === 'wide' ? 'l' : size === 'small' ? 's' : size === 'm' || size === 'l' ? size : 's'

/** A field a user fills in when adding a widget. */
export interface WidgetField {
  key: string
  /** A translation key. */
  label: string
  kind: 'text' | 'number' | 'switch'
  default?: string | number | boolean
}

/** A dashboard widget drawn by the plugin's own component. */
export interface PluginWidget extends PluginGate {
  id: string
  /** Translation keys: its name and one line on what it shows. */
  label: string
  description?: string
  size?: WidgetSize
  fields?: WidgetField[]
  /** The backend widget contract it draws; the component then gets that data as `data`. */
  contract?: string
  component: ComponentType<{ config: Record<string, unknown>; size: WidgetSize; data?: unknown }>
}

/** What a plugin's frontend bundle exports. */
export interface PluginDefinition<Slots extends object = Record<string, object>> {
  /** The plugin's id, as in its manifest. */
  id: string
  routes?: PluginRoute[]
  tabs?: PluginTab[]
  slots?: { [K in keyof Slots]: PluginSlotEntry<Slots, K> }[keyof Slots][]
  search?: PluginSearch[]
  widgets?: PluginWidget[]
  /** Icons its menu entries name. */
  icons?: Record<string, ComponentType<{ size?: number }>>
  /** Translations by language (`en`, `de-CH`), nested like translation.json. */
  translations?: Record<string, Record<string, unknown>>
}

// ── Data a plugin's backend sends ────────────────────────────────────────────

/** The state of one thing in a status widget. */
export type WidgetState = 'up' | 'down' | 'warn' | 'unknown'

interface WidgetBase {
  id: string
  label: string
  size: WidgetSize | 'small' | 'wide'
  /** Seconds between refreshes; 0 for never. */
  refresh: number
  /** One line under it. */
  sub: string
  /** Where "Details" leads. */
  link: string
}

/** A widget's data: what the backend answers, and what @bitsandbricks-ch/widgets draws. */
export type Widget = WidgetBase & (
  /** `min` and `max` let a stat show as a gauge. `text` replaces the number when set. */
  | { type: 'stat'; value: number | string; unit: string; tone: MaybeTone; min?: number; max?: number; text?: string }
  | { type: 'status'; items: { label: string; state: WidgetState; detail: string; device?: string }[] }
  /** `number` (and `max`) on items let a list show as bars or a pie. */
  | { type: 'list'; items: { label: string; value: string; tone: MaybeTone; number?: number; max?: number; colour?: string; device?: string }[] }
  | { type: 'table'; columns: { key: string; label: string }[]; rows: Record<string, string>[] }
  | { type: 'sparkline'; points: number[]; value?: number; min?: number; max?: number; unit: string }
  /** Up to four lines of [unix seconds, value], oldest first, and what happened when. */
  | {
      type: 'series'
      series: { label: string; points: [number, number][]; colour?: string; ghost?: boolean }[]
      unit: string
      marks?: { t: number; label: string; tone: MaybeTone }[]
    }
)

/** A data widget a plugin offers on a page or dashboard; the app fetches `url` for its Widget. */
export interface WidgetTile {
  kind?: 'widget'
  plugin: string
  plugin_name: string
  id: string
  label: string
  size: WidgetSize | 'small' | 'wide'
  refresh: number
  url: string
  /** It takes `?range=` and `?compare=`. */
  ranges?: boolean
  /** It can mark events on its graph (`?marks=1`). */
  marks?: boolean
}

/** A button a plugin offers; `danger` asks first. */
export interface ActionTile {
  kind: 'action'
  plugin: string
  plugin_name: string
  id: string
  label: string
  danger: boolean
  url: string
}

export type Tile = WidgetTile | ActionTile

/** What an action answers. */
export interface ActionResult {
  ok: boolean
  message: string
  data?: Record<string, unknown>
}

/** A plugin's own page made of tiles, with no frontend code of its own. */
export interface PluginPage {
  plugin: string
  plugin_name: string
  icon: string
  id: string
  label: string
  columns: number
  tiles: Tile[]
}
