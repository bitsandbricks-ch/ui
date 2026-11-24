import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'

// Lists keep their sort, page, search and filters in the address (?sort=name&page=2), so a link
// or a reload shows the same view. The package has no router: an app with React Router passes its
// useSearchParams to BnbProvider; without one the address is read and written directly.

export type SetSearchParams = (
  change: (prev: URLSearchParams) => URLSearchParams,
  options?: { replace?: boolean },
) => void

export type UseSearchParams = () => readonly [URLSearchParams, SetSearchParams]

const EVENT = 'bnb:locationchange'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

const read = () => window.location.search

/** The fallback: window.location and history.replaceState. */
export const useWindowSearchParams: UseSearchParams = () => {
  const search = useSyncExternalStore(subscribe, read, () => '')
  const params = new URLSearchParams(search)
  const set: SetSearchParams = (change, options) => {
    const next = change(new URLSearchParams(window.location.search))
    const query = next.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    if (options?.replace === false) window.history.pushState(window.history.state, '', url)
    else window.history.replaceState(window.history.state, '', url)
    window.dispatchEvent(new Event(EVENT))
  }
  return [params, set] as const
}

const SearchParamsContext = createContext<UseSearchParams>(useWindowSearchParams)

export function SearchParamsProvider({ hook, children }: { hook?: UseSearchParams; children: ReactNode }) {
  return <SearchParamsContext.Provider value={hook ?? useWindowSearchParams}>{children}</SearchParamsContext.Provider>
}

/** The address's query, through the app's router when it gave one. */
export function useSearchParamsAdapter() {
  const hook = useContext(SearchParamsContext)
  return hook()
}

/** A link component (React Router's Link) for "Open" buttons; a plain <a> by default. */
export type LinkComponent = React.ElementType<{ to: string; href?: string; children?: ReactNode }>
