import { describe, expect, it } from 'vitest'
import { csvCell, csvFileName, freshKeys, mergeSeen, pickRange, toCsv, togglePick, togglePickAll } from './table'

describe('picking', () => {
  it('toggles one, a span and all shown', () => {
    expect(togglePick(['a'], 'b')).toEqual(['a', 'b'])
    expect(togglePick(['a', 'b'], 'a')).toEqual(['b'])
    expect(pickRange(['x'], ['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['x', 'b', 'c', 'd'])
    expect(pickRange([], ['a', 'b'], 'gone', 'b')).toEqual(['b'])
    expect(togglePickAll(['hidden'], ['a', 'b'])).toEqual(['hidden', 'a', 'b'])
    expect(togglePickAll(['hidden', 'a', 'b'], ['a', 'b'])).toEqual(['hidden'])
    expect(togglePickAll([], [])).toEqual([])
  })
})

describe('CSV', () => {
  it('quotes, and defuses cells that would run as formulas', () => {
    expect(csvCell('plain')).toBe('plain')
    expect(csvCell('a, b')).toBe('"a, b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('-1')).toBe("'-1")
    expect(csvCell(null)).toBe('')
    expect(toCsv(['Name', 'Ports'], [['sw-1', 4]])).toBe('Name,Ports\r\nsw-1,4\r\n')
  })
  it('names the file after the list and the day', () => {
    expect(csvFileName('Pull requests', new Date('2026-11-24T10:00:00Z'))).toBe('pull-requests-2026-11-24.csv')
    expect(csvFileName('', new Date('2026-11-24T10:00:00Z'))).toBe('list-2026-11-24.csv')
  })
})

describe('new since the last visit', () => {
  it('marks nothing on the first visit, then what was not there', () => {
    expect(freshKeys(null, ['a'])).toEqual(new Set())
    expect(freshKeys(['a'], ['a', 'b'])).toEqual(new Set(['b']))
    expect(mergeSeen(['a', 'b'], ['c', 'a'], 3)).toEqual(['c', 'a', 'b'])
  })
})
