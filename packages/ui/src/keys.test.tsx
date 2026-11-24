import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { isTyping, keysOn, useKeys, useModKey } from './keys'

function Page({ map, mod }: { map: Record<string, () => void>; mod?: () => void }) {
  useKeys(map)
  useModKey('k', mod ?? (() => {}))
  return <main><input aria-label="field" /></main>
}

describe('useKeys', () => {
  it('runs a page key and leaves typing, modifiers and used keys alone', () => {
    const reload = vi.fn()
    const help = vi.fn()
    const { getByLabelText } = render(<Page map={{ r: reload, '?': help }} />)
    fireEvent.keyDown(window, { key: 'r' })
    fireEvent.keyDown(window, { key: '?' })
    expect(reload).toHaveBeenCalledOnce()
    expect(help).toHaveBeenCalledOnce()
    fireEvent.keyDown(getByLabelText('field'), { key: 'r' })
    fireEvent.keyDown(window, { key: 'r', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'x' })
    expect(reload).toHaveBeenCalledOnce()
  })
  it('waits while a dialog is open', () => {
    const reload = vi.fn()
    render(<><Page map={{ r: reload }} /><div role="dialog" aria-modal="true" /></>)
    fireEvent.keyDown(window, { key: 'r' })
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('useModKey', () => {
  it('fires on ctrl+k and ⌘k, even in a text field', () => {
    const jump = vi.fn()
    const { getByLabelText } = render(<Page map={{}} mod={jump} />)
    fireEvent.keyDown(getByLabelText('field'), { key: 'k', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'K', metaKey: true })
    fireEvent.keyDown(window, { key: 'k' })
    expect(jump).toHaveBeenCalledTimes(2)
  })
})

describe('isTyping', () => {
  it('knows fields', () => {
    expect(isTyping(document.createElement('textarea'))).toBe(true)
    expect(isTyping(document.createElement('button'))).toBe(false)
    expect(isTyping(null)).toBe(false)
  })
})

describe('keysOn', () => {
  it('reads the keys from buttons, one per key, an enabled one first', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <button aria-keyshortcuts="r" disabled>Reload</button>
      <button aria-keyshortcuts="r">Reload now</button>
      <button aria-keyshortcuts="n" aria-label="New host">+</button>
      <button aria-keyshortcuts="/">Filter</button>
      <button>No key</button>`
    expect(keysOn(root, ['/'])).toEqual([
      { key: 'r', label: 'Reload now', off: false },
      { key: 'n', label: 'New host', off: false },
    ])
    expect(keysOn(null)).toEqual([])
  })
})
