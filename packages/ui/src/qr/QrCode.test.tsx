import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { QrCode, qrMatrix } from './QrCode'

describe('qrMatrix', () => {
  it('grows with the text and the correction level', () => {
    const short = qrMatrix('https://example.ch')!
    expect(short.n).toBe(21 + 4 * 1) // version 2 at M
    expect(qrMatrix('https://example.ch', 'H')!.n).toBeGreaterThan(short.n)
    expect(short.d).toMatch(/^M\d+ \d+h1v1h-1z/)
  })

  it('takes any text as UTF-8, and says when it is too long', () => {
    expect(qrMatrix('Zürich €')).not.toBeNull()
    expect(qrMatrix('x'.repeat(4000))).toBeNull()
  })
})

describe('QrCode', () => {
  it('is an image named by what it holds, dark on white with a quiet zone', () => {
    const { container } = renderWithApp(<QrCode value="WIFI:S:Lab;T:WPA;P:secret;;" label="Wi-Fi login" size={160} />)
    const svg = screen.getByRole('img', { name: 'Wi-Fi login' })
    expect(svg).toHaveStyle({ width: '160px' })
    const n = qrMatrix('WIFI:S:Lab;T:WPA;P:secret;;')!.n
    expect(svg.getAttribute('viewBox')).toBe(`-2 -2 ${n + 4} ${n + 4}`)
    expect(container.querySelector('path')).toHaveAttribute('fill', '#000')
  })

  it('names itself in German, and says when the text is too long', () => {
    renderWithApp(<><QrCode value="https://example.ch" /><QrCode value={'x'.repeat(4000)} /></>, '/', 'de')
    expect(screen.getByRole('img', { name: 'QR-Code: https://example.ch' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Zu lang für einen QR-Code')
  })
})
