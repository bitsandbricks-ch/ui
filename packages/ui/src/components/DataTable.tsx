import { ActionIcon, Group, Pagination, Paper, Table, Text, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconSelector } from '@tabler/icons-react'
import {
  flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type PaginationState, type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useSearchParamsAdapter } from '../urlState'
import { LoadingState } from './feedback'

/** Natural order for names and addresses (sw-2 before sw-10, 198.51.100.9 before .10). */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** One column of a DataTable: what it shows, and how it sorts when it sorts. */
export interface DataColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /** The value to sort by; leave it out for a column that doesn't sort. */
  sort?: (row: T) => string | number | null | undefined
  /** The first click sorts from the most (or latest) down, for counts, rates and times. */
  descFirst?: boolean
  /** CSS width, e.g. 44 or '20%'. */
  width?: number | string
  mono?: boolean
  /** Numbers line up on the right. */
  numeric?: boolean
  /** Lets long text wrap; other cells stay on one line. */
  wrap?: boolean
  /** Left out on a phone, where the table keeps only what names the row. */
  hideOnPhone?: boolean
  /** With `cards` on a phone: 'inline' shares the card's first line, 'actions' goes to its top
   *  right corner, 'label' gets the column's name in front. */
  card?: 'inline' | 'actions' | 'label'
  className?: string
}

export interface DataTableProps<T> {
  rows: T[]
  columns: DataColumn<T>[]
  /** A stable id per row; the index is there for lists without one, such as log lines. */
  rowKey: (row: T, index: number) => string
  /** The table's accessible name. */
  label: string
  defaultSort?: { id: string; desc?: boolean }
  /** Rows per page; 0 shows them all. 50 by default (handbook). */
  pageSize?: number
  /** Shown instead of the table when there are no rows: usually an EmptyState. */
  empty?: ReactNode
  /** Grey lines instead of the table while the rows load. */
  loading?: boolean
  /** The line under the table, e.g. "12 devices"; it gets the row count. */
  count?: (n: number) => ReactNode
  rowStyle?: (row: T) => CSSProperties | undefined
  /** Extra attributes for a row, such as the class and aria-selected of the selected one. */
  rowProps?: (row: T) => HTMLAttributes<HTMLTableRowElement> | undefined
  /** A click on a row (opens a SidePanel). Rows get a pointer and Enter opens them too. */
  onRowClick?: (row: T) => void
  /** Keep the sort and page in the address (?sort=name&page=2). Off where several tables share a page. */
  urlState?: boolean
  density?: 'default' | 'compact'
  /** On a phone each row becomes a small card instead of a narrow table (`card` on the columns). */
  cards?: boolean
  striped?: boolean
  /** Below this width the table scrolls sideways instead of squeezing. */
  minWidth?: number
  /** Without the bordered box, for tables that already sit inside one. */
  bare?: boolean
  className?: string
  /** Without the header row, for a plain list. */
  head?: boolean
  /** 'compact': one short line ("1–8 of 40" and arrows) instead of the page buttons. */
  pager?: 'full' | 'compact'
  /** The page shown, counted from 0, when the caller turns pages itself. */
  page?: number
  onPage?: (index: number) => void
}

/** The one table every page uses: sorting on the columns that can, paging, the empty state and
 *  the count. Search and filters sit above it (FilterBar) and narrow `rows`. From Floorbit. */
export function DataTable<T>(props: DataTableProps<T>) {
  const { rows, columns, rowKey, label, defaultSort, pageSize = 50, empty, loading, count, rowStyle, rowProps, onRowClick,
    urlState = true, density = 'default', minWidth, bare, className, striped, cards, head = true, pager = 'full', page, onPage } = props
  const { t } = useT()
  const [params, setParams] = useSearchParamsAdapter()
  const initialSort: SortingState = defaultSort ? [{ id: defaultSort.id, desc: !!defaultSort.desc }] : []
  const [localSort, setLocalSort] = useState<SortingState>(initialSort)
  const [localPage, setLocalPage] = useState(0)

  // In the address: ?sort=name or ?sort=-name, and ?page=2 (counted from 1 for people).
  const sorting: SortingState = (() => {
    if (!urlState) return localSort
    const raw = params.get('sort')
    const desc = !!raw?.startsWith('-')
    const id = raw ? (desc ? raw.slice(1) : raw) : ''
    // A ?sort= left by another table on the same address names no column here.
    return columns.some((c) => c.id === id && c.sort) ? [{ id, desc }] : initialSort
  })()
  const pageIndex = page ?? (urlState ? Math.max(0, (Number(params.get('page')) || 1) - 1) : localPage)

  const setUrl = (change: (p: URLSearchParams) => void) =>
    setParams((p) => { const next = new URLSearchParams(p); change(next); return next }, { replace: true })
  const setSorting = (next: SortingState) => {
    if (!urlState) { setLocalSort(next); setLocalPage(0); onPage?.(0); return }
    setUrl((p) => {
      const s = next[0]
      const same = s && defaultSort && s.id === defaultSort.id && s.desc === !!defaultSort.desc
      if (!s || same) p.delete('sort'); else p.set('sort', `${s.desc ? '-' : ''}${s.id}`)
      p.delete('page')
    })
  }
  const setPage = (index: number) => {
    if (onPage) { onPage(index); return }
    if (!urlState) { setLocalPage(index); return }
    setUrl((p) => { if (index > 0) p.set('page', String(index + 1)); else p.delete('page') })
  }

  const defs = useMemo<ColumnDef<T>[]>(() => columns.map((c) => ({
    id: c.id,
    accessorFn: c.sort ? (row: T) => c.sort?.(row) ?? '' : undefined,
    enableSorting: !!c.sort,
    sortingFn: (a, b, id) => {
      const x = a.getValue<string | number>(id)
      const y = b.getValue<string | number>(id)
      return typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y))
    },
    cell: ({ row }) => c.cell(row.original),
    header: () => c.header,
  })), [columns])

  const paged = pageSize > 0
  const pages = paged ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const pagination: PaginationState = { pageIndex: Math.min(pageIndex, pages - 1), pageSize: paged ? pageSize : Math.max(1, rows.length) }
  // The table's functions are only read while rendering, so the compiler not memoizing it is fine.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { sorting, pagination },
    onSortingChange: (u) => setSorting(typeof u === 'function' ? u(sorting) : u),
    onPaginationChange: (u) => setPage((typeof u === 'function' ? u(pagination) : u).pageIndex),
    getRowId: (row, index) => rowKey(row, index),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
    autoResetPageIndex: false,
  })

  if (loading) return <LoadingState lines={5} />
  if (!rows.length) return <>{empty ?? <Text c="dimmed">{t('table.empty')}</Text>}</>

  const byId = new Map(columns.map((c) => [c.id, c]))
  const cellClass = (c?: DataColumn<T>) => [
    c?.className, c?.hideOnPhone && 'bnb-dt-phone-hide', c?.mono && 'bnb-dt-mono', c?.wrap && 'bnb-dt-wrap', c?.numeric && 'bnb-dt-num',
    cards && c?.card === 'inline' && 'bnb-stack-inline', cards && c?.card === 'actions' && 'bnb-stack-actions',
  ].filter(Boolean).join(' ') || undefined
  const body = (
    <div className="bnb-dt-scroll" style={minWidth ? ({ '--bnb-dt-min': `${minWidth}px` } as CSSProperties) : undefined}>
      <Table highlightOnHover striped={striped} verticalSpacing={density === 'compact' ? 4 : 8} fz="sm" aria-label={label}
        className={['bnb-dt', density === 'compact' && 'is-compact', cards && 'bnb-table-stack', onRowClick && 'is-clickable', className].filter(Boolean).join(' ')}>
        {head && (
          <Table.Thead>
            {table.getHeaderGroups().map((hg) => (
              <Table.Tr key={hg.id}>
                {hg.headers.map((h) => {
                  const c = byId.get(h.column.id)
                  const sorted = h.column.getIsSorted()
                  return (
                    <Table.Th key={h.id} w={c?.width} className={cellClass(c)}
                      aria-sort={sorted ? (sorted === 'desc' ? 'descending' : 'ascending') : undefined}>
                      {h.column.getCanSort() ? (
                        <UnstyledButton className="bnb-sort" onClick={() => setSorting([{ id: h.column.id, desc: sorted ? sorted === 'asc' : !!c?.descFirst }])}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sorted === 'asc' ? <IconChevronUp size={12} /> : sorted === 'desc' ? <IconChevronDown size={12} />
                            : <IconSelector size={12} className="bnb-dt-sortable" aria-hidden />}
                        </UnstyledButton>
                      ) : flexRender(h.column.columnDef.header, h.getContext())}
                    </Table.Th>
                  )
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
        )}
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id} {...rowProps?.(row.original)} style={rowStyle?.(row.original)}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(row.original) } : undefined}
              tabIndex={onRowClick ? 0 : undefined}>
              {row.getVisibleCells().map((cell) => {
                const c = byId.get(cell.column.id)
                return (
                  <Table.Td key={cell.id} className={cellClass(c)}
                    data-label={cards && c?.card === 'label' && typeof c.header === 'string' ? c.header : undefined}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                )
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  )
  const first = pagination.pageIndex * pagination.pageSize
  return (
    <>
      {bare ? body : <Paper withBorder className="bnb-dt-box">{body}</Paper>}
      {pager === 'compact' ? pages > 1 && (
        <div className="bnb-dt-pager">
          <span>{t('table.rowsOf', { from: first + 1, to: Math.min(rows.length, first + pagination.pageSize), count: rows.length })}</span>
          <ActionIcon size="sm" variant="subtle" color="gray" disabled={pagination.pageIndex === 0} aria-label={t('table.previous')}
            onClick={() => setPage(pagination.pageIndex - 1)}><IconChevronLeft size={14} /></ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="gray" disabled={pagination.pageIndex >= pages - 1} aria-label={t('table.next')}
            onClick={() => setPage(pagination.pageIndex + 1)}><IconChevronRight size={14} /></ActionIcon>
        </div>
      ) : (count || pages > 1) && (
        <Group justify="space-between" mt="sm">
          <Text size="sm" c="dimmed">{count?.(rows.length)}</Text>
          {pages > 1 && (
            <Pagination size="sm" total={pages} value={pagination.pageIndex + 1} onChange={(p) => setPage(p - 1)}
              getControlProps={(control) => ({ 'aria-label': t(`table.${control}`) })} />
          )}
        </Group>
      )}
    </>
  )
}
