import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { Widget } from '@bitsandbricks/ui'
import { BnbProvider, createBnbTheme } from '@bitsandbricks/ui'
import { usePaneData, type PaneSource } from './usePaneData'

const base = { id: 'w', size: 'small', refresh: 60, sub: '', link: '' } as const
const hallA: Widget = { ...base, label: '', type: 'stat', value: 40, unit: 'kW', tone: '' }
const hallB: Widget = { ...base, label: 'Hall B', type: 'stat', value: 10, unit: 'kW', tone: '' }
const states: Widget = { ...base, label: 'Switches', type: 'status', items: [
  { label: 'sw-a', state: 'up', detail: '' }, { label: 'sw-b', state: 'down', detail: '' }, { label: 'sw-c', state: 'down', detail: '' }] }

const theme = createBnbTheme({ accent: { light: '#b85a0a', dark: '#f59a23' } })
const inApp = (locale: 'en' | 'de') => ({ children }: { children: ReactNode }) => (
  <BnbProvider theme={theme} locale={locale} notifications={false}>{children}</BnbProvider>
)

describe('usePaneData', () => {
  it('waits for the first source and passes on its error', () => {
    const { result } = renderHook(() => usePaneData([{ isPending: true }, { data: hallB }], {}), { wrapper: inApp('en') })
    expect(result.current).toMatchObject({ data: undefined, isPending: true, error: null })
    const failed = new Error('502')
    const { result: r2 } = renderHook(() => usePaneData([{ error: failed, isPending: false }], {}), { wrapper: inApp('en') })
    expect(r2.current).toMatchObject({ data: undefined, isPending: false, error: failed })
  })

  it('merges the sources, names them by their tiles and applies the display', () => {
    const sources: PaneSource[] = [{ data: hallA }, { data: hallB }, { isPending: true }]
    const { result } = renderHook(() => usePaneData(sources, {}, ['Hall A'], { unit: 'MW', sort: 'value-asc' }), { wrapper: inApp('en') })
    const w = result.current.data
    expect(w?.type === 'list' && w.items.map((i) => i.label)).toEqual(['Hall B', 'Hall A'])
    expect(result.current.isPending).toBe(false)
  })

  it('groups in the app language', () => {
    const { result } = renderHook(() => usePaneData([{ data: states }], { group_by: 'state', reduce: 'count' }), { wrapper: inApp('de') })
    const w = result.current.data
    expect(w?.type === 'list' && w.items.map((i) => [i.label, i.number])).toEqual(expect.arrayContaining([['Ausgefallen', 2], ['Läuft', 1]]))
  })

  it('shapes again when a source brings new data', () => {
    let sources: PaneSource[] = [{ data: hallA, dataUpdatedAt: 1 }]
    const { result, rerender } = renderHook(() => usePaneData(sources, {}), { wrapper: inApp('en') })
    expect(result.current.data?.type === 'stat' && result.current.data.value).toBe(40)
    sources = [{ data: { ...hallA, value: 41 }, dataUpdatedAt: 2 }]
    rerender()
    expect(result.current.data?.type === 'stat' && result.current.data.value).toBe(41)
  })
})
