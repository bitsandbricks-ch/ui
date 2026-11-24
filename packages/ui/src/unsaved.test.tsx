import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../test/render'
import { hasUnsaved, useConfirmLeave, useDraft, useHasUnsaved, useUnsaved } from './unsaved'

function Form({ what, onSave, draft }: { what?: string; onSave?: () => void; draft?: boolean }) {
  const [text, setText] = useState('')
  const unsaved = useUnsaved(text !== '', { what, onSave, draft })
  return (
    <>
      <input aria-label="Name" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" onClick={unsaved.release}>Deleted</button>
      <button type="button" onClick={() => setText('')}>Saved</button>
    </>
  )
}

function Leave({ onAnswer }: { onAnswer: (ok: boolean) => void }) {
  const confirmLeave = useConfirmLeave()
  const unsaved = useHasUnsaved()
  return <button type="button" onClick={async () => onAnswer(await confirmLeave())}>Leave{unsaved ? ' (unsaved)' : ''}</button>
}

afterEach(() => localStorage.clear())

describe('useUnsaved', () => {
  it('marks changes while dirty, and holds the tab open', () => {
    renderWithApp(<><Form /><Leave onAnswer={() => {}} /></>)
    expect(hasUnsaved()).toBe(false)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'web-01' } })
    expect(hasUnsaved()).toBe(true)
    expect(screen.getByRole('button', { name: 'Leave (unsaved)' })).toBeInTheDocument()
    const e = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Saved' }))
    expect(hasUnsaved()).toBe(false)
  })

  it('forgets changes on release, until the form is changed again after a save', () => {
    renderWithApp(<Form />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'a' } })
    fireEvent.click(screen.getByRole('button', { name: 'Deleted' }))
    expect(hasUnsaved()).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Saved' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'b' } })
    expect(hasUnsaved()).toBe(true)
  })

  it('saves on Ctrl or Cmd S while dirty, never the browser’s save', () => {
    const onSave = vi.fn()
    renderWithApp(<Form onSave={onSave} />)
    const clean = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, cancelable: true })
    window.dispatchEvent(clean)
    expect(clean.defaultPrevented).toBe(true)
    expect(onSave).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'x' } })
    fireEvent.keyDown(window, { key: 's', metaKey: true })
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('is cleared when its form goes away', () => {
    const { unmount } = renderWithApp(<Form />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'x' } })
    unmount()
    expect(hasUnsaved()).toBe(false)
  })
})

describe('useConfirmLeave', () => {
  it('lets you go when nothing is unsaved, and asks naming what is', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<><Form what="your settings" /><Form what="the new key" /><Leave onAnswer={onAnswer} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Leave' }))
    await waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith(true))
    const [a, b] = screen.getAllByLabelText('Name')
    fireEvent.change(a, { target: { value: 'x' } })
    fireEvent.change(b, { target: { value: 'y' } })
    fireEvent.click(screen.getByRole('button', { name: 'Leave (unsaved)' }))
    expect(await screen.findByText('Leave without saving your settings and the new key?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Stay' }))
    await waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith(false))
    expect(hasUnsaved()).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Leave (unsaved)' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Leave' }))
    await waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith(true))
    expect(hasUnsaved()).toBe(false)
  })

  it('says the changes stay as a draft, in German', async () => {
    renderWithApp(<><Form draft /><Leave onAnswer={() => {}} /></>, '/', 'de')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: /Leave/ }))
    expect(await screen.findByText('Ohne Speichern verlassen?')).toBeInTheDocument()
    expect(screen.getByText(/bleiben als Entwurf/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Verlassen' }))
  })
})

function Draft({ server, ready = true }: { server: string; ready?: boolean }) {
  const [text, setText] = useState(server)
  const draft = useDraft('host:web-01', text, { dirty: text !== server, ready, apply: setText, delay: 10 })
  return (
    <>
      <input aria-label="Name" value={text} onChange={(e) => setText(e.target.value)} />
      {draft.offer && <button type="button" onClick={draft.restore}>Restore</button>}
      {draft.offer && <button type="button" onClick={draft.discard}>Discard</button>}
      <button type="button" onClick={() => { draft.clear(); setText(server) }}>Save</button>
    </>
  )
}

describe('useDraft', () => {
  it('keeps changes in this browser and offers them back next time', async () => {
    const first = render(<Draft server="web-01" />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'web-02' } })
    await waitFor(() => expect(localStorage.getItem('bnb-draft:host:web-01')).toContain('web-02'))
    first.unmount()

    render(<Draft server="web-01" />)
    expect(screen.getByLabelText('Name')).toHaveValue('web-01')
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))
    expect(screen.getByLabelText('Name')).toHaveValue('web-02')
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull()
  })

  it('writes nothing before the server answered, drops a draft on discard and after a save', async () => {
    localStorage.setItem('bnb-draft:host:web-01', JSON.stringify({ at: Date.now(), data: 'old' }))
    const { rerender } = render(<Draft server="web-01" ready={false} />)
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull()
    rerender(<Draft server="web-01" />)
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(localStorage.getItem('bnb-draft:host:web-01')).toBeNull()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'web-03' } })
    await waitFor(() => expect(localStorage.getItem('bnb-draft:host:web-01')).toContain('web-03'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await act(() => new Promise((r) => setTimeout(r, 30)))
    expect(localStorage.getItem('bnb-draft:host:web-01')).toBeNull()
  })

  it('drops a draft past its age', () => {
    localStorage.setItem('bnb-draft:host:web-01', JSON.stringify({ at: Date.now() - 20 * 24 * 3600 * 1000, data: 'old' }))
    render(<Draft server="web-01" />)
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull()
    expect(localStorage.getItem('bnb-draft:host:web-01')).toBeNull()
  })
})
