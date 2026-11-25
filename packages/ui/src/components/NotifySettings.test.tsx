import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { createBrowserNotify } from '../notify'
import { NotifySettings } from './NotifySettings'

const kinds = [
  { id: 'jobs', label: 'A job sent to me', urgent: true },
  { id: 'incidents', label: 'New incidents' },
]

describe('NotifySettings', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('switches on, picks kinds and sets quiet hours', async () => {
    vi.stubGlobal('Notification', Object.assign(class {}, { permission: 'granted', requestPermission: vi.fn() }))
    const store = createBrowserNotify('test-settings')
    renderWithApp(<NotifySettings store={store} kinds={kinds} opened onClose={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: 'New incidents' })).toBeDisabled()
    fireEvent.click(screen.getByRole('switch', { name: 'Notify me on this device' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'New incidents' })).toBeEnabled())
    fireEvent.click(screen.getByRole('checkbox', { name: 'New incidents' }))
    await waitFor(() => expect(store.prefs().kinds).toEqual({ incidents: false }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Quiet hours' }))
    expect(await screen.findByRole('checkbox', { name: 'Urgent ones still come through' })).toBeChecked()
    expect(screen.getAllByLabelText('From')[0]).toHaveValue('22:00')
  })

  it('explains a browser that blocks notifications', () => {
    vi.stubGlobal('Notification', Object.assign(class {}, { permission: 'denied', requestPermission: vi.fn() }))
    renderWithApp(<NotifySettings store={createBrowserNotify('test-settings')} kinds={kinds} opened onClose={vi.fn()} />)
    expect(screen.getByText(/blocks notifications for this site/)).toBeInTheDocument()
  })

  it('says so when the browser has no notifications', () => {
    vi.stubGlobal('Notification', undefined)
    renderWithApp(<NotifySettings store={createBrowserNotify('test-settings')} kinds={kinds} opened onClose={vi.fn()} />, '/', 'de')
    expect(screen.getByText('Dieser Browser kann keine Mitteilungen anzeigen.')).toBeInTheDocument()
  })
})
