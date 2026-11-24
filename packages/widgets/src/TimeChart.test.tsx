import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../test/render'
import { TimeChart, type TimePoint } from './TimeChart'

const since = Date.UTC(2026, 10, 14, 12, 0) / 1000
const points: TimePoint[] = [[since, 10], [since + 600, 40], [since + 1200, 25]]

describe('TimeChart', () => {
  it('draws the line without a hover layer by default', () => {
    renderWithApp(<TimeChart points={points} label="Clients" since={since} until={since + 1200} />)
    expect(screen.getByRole('img', { name: 'Clients' })).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('walks the samples with the arrow keys and shows their value', () => {
    renderWithApp(<TimeChart points={points} label="Clients" since={since} until={since + 1200} value={(v) => `${v} clients`} />)
    const layer = screen.getByRole('group', { name: 'Clients' })
    fireEvent.keyDown(layer, { key: 'ArrowLeft' })
    expect(screen.getByRole('status')).toHaveTextContent('25 clients')
    fireEvent.keyDown(layer, { key: 'ArrowLeft' })
    expect(screen.getByRole('status')).toHaveTextContent('40 clients')
    fireEvent.keyDown(layer, { key: 'Home' })
    expect(screen.getByRole('status')).toHaveTextContent('10 clients')
    fireEvent.blur(layer)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the sample nearest to the pointer', () => {
    renderWithApp(<TimeChart points={points} label="Clients" since={since} until={since + 1200} value={(v) => `${v} clients`} />)
    const layer = screen.getByRole('group', { name: 'Clients' })
    layer.getBoundingClientRect = () => ({ left: 0, width: 600, top: 0, height: 120, right: 600, bottom: 120, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.mouseMove(layer, { clientX: 290 })
    expect(screen.getByRole('status')).toHaveTextContent('40 clients')
    fireEvent.mouseLeave(layer)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
