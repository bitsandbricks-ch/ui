import type { NavGroup, NavItem } from './components/AppShell'

/** A sidebar group the person may rearrange. `id` is stable across releases (it is saved in their
 *  prefs). A `locked` group (the account links, say) stays where it is: its entries can't be pinned,
 *  hidden or moved, and nothing moves into it. */
export interface NavSection extends NavGroup {
  id: string
  locked?: boolean
}

/** A category the person made for their sidebar. */
export interface NavCategory {
  id: string
  label: string
}

/**
 * One person's sidebar, as the app saves it (on the account, or in localStorage): entries pinned
 * to the top (in this order), entries put away under "More" (`hidden`), their own order, entries
 * moved to another group (`sections`: entry id to group or category id), categories of their own,
 * and their own names for the headings (`labels`). Every field is optional, so an empty object is
 * the app's own sidebar, and ids that no longer exist are ignored.
 */
export interface NavPrefs {
  pinned?: string[]
  hidden?: string[]
  order?: string[]
  sections?: Record<string, string>
  categories?: NavCategory[]
  labels?: Record<string, string>
}

export const NO_NAV_PREFS: NavPrefs = {}

/** The group ids the package uses for the favourites on top and for "More". */
export const NAV_FAVOURITES = '_favourites'
export const NAV_MORE = '_more'

/** One group as the customise dialog shows it. */
export interface NavCustomGroup {
  id: string
  label: string
  items: NavItem[]
  kind: 'favourites' | 'section' | 'category' | 'more'
}

/** Where each entry sits in the app's own sidebar: entry id to group id. */
export type NavHomes = Record<string, string>

export interface CustomNav {
  /** The sidebar to draw: favourites first, then the groups and the person's categories. */
  nav: NavSection[]
  /** The entries put away under "More", in sidebar order; show them behind a "More" link or page. */
  more: NavItem[]
  /** The groups of the customise dialog. */
  groups: NavCustomGroup[]
  homes: NavHomes
}

/**
 * Applies a person's prefs to the app's sidebar. Entries the app adds later appear at their default
 * place; entries the person put somewhere keep that place. Pure, so the app can call it in render.
 */
export function customizeNav(sections: NavSection[], prefs: NavPrefs = NO_NAV_PREFS,
  names: { favourites: string; more: string } = { favourites: 'Favourites', more: 'More' }): CustomNav {
  const homes: NavHomes = {}
  const locked = new Set<string>()
  const items = new Map<string, NavItem>()
  sections.forEach((s) => s.items.forEach((item) => {
    homes[item.id] = s.id
    items.set(item.id, item)
    if (s.locked) locked.add(item.id)
  }))
  const categories = prefs.categories ?? []
  const own = new Set(categories.map((c) => c.id))
  const open = new Set(sections.filter((s) => !s.locked).map((s) => s.id))
  const hidden = new Set((prefs.hidden ?? []).filter((id) => items.has(id) && !locked.has(id)))
  const pinned = (prefs.pinned ?? []).filter((id, i, all) => items.has(id) && !locked.has(id) && !hidden.has(id) && all.indexOf(id) === i)
  const label = (id: string, fallback?: string) => prefs.labels?.[id] ?? categories.find((c) => c.id === id)?.label ?? fallback ?? ''

  // Where each entry goes: its own group, or the one the person moved it to (if that still exists).
  const placeOf = (id: string) => {
    if (locked.has(id)) return homes[id]
    if (hidden.has(id)) return NAV_MORE
    const moved = prefs.sections?.[id]
    return moved && (open.has(moved) || own.has(moved)) ? moved : homes[id]
  }
  const order = prefs.order ?? []
  const rank = (id: string) => { const i = order.indexOf(id); return i < 0 ? Number.MAX_SAFE_INTEGER : i }
  const all = [...items.keys()].map((id, i) => ({ id, i })).sort((a, b) => rank(a.id) - rank(b.id) || a.i - b.i).map((e) => e.id)
  const byGroup = new Map<string, NavItem[]>()
  for (const id of all) {
    const where = placeOf(id)
    byGroup.set(where, [...(byGroup.get(where) ?? []), items.get(id)!])
  }

  // The groups in sidebar order: the app's, with the person's categories after its last open group.
  const lastOpen = sections.map((s) => !s.locked).lastIndexOf(true)
  const ordered: { id: string; label: string; kind: 'section' | 'category'; locked?: boolean }[] = []
  sections.forEach((s, i) => {
    ordered.push({ id: s.id, label: label(s.id, s.label), kind: 'section', locked: s.locked })
    if (i === lastOpen) categories.forEach((c) => ordered.push({ id: c.id, label: c.label, kind: 'category' }))
  })
  if (lastOpen < 0) categories.forEach((c) => ordered.push({ id: c.id, label: c.label, kind: 'category' }))

  const inGroup = (id: string) => (byGroup.get(id) ?? []).filter((item) => !pinned.includes(item.id))
  const favourites = pinned.map((id) => items.get(id)!)
  const nav: NavSection[] = []
  if (favourites.length) nav.push({ id: NAV_FAVOURITES, label: label(NAV_FAVOURITES, names.favourites), items: favourites })
  for (const g of ordered) {
    const list = inGroup(g.id)
    if (list.length) nav.push({ id: g.id, label: g.label || undefined, items: list, locked: g.locked })
  }
  const more = byGroup.get(NAV_MORE) ?? []

  // The dialog shows every open group, empty ones too, so entries can be moved into them.
  const groups: NavCustomGroup[] = []
  if (favourites.length) groups.push({ id: NAV_FAVOURITES, label: label(NAV_FAVOURITES, names.favourites), items: favourites, kind: 'favourites' })
  for (const g of ordered) if (!g.locked) groups.push({ id: g.id, label: g.label, items: inGroup(g.id), kind: g.kind })
  if (more.length) groups.push({ id: NAV_MORE, label: names.more, items: more, kind: 'more' })
  return { nav, more, groups, homes }
}

/** Prefs with `id` in `group` (NAV_MORE puts it away). */
function placeIn(prefs: NavPrefs, homes: NavHomes, id: string, group: string): NavPrefs {
  const hidden = (prefs.hidden ?? []).filter((h) => h !== id)
  const sections = { ...prefs.sections }
  if (group === NAV_MORE) {
    // Where it sat before stays known, for the way back.
    return { ...prefs, hidden: [...hidden, id], pinned: (prefs.pinned ?? []).filter((p) => p !== id), sections }
  }
  if (homes[id] === group) delete sections[id]
  else sections[id] = group
  return { ...prefs, hidden, sections }
}

/** Prefs that keep `ids` in this order, ahead of every entry the person never moved. */
function withOrder(prefs: NavPrefs, ids: string[]): NavPrefs {
  return { ...prefs, order: [...(prefs.order ?? []).filter((o) => !ids.includes(o)), ...ids] }
}

/** Pins `id` to the favourites on top, or takes it off. A pinned entry leaves "More". */
export function toggleNavPin(prefs: NavPrefs, id: string): NavPrefs {
  const pinned = prefs.pinned ?? []
  if (pinned.includes(id)) return { ...prefs, pinned: pinned.filter((p) => p !== id) }
  return { ...prefs, pinned: [...pinned, id], hidden: (prefs.hidden ?? []).filter((h) => h !== id) }
}

/** Puts `id` away under "More", or brings it back to the group it came from. */
export function toggleNavMore(prefs: NavPrefs, homes: NavHomes, id: string): NavPrefs {
  if (!(prefs.hidden ?? []).includes(id)) return placeIn(prefs, homes, id, NAV_MORE)
  return placeIn(prefs, homes, id, prefs.sections?.[id] ?? homes[id])
}

/**
 * Moves `id` one step up (-1) or down (+1) as the dialog shows it. Within a group it swaps with its
 * neighbour; past the first or last entry it moves into the group above or below ("More" included).
 * Favourites stay among themselves.
 */
export function moveNavItem(prefs: NavPrefs, groups: NavCustomGroup[], homes: NavHomes, id: string, step: -1 | 1): NavPrefs {
  const g = groups.findIndex((group) => group.items.some((item) => item.id === id))
  if (g < 0) return prefs
  const group = groups[g]
  const ids = group.items.map((item) => item.id)
  const i = ids.indexOf(id)
  const j = i + step
  if (j >= 0 && j < ids.length) {
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    if (group.kind === 'favourites') return { ...prefs, pinned: [...ids, ...(prefs.pinned ?? []).filter((p) => !ids.includes(p))] }
    return withOrder(prefs, ids)
  }
  const target = groups[g + step]
  if (!target || group.kind === 'favourites' || target.kind === 'favourites') return prefs
  const into = target.items.map((item) => item.id)
  // Down lands at the top of the next group, up at the bottom of the one above.
  return withOrder(placeIn(prefs, homes, id, target.id), step > 0 ? [id, ...into] : [...into, id])
}

/** Whether `id` can move one step, as moveNavItem would move it. */
export function canMoveNavItem(groups: NavCustomGroup[], g: number, index: number, step: -1 | 1): boolean {
  const group = groups[g]
  const j = index + step
  if (j >= 0 && j < group.items.length) return true
  const target = groups[g + step]
  return !!target && group.kind !== 'favourites' && target.kind !== 'favourites'
}

/** A new, empty category of the person's own, after the others. */
export function addNavCategory(prefs: NavPrefs, label: string): { prefs: NavPrefs; id: string } {
  const taken = new Set((prefs.categories ?? []).map((c) => c.id))
  let n = 1
  while (taken.has(`c${n}`)) n += 1
  const id = `c${n}`
  return { id, prefs: { ...prefs, categories: [...(prefs.categories ?? []), { id, label: label.trim() }] } }
}

/** Renames a heading or one of the person's categories. An empty name gives a heading its own
 *  name back (and leaves a category as it was). */
export function renameNavSection(prefs: NavPrefs, id: string, label: string): NavPrefs {
  const name = label.trim()
  const categories = prefs.categories ?? []
  if (categories.some((c) => c.id === id)) {
    return name ? { ...prefs, categories: categories.map((c) => (c.id === id ? { ...c, label: name } : c)) } : prefs
  }
  const labels = { ...prefs.labels }
  if (name) labels[id] = name
  else delete labels[id]
  return { ...prefs, labels }
}

/** Removes a category of the person's own; its entries go back to their own groups. */
export function removeNavCategory(prefs: NavPrefs, id: string): NavPrefs {
  return {
    ...prefs,
    sections: Object.fromEntries(Object.entries(prefs.sections ?? {}).filter(([, s]) => s !== id)),
    categories: (prefs.categories ?? []).filter((c) => c.id !== id),
  }
}

/** Whether the person changed anything, so "Reset" has something to undo. */
export function navPrefsChanged(prefs: NavPrefs): boolean {
  return Boolean(prefs.pinned?.length || prefs.hidden?.length || prefs.order?.length || prefs.categories?.length
    || Object.keys(prefs.sections ?? {}).length || Object.keys(prefs.labels ?? {}).length)
}
