import { Group, Pagination, Select, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { useT } from '../i18n'

/** A page of a list the server pages: what the API answers and what the pager needs. */
export interface Page<T> {
  items: T[]
  /** Counted from 1. */
  page: number
  perPage: number
  total: number
}

export interface PagerState {
  page: number
  perPage: number
  total: number
}

/** How many pages `total` rows make at `perPage`; at least one. */
export const pageCount = (total: number, perPage: number) => Math.max(1, Math.ceil(total / Math.max(1, perPage)))

const PER_PAGE = [10, 25, 50, 100]

/** The one pager for lists the server pages: rows per page, "1–25 of 80", and the page buttons.
 *  Long lists page at 50 rows (handbook). */
export function Pager({ page, perPage, total, onPage, onPerPage, perPageOptions = PER_PAGE, rangeLabel, top }: PagerState & {
  onPage: (page: number) => void
  onPerPage?: (perPage: number) => void
  perPageOptions?: number[]
  rangeLabel?: (from: number, to: number, total: number) => ReactNode
  /** Above the list: hidden on phones, so the first rows come first. */
  top?: boolean
}) {
  const { t } = useT()
  if (total === 0) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  return (
    <Group gap="xs" className={`bnb-pager${top ? ' is-top' : ''}`} visibleFrom={top ? 'sm' : undefined} wrap="wrap">
      {onPerPage && (
        <Select size="xs" w={80} value={String(perPage)} aria-label={t('table.perPage')} onChange={(v) => onPerPage(Number(v))}
          data={[...new Set([...perPageOptions, perPage])].sort((a, b) => a - b).map((n) => ({ value: String(n), label: String(n) }))} />
      )}
      <Text size="sm" c="dimmed" flex={1} style={{ whiteSpace: 'nowrap' }}>
        {rangeLabel ? rangeLabel(from, to, total) : t('table.rowsOf', { from, to, count: total })}
      </Text>
      {total > perPage && (
        <Pagination size="sm" value={page} onChange={onPage} total={pageCount(total, perPage)} withEdges boundaries={1}
          getControlProps={(control) => ({ 'aria-label': t(`table.${control}`) })} />
      )}
    </Group>
  )
}
