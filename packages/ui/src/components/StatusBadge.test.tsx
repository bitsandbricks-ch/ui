import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { de, en } from '../i18n'
import { normalizeTone, STATE_TONE, toneColor, toneOf } from '../status'
import { StatusBadge, StatusBit } from './StatusBadge'

describe('state looks', () => {
  it('gives each state word one tone, and every word a label in both languages', () => {
    expect(toneOf('offline')).toBe('err')
    expect(toneOf('stale')).toBe('warn')
    expect(toneOf('paid')).toBe('ok')
    expect(toneOf('something new')).toBe('off')
    expect(toneColor('off')).toBe('gray')
    for (const word of Object.keys(STATE_TONE)) {
      expect(en).toHaveProperty(`state.${word}`)
      expect(de).toHaveProperty(`state.${word}`)
    }
    // Swiss German: no ß.
    expect(Object.values(de).join(' ')).not.toContain('ß')
  })

  it("maps both apps' older tone names", () => {
    expect(normalizeTone('down')).toBe('err')
    expect(normalizeTone('danger')).toBe('err')
    expect(normalizeTone('up')).toBe('ok')
    expect(normalizeTone('warning')).toBe('warn')
    expect(normalizeTone(undefined)).toBe('off')
  })

  it('draws a badge with the word or the page’s own label, and a bit', () => {
    const { container } = renderWithApp(<><StatusBadge state="offline" /><StatusBadge state="failed" label="3 failed" /><StatusBit state="degraded" /></>)
    expect(screen.getByText('Offline').closest('[data-state]')).toHaveAttribute('data-tone', 'err')
    expect(screen.getByText('3 failed')).toBeInTheDocument()
    expect(container.querySelector('.bnb-bit.is-warn')).toHaveAttribute('aria-hidden', 'true')
  })
})
