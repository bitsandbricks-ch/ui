import { describe, expect, it } from 'vitest'
import { clock, dayClock } from './time'

const at = Date.UTC(2026, 10, 24, 14, 5) / 1000

describe('time', () => {
  it('writes 24-hour times in English too', () => {
    expect(clock(at, 'en-US')).toMatch(/^\d{2}:\d{2}$/)
    expect(dayClock(at, 'en-US')).not.toMatch(/AM|PM/i)
    expect(clock(at, 'de-CH')).toMatch(/^\d{2}:\d{2}$/)
  })
})
