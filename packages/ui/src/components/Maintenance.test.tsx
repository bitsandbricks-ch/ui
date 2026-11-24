import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { MaintenanceBanner, MaintenanceScreen } from './Maintenance'

const now = new Date(2026, 10, 14, 12, 0).getTime()
const at = (h: number, m = 0, d = 14) => new Date(2026, 10, d, h, m)

describe('MaintenanceBanner', () => {
  it('says when planned work is, in 24-hour time, with the default line', () => {
    renderWithApp(<MaintenanceBanner startsAt={at(22)} endsAt={at(23, 30)} now={now} />)
    const banner = screen.getByRole('status')
    expect(banner).toHaveTextContent(/Planned maintenance .*14 November, 22:00 – 23:30:/)
    expect(banner).toHaveTextContent('The app is not available during this time.')
  })

  it('says it is going on now, in German', () => {
    renderWithApp(<MaintenanceBanner startsAt={at(11)} endsAt={at(13)} message="Neue Datenbank." now={now} />, '/', 'de')
    expect(screen.getByRole('status')).toHaveTextContent('Wartung bis 13:00: Neue Datenbank.')
  })

  it('draws nothing once it is over, and can be hidden', () => {
    renderWithApp(<MaintenanceBanner endsAt={at(11)} message="x" now={now} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    const hide = vi.fn()
    renderWithApp(<MaintenanceBanner startsAt={at(22)} message="x" now={now} onDismiss={hide} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide this notice' }))
    expect(hide).toHaveBeenCalled()
  })
})

describe('MaintenanceScreen', () => {
  afterEach(() => vi.useRealTimers())

  it('covers the app, says when it is back and links to the status page', () => {
    renderWithApp(<MaintenanceScreen until={at(14, 5)} statusHref="https://status.example.com" />, '/', 'de')
    expect(screen.getByRole('heading', { name: 'Wartungsarbeiten' })).toBeInTheDocument()
    expect(screen.getByText('Voraussichtlich zurück um 14:05 Uhr.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Systemstatus' })).toHaveAttribute('href', 'https://status.example.com')
    expect(screen.queryByText('Diese Seite lädt sich von selbst neu.')).not.toBeInTheDocument()
  })

  it('asks again and again while it is down', async () => {
    vi.useFakeTimers()
    const stillDown = vi.fn().mockResolvedValue(true)
    renderWithApp(<MaintenanceScreen stillDown={stillDown} every={1000} />)
    expect(screen.getByText('This page reloads by itself.')).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(2500) })
    expect(stillDown).toHaveBeenCalledTimes(2)
  })
})
