import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { ErrorBanner, nextRetryDelay, NoMatches, OfflineBanner } from './feedback'

describe('ErrorBanner details', () => {
  it('keeps the raw text behind a toggle', () => {
    renderWithApp(<ErrorBanner message="The server refused it." details={'HTTP 403\nresource not accessible'} />)
    expect(screen.queryByText(/resource not accessible/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(screen.getByText(/resource not accessible/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true')
  })
  it('has no toggle when the details say nothing more', () => {
    renderWithApp(<ErrorBanner message="Timed out" details="Timed out" />)
    expect(screen.queryByRole('button', { name: 'Details' })).not.toBeInTheDocument()
  })
})

describe('NoMatches', () => {
  it('names the filters that are on and clears them', () => {
    const clear = vi.fn()
    renderWithApp(<NoMatches filters={['state: closed', false, 'mine']} onClear={clear} />)
    expect(screen.getByText('Nothing matches the filter')).toBeInTheDocument()
    expect(screen.getByText('Filtered by state: closed · mine. Change or clear the filter.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(clear).toHaveBeenCalled()
  })
  it('speaks German', () => {
    renderWithApp(<NoMatches />, '/', 'de')
    expect(screen.getByText('Nichts passt zum Filter')).toBeInTheDocument()
  })
})

describe('OfflineBanner', () => {
  it('counts down to the next try and tries now on a click', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(0)
      const retry = vi.fn()
      renderWithApp(<OfflineBanner retryAt={3000} onRetry={retry} />)
      expect(screen.getByRole('alert')).toHaveTextContent("Can't reach the server · trying again in 3 seconds")
      act(() => { vi.advanceTimersByTime(2000) })
      expect(screen.getByRole('alert')).toHaveTextContent('trying again in 1 second')
      act(() => { vi.advanceTimersByTime(1000) })
      expect(screen.getByRole('alert')).toHaveTextContent('trying again…')
      fireEvent.click(screen.getByRole('button', { name: 'Try now' }))
      expect(retry).toHaveBeenCalled()
    } finally { vi.useRealTimers() }
  })
  it('waits longer each time, up to 30 seconds', () => {
    expect([0, 1, 2, 3, 4, 10].map(nextRetryDelay)).toEqual([2000, 4000, 8000, 16000, 30000, 30000])
  })
})
