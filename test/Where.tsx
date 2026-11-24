import { useSyncExternalStore } from 'react'

const subscribe = (cb: () => void) => {
  window.addEventListener('bnb:locationchange', cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener('bnb:locationchange', cb)
    window.removeEventListener('popstate', cb)
  }
}

/** Shows the address's query, so a test can check what a list wrote there. */
export function Where() {
  const search = useSyncExternalStore(subscribe, () => window.location.search)
  return <output data-testid="where">{search}</output>
}
