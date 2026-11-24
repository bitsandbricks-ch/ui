import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { SidePanel } from './SidePanel'

describe('SidePanel docked and floating', () => {
  it('floats beside a usable page: no dialog, no overlay, Esc closes', () => {
    const close = vi.fn()
    const picked = vi.fn()
    renderWithApp(<>
      <button type="button" onClick={picked}>Switches</button>
      <SidePanel mode="float" title="Widget settings" eyebrow="Tile" onClose={close}>Fields</SidePanel>
    </>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const panel = screen.getByRole('complementary', { name: 'Widget settings' })
    expect(panel).toHaveClass('bnb-side-panel', 'is-float')
    // The page under it still takes clicks.
    fireEvent.click(screen.getByRole('button', { name: 'Switches' }))
    expect(picked).toHaveBeenCalled()
    fireEvent.keyDown(panel, { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('docks as part of the page, keeps its width and draws nothing when closed', () => {
    const { rerender } = renderWithApp(<SidePanel mode="dock" title="Layers" width={380} onClose={() => {}}>Body</SidePanel>)
    const panel = screen.getByRole('complementary', { name: 'Layers' })
    expect(panel).toHaveClass('is-dock')
    expect(panel.style.getPropertyValue('--bnb-side-w')).toBe('380px')
    fireEvent.keyDown(panel, { key: 'Escape' })
    rerender(<SidePanel mode="dock" opened={false} title="Layers" onClose={() => {}}>Body</SidePanel>)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('can be dragged wider by its edge in every mode', () => {
    renderWithApp(<SidePanel mode="float" title="Widget" resizable onClose={() => {}}>Body</SidePanel>)
    const grip = screen.getByRole('separator', { name: /Panel width/ })
    fireEvent.keyDown(grip, { key: 'ArrowLeft' })
    expect(Number(grip.getAttribute('aria-valuenow'))).toBeGreaterThan(440)
  })
})
