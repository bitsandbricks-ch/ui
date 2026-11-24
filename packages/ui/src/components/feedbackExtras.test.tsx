import { notifications } from '@mantine/notifications'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { CopyText } from './CopyText'
import { useConfirm, type ConfirmOptions } from './useConfirm'

function Asker({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
  const confirm = useConfirm()
  return <button type="button" onClick={async () => onAnswer(await confirm(options))}>Remove</button>
}

describe('useConfirm', () => {
  it('answers true when you go ahead', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Asker options={{ title: 'Delete web-01?', body: 'This cannot be undone.', confirmLabel: 'Delete' }} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByText('This cannot be undone.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(true))
    expect(onAnswer).toHaveBeenCalledOnce()
  })

  it('answers false on cancel, in German too', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Asker options={{ title: 'Ohne Speichern verlassen?', tone: 'accent' }} onAnswer={onAnswer} />, '/', 'de')
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Abbrechen' }))
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(false))
  })

  it('says what it needs outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Asker options={{ title: 'x' }} onAnswer={() => {}} />)).toThrow(/BnbProvider/)
  })
})

describe('CopyText', () => {
  afterEach(() => vi.restoreAllMocks())

  it('copies the text and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const show = vi.spyOn(notifications, 'show')
    renderWithApp(<CopyText text="192.0.2.10" />)
    const button = screen.getByRole('button', { name: '192.0.2.10' })
    expect(button).toHaveAttribute('title', 'Copy 192.0.2.10')
    fireEvent.click(button)
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'ok', message: 'Copied 192.0.2.10' })))
    expect(writeText).toHaveBeenCalledWith('192.0.2.10')
  })

  it('says when the browser blocks the clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('no')) }, configurable: true })
    const show = vi.spyOn(notifications, 'show')
    renderWithApp(<CopyText text="abc">the token</CopyText>, '/', 'de')
    fireEvent.click(screen.getByRole('button', { name: 'the token' }))
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'err' })))
    expect(show.mock.calls[0][0].message).toContain('Kopieren fehlgeschlagen')
  })
})
