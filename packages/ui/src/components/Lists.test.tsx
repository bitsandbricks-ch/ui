import { fireEvent, renderHook, act, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { foldText, wordsMatch } from '../search'
import { usePagedList } from '../usePagedList'
import { Pager } from './Pager'

describe('wordsMatch', () => {
  it('ignores case and accents and needs every word', () => {
    expect(wordsMatch('Jörg Müller', 'muller jo')).toBe(true)
    expect(wordsMatch('Jörg Müller', 'mueller')).toBe(true)
    expect(wordsMatch('Strasse', 'straße')).toBe(true)
    expect(wordsMatch('Mike Keller', 'mike kel')).toBe(true)
    expect(wordsMatch('Mike Keller', 'mike anna')).toBe(false)
    expect(wordsMatch('anything', '  ')).toBe(true)
    expect(foldText('  Zoë-Lena  ')).toBe('zoe lena')
  })
})

describe('usePagedList', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1)

  it('pages, shows all, and keeps the page in range when the list shrinks', () => {
    const { result, rerender } = renderHook(({ list }) => usePagedList(list, 10), { initialProps: { list: items } })
    expect(result.current.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    act(() => result.current.setPage(3))
    expect(result.current.items).toEqual([21, 22, 23])
    rerender({ list: items.slice(0, 12) })
    expect(result.current.page).toBe(2)
    expect(result.current.items).toEqual([11, 12])
    act(() => result.current.setShowAll(true))
    expect(result.current.items).toHaveLength(12)
    expect(result.current.page).toBe(1)
  })
})

describe('Pager show all', () => {
  it('offers "Show all", and "Show pages" back', () => {
    const onShowAll = vi.fn()
    const { rerender } = renderWithApp(<Pager page={1} perPage={10} total={23} onPage={() => {}} onShowAll={onShowAll} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(onShowAll).toHaveBeenCalledWith(true)
    rerender(<Pager page={1} perPage={23} total={23} onPage={() => {}} showAll onShowAll={onShowAll} />)
    expect(screen.getByText('All 23')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show pages' }))
    expect(onShowAll).toHaveBeenLastCalledWith(false)
  })

  it('has no "Show all" when everything fits', () => {
    renderWithApp(<Pager page={1} perPage={10} total={8} onPage={() => {}} onShowAll={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Show all' })).toBeNull()
  })
})
