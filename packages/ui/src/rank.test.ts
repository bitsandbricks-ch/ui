import { describe, expect, it } from 'vitest'
import { matchScore, rankItems, rememberRecent } from './rank'

describe('matchScore', () => {
  it('needs the letters in order', () => {
    expect(matchScore('hst', 'hosts')).toBeGreaterThan(0)
    expect(matchScore('tsh', 'hosts')).toBe(0)
    expect(matchScore('', 'anything')).toBe(1)
    expect(matchScore('a', '')).toBe(0)
  })
  it('likes word starts and the whole query', () => {
    expect(matchScore('web', 'acme/web')).toBeGreaterThan(matchScore('web', 'cobweb'))
    expect(matchScore('pr', 'pull requests')).toBeGreaterThan(matchScore('pr', 'approvals'))
  })
})

describe('rankItems', () => {
  const items = [
    { label: 'Settings', kind: 'page' },
    { label: 'acme/web', kind: 'record', hint: 'set up last week' },
    { label: 'Sign out', kind: 'command' },
    { label: 'Hosts', kind: 'page', hint: 'machines' },
  ]
  it('puts the best match first and leaves out the rest', () => {
    expect(rankItems(items, 'set').map((i) => i.label)).toEqual(['Settings', 'acme/web'])
  })
  it('counts a hint only when it holds the query as typed', () => {
    expect(rankItems(items, 'machines').map((i) => i.label)).toEqual(['Hosts'])
    expect(rankItems(items, 'mchn')).toEqual([])
  })
  it('keeps to the limit and breaks ties by kind', () => {
    const same = [{ label: 'x', kind: 'command' }, { label: 'x', kind: 'page' }]
    expect(rankItems(same, 'x', 12, ['page', 'command']).map((i) => i.kind)).toEqual(['page', 'command'])
    expect(rankItems(items, 's', 2)).toHaveLength(2)
  })
})

describe('rememberRecent', () => {
  it('puts the newest first, once, and keeps at most max', () => {
    const key = (s: string) => s
    expect(rememberRecent(['a', 'b', 'c'], 'b', key)).toEqual(['b', 'a', 'c'])
    expect(rememberRecent(['a', 'b', 'c'], 'd', key, 3)).toEqual(['d', 'a', 'b'])
  })
})
