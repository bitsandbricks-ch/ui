import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { Sparkline, sparkPoints } from './Sparkline'

describe('sparkPoints', () => {
  it('spreads the values over the 100 × 30 box, oldest left, highest on top', () => {
    expect(sparkPoints([0, 5, 10])).toBe('0,29 50,15 100,1')
  })

  it('draws nothing for fewer than two values', () => {
    expect(sparkPoints([])).toBe('')
    expect(sparkPoints([3])).toBe('')
  })

  it('draws a flat line along the bottom when all values are equal', () => {
    expect(sparkPoints([4, 4])).toBe('0,29 100,29')
  })

  it('takes a fixed range, so two tiles compare', () => {
    expect(sparkPoints([50, 100], 0, 100)).toBe('0,15 100,1')
  })
})

describe('Sparkline', () => {
  it('is decoration, hidden from screen readers', () => {
    const { container } = renderWithApp(<Sparkline points={[1, 3, 2]} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.querySelector('polyline')).toHaveAttribute('points', sparkPoints([1, 3, 2]))
  })
})
