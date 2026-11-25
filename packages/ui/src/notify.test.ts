import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBrowserNotify, inQuietHours } from './notify'

class FakeNotification {
  static permission: NotificationPermission = 'default'
  static requestPermission = vi.fn(async () => FakeNotification.permission)
  static shown: { title: string; options?: NotificationOptions }[] = []
  onclick: (() => void) | null = null
  constructor(public title: string, public options?: NotificationOptions) { FakeNotification.shown.push({ title, options }) }
  close() {}
}

describe('inQuietHours', () => {
  const at = (h: number, m = 0) => new Date(2026, 2, 16, h, m)
  it('runs past midnight', () => {
    const p = { quiet: true, quietFrom: '22:00', quietTo: '08:00' }
    expect(inQuietHours(p, at(23))).toBe(true)
    expect(inQuietHours(p, at(7, 59))).toBe(true)
    expect(inQuietHours(p, at(8))).toBe(false)
    expect(inQuietHours(p, at(12))).toBe(false)
  })
  it('within a day, and not when off or empty', () => {
    expect(inQuietHours({ quiet: true, quietFrom: '12:00', quietTo: '13:30' }, at(13, 15))).toBe(true)
    expect(inQuietHours({ quiet: false, quietFrom: '00:00', quietTo: '23:59' }, at(12))).toBe(false)
    expect(inQuietHours({ quiet: true, quietFrom: '10:00', quietTo: '10:00' }, at(10))).toBe(false)
  })
})

describe('createBrowserNotify', () => {
  beforeEach(() => {
    localStorage.clear()
    FakeNotification.permission = 'default'
    FakeNotification.shown = []
    vi.stubGlobal('Notification', FakeNotification)
  })
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

  it('stays off when the browser refuses', async () => {
    FakeNotification.permission = 'denied'
    const n = createBrowserNotify('test-notify')
    expect((await n.set({ on: true })).on).toBe(false)
    expect(n.notify('jobs', 'A job for you')).toBe(false)
  })

  it('notifies the kinds that are on, and only urgent ones in quiet hours', async () => {
    const n = createBrowserNotify('test-notify')
    FakeNotification.permission = 'granted'
    await n.set({ on: true, kinds: { incidents: false } })
    expect(n.notify('incidents', 'New incident')).toBe(false)
    expect(n.notify('jobs', 'A job for you', { tag: 'job-1' })).toBe(true)
    expect(FakeNotification.shown[0]).toMatchObject({ title: 'A job for you', options: { tag: 'job-1' } })

    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 2, 16, 23, 0))
    await n.set({ quiet: true })
    expect(n.quietNow()).toBe(true)
    expect(n.notify('switches', 'Switch down')).toBe(false)
    expect(n.notify('jobs', 'A job for you', { urgent: true })).toBe(true)
    await n.set({ urgentInQuiet: false })
    expect(n.notify('jobs', 'A job for you', { urgent: true })).toBe(false)
  })

  it('reads what another tab saved', () => {
    localStorage.setItem('test-notify', JSON.stringify({ on: true, kinds: { jobs: false } }))
    expect(createBrowserNotify('test-notify').prefs()).toMatchObject({ on: true, kinds: { jobs: false }, quietFrom: '22:00' })
  })
})
