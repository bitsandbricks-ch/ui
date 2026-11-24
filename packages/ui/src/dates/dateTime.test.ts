import { describe, expect, it } from 'vitest'
import { editableDateTime, formatDateTime, parseTypedDateTime, toDateTimeValue } from './dateTime'

const evening = { hh: 18, mm: 0 }
const now = new Date(2026, 10, 16, 12, 0) // Mon 16.11.2026

describe('parseTypedDateTime', () => {
  it('reads Swiss dates with and without a time', () => {
    expect(parseTypedDateTime('14.12.2027 10:30', evening, now)).toEqual({ y: 2027, m: 11, d: 14, hh: 10, mm: 30 })
    expect(parseTypedDateTime('14.12.2027', evening, now)).toEqual({ y: 2027, m: 11, d: 14, hh: 18, mm: 0 })
    expect(parseTypedDateTime('1.2.27 9', evening, now)).toEqual({ y: 2027, m: 1, d: 1, hh: 9, mm: 0 })
    expect(parseTypedDateTime('14.11. 1800', evening, now)).toEqual({ y: 2027, m: 10, d: 14, hh: 18, mm: 0 })
    expect(parseTypedDateTime('14/11/2026 18.30', evening, now)).toEqual({ y: 2026, m: 10, d: 14, hh: 18, mm: 30 })
    expect(parseTypedDateTime('Sat 14.11.2026, 18:00', evening, now)).toEqual({ y: 2026, m: 10, d: 14, hh: 18, mm: 0 })
    expect(parseTypedDateTime('2027-03-05T07:15', evening, now)).toEqual({ y: 2027, m: 2, d: 5, hh: 7, mm: 15 })
  })

  it('moves a past date without a year to next year', () => {
    expect(parseTypedDateTime('01.03.', evening, now)?.y).toBe(2027)
    expect(parseTypedDateTime('20.12.', evening, now)?.y).toBe(2026)
    expect(parseTypedDateTime('16.11.', evening, now)?.y).toBe(2026)
  })

  it('rejects impossible dates and times', () => {
    expect(parseTypedDateTime('31.02.2027', evening, now)).toBeNull()
    expect(parseTypedDateTime('14.13.2027', evening, now)).toBeNull()
    expect(parseTypedDateTime('14.12.2027 24:00', evening, now)).toBeNull()
    expect(parseTypedDateTime('tomorrow', evening, now)).toBeNull()
    expect(parseTypedDateTime('  ', evening, now)).toBeNull()
  })
})

describe('formatDateTime', () => {
  it('writes the weekday, the date and a 24h time in both languages', () => {
    expect(formatDateTime('2026-11-14T18:00')).toBe('Sat 14.11.2026, 18:00')
    expect(formatDateTime('2026-11-14T08:05', 'de')).toBe('Sa 14.11.2026, 08:05')
    expect(formatDateTime(new Date(2026, 0, 4, 23, 59))).toBe('Sun 04.01.2026, 23:59')
    expect(formatDateTime('')).toBe('')
  })

  it('round-trips through the editable text', () => {
    const value = toDateTimeValue({ y: 2026, m: 10, d: 14, hh: 18, mm: 0 })
    expect(value).toBe('2026-11-14T18:00')
    expect(editableDateTime(value)).toBe('14.11.2026 18:00')
    expect(toDateTimeValue(parseTypedDateTime(editableDateTime(value), evening, now)!)).toBe(value)
  })
})
