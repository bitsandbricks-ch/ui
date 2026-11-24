import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { pageCount, Pager } from './Pager'

describe('Pager', () => {
  it('says which rows show and turns pages', () => {
    const onPage = vi.fn()
    renderWithApp(<Pager page={2} perPage={25} total={80} onPage={onPage} />)
    expect(screen.getByText('26–50 of 80')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPage).toHaveBeenCalledWith(3)
  })

  it('shows nothing for an empty list, and no buttons for one page', () => {
    const { rerender } = renderWithApp(<Pager page={1} perPage={25} total={0} onPage={() => {}} />)
    expect(screen.queryByText(/of 0/)).toBeNull()
    rerender(<Pager page={1} perPage={25} total={3} onPage={() => {}} />)
    expect(screen.getByText('1–3 of 3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull()
  })

  it('counts pages', () => {
    expect(pageCount(0, 50)).toBe(1)
    expect(pageCount(101, 50)).toBe(3)
  })
})
