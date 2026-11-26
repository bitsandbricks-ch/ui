import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { InPanel, TitleLevel } from './context'
import { PageHead } from './PageHead'

describe('PageHead title level', () => {
  it('starts at h2 under a shell that has the h1', () => {
    renderWithApp(<TitleLevel.Provider value={2}><PageHead title="Agents" /></TitleLevel.Provider>)
    expect(screen.getByRole('heading', { level: 2, name: 'Agents' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('heads a section one level lower inside a panel', () => {
    renderWithApp(
      <TitleLevel.Provider value={2}><InPanel.Provider value><PageHead title="Storage" /></InPanel.Provider></TitleLevel.Provider>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Storage' })).toBeInTheDocument()
  })
})

describe('PageHead intro on a phone', () => {
  it('shows two lines and a More link when the sentence runs longer', () => {
    const height = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(120)
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(40)
    renderWithApp(<PageHead title="Incidents" desc="A long sentence about the page." />)
    const more = screen.getByRole('button', { name: 'More' })
    expect(screen.getByText('A long sentence about the page.')).toHaveClass('is-clamped')
    fireEvent.click(more)
    expect(screen.getByText('A long sentence about the page.')).not.toHaveClass('is-clamped')
    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true')
    height.mockRestore()
    client.mockRestore()
  })

  it('has no More link when the sentence fits', () => {
    renderWithApp(<PageHead title="Logs" desc="Short." />)
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull()
  })
})
