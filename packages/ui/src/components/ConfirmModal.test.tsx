import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { ConfirmModal } from './Confirm'

describe('ConfirmModal', () => {
  it('confirms, then closes', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    renderWithApp(<ConfirmModal open title="Delete web-01" body="It goes for good." onConfirm={onConfirm} onClose={onClose} />)
    expect(await screen.findByText('It goes for good.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Yes, go ahead' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes without confirming on cancel', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    renderWithApp(<ConfirmModal open title="Delete web-01" onConfirm={onConfirm} onClose={onClose} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('takes its own button words, and speaks German', async () => {
    const { unmount } = renderWithApp(<ConfirmModal open title="Publish" confirmLabel="Publish now" cancelLabel="Not yet" tone="accent" onConfirm={() => {}} onClose={() => {}} />)
    expect(await screen.findByRole('button', { name: 'Publish now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not yet' })).toBeInTheDocument()
    unmount()
    renderWithApp(<ConfirmModal open title="Löschen" onConfirm={() => {}} onClose={() => {}} />, '/', 'de')
    expect(await screen.findByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
  })

  it('shows nothing while closed', () => {
    renderWithApp(<ConfirmModal open={false} title="Delete web-01" onConfirm={() => {}} onClose={() => {}} />)
    expect(screen.queryByText('Delete web-01')).not.toBeInTheDocument()
  })
})
