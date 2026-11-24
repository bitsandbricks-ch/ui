import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { createT, de, defineTexts, en, I18nProvider, interpolate, registerMessages, useT } from './i18n'

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

describe('component texts', () => {
  const texts = defineTexts({
    en: { 'demo.hello': 'Hello {{name}}', 'demo.items_one': '{{count}} item', 'demo.items_other': '{{count}} items' },
    de: { 'demo.hello': 'Hallo {{name}}', 'demo.items_one': '{{count}} Eintrag', 'demo.items_other': '{{count}} Einträge' },
  })

  it("reads a component's own texts, after the app's and before the shared ones", () => {
    const t = createT('de', (key) => (key === 'demo.hello' ? 'Grüezi' : undefined), {}, texts)
    expect(t('demo.hello')).toBe('Grüezi')
    expect(t('demo.items', { count: 2 })).toBe('2 Einträge')
    expect(t('common.close')).toBe('Schliessen')
    expect(createT('en', undefined, { 'demo.hello': 'Hi' }, texts)('demo.hello')).toBe('Hi')
  })

  it('works through useT', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider locale="de">{children}</I18nProvider>
    const { result } = renderHook(() => useT(texts), { wrapper })
    expect(result.current.t('demo.hello', { name: 'Mike' })).toBe('Hallo Mike')
    expect(result.current.t('common.cancel')).toBe('Abbrechen')
  })
})
