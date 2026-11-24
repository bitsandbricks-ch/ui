// Saved views from Mason: a list as someone set it up (the page, its filter and sort), under a name.
// Pure rules; the app keeps the list where it keeps settings, so every browser has it.

export interface SavedView {
  name: string
  /** The page and its query: "/hosts?state=down". */
  path: string
}

export const MAX_VIEWS = 30

/** The link a view keeps: the path and its query, without the parts that are not the view (the open
 *  side panel, the page number) and without empty values, the keys sorted so the same view is the
 *  same link. */
export function viewPath(pathname: string, search: string | URLSearchParams, drop: string[] = ['page', 'side']) {
  const params = new URLSearchParams(search)
  const kept = [...params.entries()].filter(([k, v]) => v !== '' && !drop.includes(k)).sort(([a], [b]) => a.localeCompare(b))
  const q = new URLSearchParams(kept).toString()
  return pathname + (q ? `?${q}` : '')
}

/** Adds a view, or renames onto it: one per name (any case) and one per link, newest last, at most
 *  MAX_VIEWS. A name is cut at 40 letters; an empty one changes nothing. */
export function addView(list: SavedView[], name: string, path: string) {
  const n = name.trim().slice(0, 40)
  if (!n) return list
  const rest = list.filter((v) => v.name.toLowerCase() !== n.toLowerCase() && v.path !== path)
  return [...rest, { name: n, path }].slice(-MAX_VIEWS)
}

export const removeView = (list: SavedView[], path: string) => list.filter((v) => v.path !== path)
