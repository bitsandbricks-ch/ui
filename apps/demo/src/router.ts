import { useSyncExternalStore } from 'react'

// A hash router in a few lines, so the showcase works on GitHub Pages (no server rewrites) and
// needs no router package. Apps pass their own router to BnbProvider (`link`, `useSearchParams`).
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const current = () => window.location.hash.replace(/^#/, '') || '/'

/** The path after the #: "/", "/hosts", "/hosts/web-3". */
export const usePath = () => useSyncExternalStore(subscribe, current, () => '/')

/** A link inside the showcase. */
export const href = (path: string) => `#${path}`

export const go = (path: string) => { window.location.hash = path }
