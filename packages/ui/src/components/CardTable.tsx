import { SimpleGrid, type SimpleGridProps } from '@mantine/core'
import { IconSearchOff } from '@tabler/icons-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useSearchParamsAdapter } from '../urlState'
import { EmptyState, LoadingState } from './feedback'
import { FilterBar, type FilterGroup } from './FilterBar'
import { Pager } from './Pager'
import { texts } from './CardTable.texts'

/** One filter of a CardTable: its choices, and which cards a choice keeps. */
export interface CardFilter<T> {
  key: string
  label: string
  options: { value: string; label: string }[]
  /** The choice that keeps every card ("all"). */
  defaultValue: string
  /** Whether a card stays under `value` (never asked for the default). */
  match: (item: T, value: string) => boolean
  kind?: FilterGroup['kind']
}

export interface CardTableProps<T> {
  items: T[]
  itemKey: (item: T) => string
  /** One card; it brings its own box (a Paper, an article). */
  renderCard: (item: T) => ReactNode
  /** The list's accessible name. */
  label: string
  /** The text the search field looks in; leave it out for no search field. */
  searchText?: (item: T) => string
  searchLabel?: string
  filters?: CardFilter<T>[]
  /** Cards per page; 0 shows them all. 24 by default: full rows at one to four columns, and
   *  cards usually draw more than a table row does. */
  pageSize?: number
  cols?: SimpleGridProps['cols']
  spacing?: SimpleGridProps['spacing']
  /** Shown when there are no cards at all: usually an EmptyState with the next step. */
  empty?: ReactNode
  /** Grey lines while the cards load. */
  loading?: boolean
  /** Right of the search: a "New" button, a view switch. */
  actions?: ReactNode
  /** Keep search, filters and page in the address (?q=…&page=2). Off where two lists share a page. */
  urlState?: boolean
}

type Values = { q: string; page: number; filters: Record<string, string> }

/** Where search, filters and page live: the address, or the component. */
function useCardState(filters: CardFilter<unknown>[], urlState: boolean) {
  const [params, setParams] = useSearchParamsAdapter()
  const [local, setLocal] = useState<Values>({ q: '', page: 1, filters: {} })
  const defaults = Object.fromEntries(filters.map((f) => [f.key, f.defaultValue]))
  const values: Values = urlState
    ? {
      q: params.get('q') ?? '',
      page: Math.max(1, Number(params.get('page')) || 1),
      filters: Object.fromEntries(filters.map((f) => [f.key, params.get(f.key) ?? f.defaultValue])),
    }
    : { ...local, filters: { ...defaults, ...local.filters } }
  const write = (next: Values) => {
    if (!urlState) { setLocal(next); return }
    setParams((p) => {
      const out = new URLSearchParams(p)
      if (next.q) out.set('q', next.q); else out.delete('q')
      if (next.page > 1) out.set('page', String(next.page)); else out.delete('page')
      for (const f of filters) {
        const v = next.filters[f.key]
        if (v && v !== f.defaultValue) out.set(f.key, v); else out.delete(f.key)
      }
      return out
    }, { replace: true })
  }
  return {
    values,
    // A new search or filter starts again on page 1.
    setSearch: (q: string) => write({ ...values, q, page: 1 }),
    setFilter: (key: string, v: string) => write({ ...values, filters: { ...values.filters, [key]: v }, page: 1 }),
    setPage: (page: number) => write({ ...values, page }),
    clear: () => write({ q: '', page: 1, filters: defaults }),
  }
}

/** Cards with a table's search, filters and pages: galleries such as dashboard widgets, plugins or
 *  templates, where each item is best seen drawn rather than as a row. */
export function CardTable<T>({
  items, itemKey, renderCard, label, searchText, searchLabel, filters = [], pageSize = 24,
  cols = { base: 1, sm: 2, lg: 3 }, spacing = 'lg', empty, loading, actions, urlState = false,
}: CardTableProps<T>) {
  const { t } = useT(texts)
  const state = useCardState(filters as CardFilter<unknown>[], urlState)
  const { q, filters: chosen } = state.values
  const needle = q.trim().toLocaleLowerCase()

  const keep = useMemo(() => {
    const bySearch = (item: T) => !needle || !searchText || searchText(item).toLocaleLowerCase().includes(needle)
    const byFilters = (item: T, skip?: string) => filters.every((f) =>
      f.key === skip || chosen[f.key] === f.defaultValue || f.match(item, chosen[f.key]))
    return { bySearch, byFilters }
  }, [needle, searchText, filters, chosen])

  const shown = useMemo(() => items.filter((i) => keep.bySearch(i) && keep.byFilters(i)), [items, keep])

  const groups: FilterGroup[] = filters.map((f) => {
    // A choice's count: what it would show with the search and the other filters as they are.
    const base = items.filter((i) => keep.bySearch(i) && keep.byFilters(i, f.key))
    return {
      key: f.key, label: f.label, kind: f.kind, value: chosen[f.key], defaultValue: f.defaultValue,
      onChange: (v: string) => state.setFilter(f.key, v),
      options: f.options.map((o) => ({
        ...o, count: o.value === f.defaultValue ? base.length : base.filter((i) => f.match(i, o.value)).length,
      })),
    }
  })

  const per = pageSize > 0 ? pageSize : Math.max(1, shown.length)
  const pages = Math.max(1, Math.ceil(shown.length / per))
  const page = Math.min(state.values.page, pages)
  const onPage = shown.slice((page - 1) * per, page * per)

  return (
    <div className="bnb-cardtable">
      {/* With nothing to search or filter, only the actions stay (a "New" button). */}
      <FilterBar search={searchText ? q : undefined} onSearchChange={searchText && items.length ? state.setSearch : undefined}
        searchLabel={searchLabel} groups={items.length ? groups : []} actions={actions} onClear={state.clear} />
      {loading ? <LoadingState lines={3} /> : !items.length ? (empty ?? <EmptyState title={t('table.empty')} />) : !shown.length ? (
        // The filter bar above already offers "Clear filters".
        <EmptyState icon={<IconSearchOff size={24} />} title={t('cards.noMatch')} />
      ) : (
        <>
          <SimpleGrid cols={cols} spacing={spacing} role="list" aria-label={label}>
            {onPage.map((item) => <div key={itemKey(item)} role="listitem" className="bnb-cardtable-item">{renderCard(item)}</div>)}
          </SimpleGrid>
          {pageSize > 0 && (
            <div className="bnb-cardtable-pager">
              <Pager page={page} perPage={per} total={shown.length} onPage={state.setPage}
                rangeLabel={(from, to, count) => t('cards.itemsOf', { from, to, count })} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
