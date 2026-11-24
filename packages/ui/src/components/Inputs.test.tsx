import { notifications } from '@mantine/notifications'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { copyToClipboard } from '../clipboard'
import { CopyField } from './CopyField'
import { Fold } from './Fold'
import { MultiPick, type MultiPickOption } from './MultiPick'
import { ShareButton } from './ShareButton'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

function stubClipboard(ok = true) {
  const writeText = vi.fn(async () => { if (!ok) throw new Error('blocked') })
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return writeText
}

describe('copyToClipboard', () => {
  it('uses the Clipboard API', async () => {
    const writeText = stubClipboard()
    expect(await copyToClipboard('abc')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('abc')
  })
})

describe('CopyField', () => {
  it('copies its value and says so on the button', async () => {
    const writeText = stubClipboard()
    renderWithApp(<CopyField label="Invite link" value="https://example.com/join/abc" />)
    expect(screen.getByLabelText('Invite link')).toHaveValue('https://example.com/join/abc')
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith('https://example.com/join/abc')
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })
})

describe('ShareButton', () => {
  it('copies the link with a toast where there is no share sheet', async () => {
    const show = vi.spyOn(notifications, 'show').mockReturnValue('t')
    const writeText = stubClipboard()
    renderWithApp(<ShareButton url="https://example.com/e/1" title="LAN" />)
    await userEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(writeText).toHaveBeenCalledWith('https://example.com/e/1')
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'ok', message: 'Link copied' })))
  })

  it("opens the phone's share sheet on a touch screen", async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    const matchMedia = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...matchMedia(q), matches: q === '(pointer: coarse)' })) as typeof window.matchMedia
    try {
      renderWithApp(<ShareButton url="https://example.com/e/1" title="LAN" text="Join us" iconOnly />)
      await userEvent.click(screen.getByRole('button', { name: 'Share' }))
      expect(share).toHaveBeenCalledWith({ title: 'LAN', text: 'Join us', url: 'https://example.com/e/1' })
    } finally {
      window.matchMedia = matchMedia
      Reflect.deleteProperty(navigator, 'share')
    }
  })
})

describe('Fold', () => {
  it('remembers that it was opened', () => {
    const { unmount } = renderWithApp(<Fold storageKey="fold-test" summary="Packing list">Items</Fold>)
    const details = screen.getByText('Packing list').closest('details')!
    expect(details.open).toBe(false)
    details.open = true
    fireEvent(details, new Event('toggle'))
    expect(localStorage.getItem('fold-test')).toBe('1')
    unmount()
    renderWithApp(<Fold storageKey="fold-test" summary="Packing list">Items</Fold>)
    expect(screen.getByText('Packing list').closest('details')!.open).toBe(true)
  })

  it('opens when forced', () => {
    renderWithApp(<Fold storageKey="fold-forced" summary="Seats" open>Plan</Fold>)
    expect(screen.getByText('Seats').closest('details')!.open).toBe(true)
  })
})

const people: MultiPickOption[] = [
  { value: 'anna', label: 'Anna' },
  { value: 'ben', label: 'Ben', hint: 'not coming' },
  { value: 'cleo', label: 'Cleo' },
]

function Picker({ onChange }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>(['anna'])
  return (
    <form data-testid="form">
      <MultiPick label="Drivers" name="driver" options={people} value={value}
        onChange={(v) => { setValue(v); onChange?.(v) }}
        presets={[{ label: 'Everyone coming', values: ['anna', 'cleo'] }]} />
    </form>
  )
}

describe('MultiPick', () => {
  it('posts each pick as a hidden input and applies a quick pick', async () => {
    renderWithApp(<Picker />)
    const form = screen.getByTestId('form') as HTMLFormElement
    expect(new FormData(form).getAll('driver')).toEqual(['anna'])
    const preset = screen.getByRole('button', { name: 'Everyone coming' })
    expect(preset).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(preset)
    expect(new FormData(form).getAll('driver')).toEqual(['anna', 'cleo'])
    expect(preset).toHaveAttribute('aria-pressed', 'true')
  })

  it('says when nobody is picked', () => {
    renderWithApp(<MultiPick label="Drivers" options={people} value={[]} onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Nobody picked')).toBeInTheDocument()
  })
})
