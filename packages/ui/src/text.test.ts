import { describe, expect, it } from 'vitest'
import { linkify, timeAgo } from './text'

describe('linkify', () => {
  it('splits links out of text, without the scheme in the label', () => {
    expect(linkify('see https://github.com/acme/web/pull/7, then merge')).toEqual([
      { text: 'see ' },
      { href: 'https://github.com/acme/web/pull/7', label: 'github.com/acme/web/pull/7' },
      { text: ', then merge' },
    ])
    expect(linkify('no links')).toEqual([{ text: 'no links' }])
    expect(linkify('javascript:alert(1)')).toEqual([{ text: 'javascript:alert(1)' }])
  })
})

describe('timeAgo', () => {
  const now = Date.parse('2026-11-24T12:00:00Z')
  it('says how long ago, in English and German', () => {
    expect(timeAgo('2026-11-24T09:00:00Z', 'en', now)).toBe('3 hours ago')
    expect(timeAgo('2026-11-22T12:00:00Z', 'de', now)).toBe('vorgestern')
    expect(timeAgo(now - 5000, 'en', now)).toBe('now')
    expect(timeAgo('nonsense', 'en', now)).toBe('')
  })
})
