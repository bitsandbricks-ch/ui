import { describe, expect, it } from 'vitest'
import { createT, de, en, interpolate, registerMessages } from './i18n'

describe('texts', () => {
  it('has every English text in German too', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort())
  })

  it('fills placeholders and picks plurals', () => {
    expect(interpolate('{{a}} of {{ b }}', { a: 1, b: 2 })).toBe('1 of 2')
    registerMessages('en', { 'test.items_one': '{{count}} item', 'test.items_other': '{{count}} items' })
    const t = createT('en')
    expect(t('test.items', { count: 1 })).toBe('1 item')
    expect(t('test.items', { count: 3 })).toBe('3 items')
  })

  it("lets the app's translate win, and falls back to the package's texts", () => {
    const appT = (key: string) => (key === 'common.cancel' ? 'Abort' : key)
    const t = createT('de', appT, { 'common.close': 'Zu' })
    expect(t('common.cancel')).toBe('Abort')
    expect(t('common.close')).toBe('Zu')
    expect(t('common.retry')).toBe('Nochmals versuchen')
    expect(t('no.such.key')).toBe('no.such.key')
  })
})
