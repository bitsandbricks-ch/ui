import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { ConfirmButton, ConfirmIcon } from './Confirm'

describe('ConfirmIcon', () => {
  it('asks before it acts, and does nothing on cancel', async () => {
    const onConfirm = vi.fn()
    renderWithApp(<ConfirmIcon label="Delete Doors open" onConfirm={onConfirm}>x</ConfirmIcon>)
    fireEvent.click(screen.getByRole('button', { name: 'Delete Doors open' }))
    expect(await screen.findByText('Delete Doors open: are you sure?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Delete Doors open' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, go ahead' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})

describe('ConfirmButton', () => {
  it('acts straight away unless it is dangerous', async () => {
    const save = vi.fn()
    const wipe = vi.fn()
    renderWithApp(<><ConfirmButton label="Save" onConfirm={save} /><ConfirmButton label="Wipe" danger onConfirm={wipe} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(save).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Wipe' }))
    expect(wipe).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, go ahead' }))
    expect(wipe).toHaveBeenCalledOnce()
  })
})
