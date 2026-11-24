import { useState } from 'react'

/** Pages a list the browser already has (members, attendees): the current page's items and what
 *  Pager needs. The page stays in range when a search or filter shrinks the list. `showAll` turns
 *  paging off until it is turned back on. */
export function usePagedList<T>(items: T[], perPage = 50) {
  const [page, setPage] = useState(1)
  const [showAll, setShowAllState] = useState(false)
  const pages = Math.max(1, Math.ceil(items.length / Math.max(1, perPage)))
  const current = Math.min(page, pages)
  const shown = showAll ? items : items.slice((current - 1) * perPage, current * perPage)
  return {
    items: shown,
    page: current,
    perPage: showAll ? Math.max(items.length, 1) : perPage,
    total: items.length,
    showAll,
    setPage,
    setShowAll: (all: boolean) => {
      setShowAllState(all)
      setPage(1)
    },
    /** Back to page 1: call when the search or a filter changes. */
    reset: () => setPage(1),
  }
}
