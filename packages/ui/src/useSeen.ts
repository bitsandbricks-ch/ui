import { useEffect, useMemo, useRef, useState } from 'react'
import { freshKeys, mergeSeen } from './table'

function read(storeKey: string): string[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(storeKey) || 'null')
    return Array.isArray(v) ? v : null
  } catch { return null }
}

/** "New since your last visit" for a list, remembered in this browser. `name` names the list (one per
 *  list and app: "floorbit:hosts"); `keys` are every row key loaded, not only the filtered ones. The
 *  first visit marks nothing. Leaving the page, or closing the tab, counts as having seen the rows.
 *  Pass `isNew` to DataTable. From Mason. */
export function useSeen(name: string, keys: string[]) {
  const storeKey = `bnb-seen:${name}`
  // What was seen before this visit: read once per list, so rows stay marked while the page is open.
  const [before] = useState(() => read(storeKey))
  const fresh = useMemo(() => freshKeys(before, keys), [before, keys])
  const latest = useRef(keys)
  useEffect(() => { latest.current = keys }, [keys])
  useEffect(() => {
    function save() {
      const now = latest.current
      if (!now.length) return // nothing loaded (an error, or left before the answer): keep what was there
      try { localStorage.setItem(storeKey, JSON.stringify(mergeSeen(read(storeKey), now))) } catch { /* private mode */ }
    }
    window.addEventListener('pagehide', save)
    return () => { window.removeEventListener('pagehide', save); save() }
  }, [storeKey])
  return { isNew: (key: string) => fresh.has(key), count: fresh.size }
}
