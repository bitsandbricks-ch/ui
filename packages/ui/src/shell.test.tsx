import { describe, expect, it } from 'vitest'
import { clampPanelWidth } from './panelWidth'
import { addView, MAX_VIEWS, removeView, viewPath } from './savedViews'

describe('saved views', () => {
  it('keeps the view, not the page number or the open panel, in a stable order', () => {
    expect(viewPath('/hosts', '?state=down&page=3&side=host:web-1&q=&zone=zurich')).toBe('/hosts?state=down&zone=zurich')
    expect(viewPath('/hosts', '?zone=zurich&state=down')).toBe(viewPath('/hosts', '?state=down&zone=zurich'))
    expect(viewPath('/hosts', '')).toBe('/hosts')
  })
  it('keeps one per name and per link, newest last, at most MAX_VIEWS', () => {
    let list = addView([], 'Down', '/hosts?state=down')
    list = addView(list, 'Zurich', '/hosts?zone=zurich')
    list = addView(list, 'down', '/hosts?state=down&zone=zurich')
    expect(list).toEqual([{ name: 'Zurich', path: '/hosts?zone=zurich' }, { name: 'down', path: '/hosts?state=down&zone=zurich' }])
    expect(addView(list, '   ', '/x')).toBe(list)
    expect(removeView(list, '/hosts?zone=zurich')).toHaveLength(1)
    const many = Array.from({ length: MAX_VIEWS + 5 }, (_, i) => i).reduce((l, i) => addView(l, `v${i}`, `/p${i}`), [] as { name: string; path: string }[])
    expect(many).toHaveLength(MAX_VIEWS)
    expect(many[0].name).toBe('v5')
  })
})

describe('clampPanelWidth', () => {
  it('keeps the panel between its minimum and most of the screen', () => {
    expect(clampPanelWidth(100, 1400)).toBe(320)
    expect(clampPanelWidth(2000, 1400)).toBe(1160)
    expect(clampPanelWidth(600.4, 1400)).toBe(600)
    expect(clampPanelWidth(NaN, 1400)).toBe(440)
    expect(clampPanelWidth(500, 400)).toBe(320)
  })
})
