import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { PanelField, PanelSection, SidePanel } from './SidePanel'

describe('SidePanel', () => {
  it('names the dialog, links on to the page and closes', async () => {
    const close = vi.fn()
    renderWithApp(
      <SidePanel title="sw-12" eyebrow="Switch" href="/switches/12" onClose={close}>
        <PanelSection label="Facts"><PanelField label="Ports">48</PanelField></PanelSection>
      </SidePanel>,
    )
    expect(await screen.findByRole('dialog', { name: 'sw-12' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/switches/12')
    expect(screen.getByText('Ports')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(close).toHaveBeenCalled()
  })
})
