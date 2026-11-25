import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { OneTimeSecret } from './OneTimeSecret'

describe('OneTimeSecret', () => {
  it('shows the value once with a warning, Copy and a way to close it', () => {
    const done = vi.fn()
    renderWithApp(<OneTimeSecret secret="fb_example_123" label="API token for grafana" onDone={done}>
      Send it as <code>Authorization: Bearer …</code>
    </OneTimeSecret>)
    expect(screen.getByRole('region', { name: 'Copy it now' })).toBeInTheDocument()
    expect(screen.getByText(/only time it is shown/)).toBeInTheDocument()
    expect(screen.getByLabelText('API token for grafana')).toHaveValue('fb_example_123')
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.getByText('Authorization: Bearer …')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: "I've stored it" }))
    expect(done).toHaveBeenCalledOnce()
  })

  it('speaks German', () => {
    renderWithApp(<OneTimeSecret secret="x" onDone={vi.fn()} />, '/', 'de')
    expect(screen.getByRole('button', { name: 'Habe ich gespeichert' })).toBeInTheDocument()
    expect(screen.getByLabelText('Schlüssel')).toHaveValue('x')
  })
})
