import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { PageHead } from './PageHead'
import { PageMenu } from './PageMenu'

describe('PageMenu', () => {
  it('keeps the other actions behind one button', async () => {
    const pin = vi.fn()
    renderWithApp(<PageMenu items={[{ label: 'Pin to sidebar', onClick: pin }, { label: 'Big screen', href: '/screen/1' }]} />)
    expect(screen.queryByText('Pin to sidebar')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Big screen', hidden: true })).toHaveAttribute('href', '/screen/1')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Pin to sidebar', hidden: true }))
    expect(pin).toHaveBeenCalled()
  })

  it('draws nothing without items', () => {
    const { container } = renderWithApp(<PageMenu items={[]} />)
    expect(container.querySelector('button')).toBeNull()
  })

  it('sits after the primary action in a page head', () => {
    renderWithApp(<PageHead title="Overview" actions={<button type="button">Add</button>} menu={[{ label: 'Edit', onClick: () => {} }]} />)
    const buttons = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent)
    expect(buttons).toEqual(['Add', 'More actions'])
  })
})
