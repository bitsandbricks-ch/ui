import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { StatGrid, StatTile } from './StatTile'

describe('StatTile', () => {
  it('keeps the line under the figure and the trend inside the list', () => {
    renderWithApp(<StatTile label="Clients" value="254" sub="2.4 GHz: 62" trend={[1, 3, 2]} />)
    expect(screen.getByText('254').tagName).toBe('DD')
    expect(screen.getByRole('img', { name: 'Clients over time' })).toBeInTheDocument()
    expect(screen.getByText('2.4 GHz: 62').closest('dd')).not.toBeNull()
    // A <dl> holds only dt and dd.
    const dl = screen.getByText('254').closest('dl')!
    expect([...dl.children].every((c) => c.tagName === 'DT' || c.tagName === 'DD')).toBe(true)
  })

  it('shows the unit, the whole and the change, coloured by whether it is good', () => {
    renderWithApp(<StatTile label="Seats online" value={412} unit="seats" of={480} size="l" tone="warn" change={{ value: -12, goodWhen: 'up' }} />)
    expect(screen.getByText('of 480')).toBeInTheDocument()
    const change = screen.getByLabelText('down by −12 since before')
    expect(change).toHaveClass('is-err')
    expect(change.closest('dl')).toHaveClass('bnb-stat-l', 'is-warn')
  })

  it('speaks German when the app does', () => {
    renderWithApp(<StatTile label="Mitglieder" value={12} of={40} />, '/', 'de')
    expect(screen.getByText('von 40')).toBeInTheDocument()
  })

  it('links where it drills down to, and lays tiles out in a grid', () => {
    const { container } = renderWithApp(<StatGrid><StatTile label="Down" value={2} href="/problems" /></StatGrid>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/problems')
    // The phone's compact two-column look hangs off this class (StatTile.css).
    expect(container.querySelector('.bnb-statgrid')).not.toBeNull()
  })
})
