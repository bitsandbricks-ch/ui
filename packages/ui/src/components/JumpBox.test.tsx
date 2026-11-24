import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { JumpBox, type JumpItem } from './JumpBox'

const kinds = { page: 'Page', host: 'Host', command: 'Do' }

function setup(extra: Partial<Parameters<typeof JumpBox>[0]> = {}) {
  const onNavigate = vi.fn()
  const onClose = vi.fn()
  const signOut = vi.fn()
  const items: JumpItem[] = [
    { id: 'p:hosts', label: 'Hosts', kind: 'page', href: '/hosts' },
    { id: 'p:settings', label: 'Settings', kind: 'page', href: '/settings' },
    { id: 'h:web1', label: 'web-1', hint: 'zurich', kind: 'host', href: '/hosts/web-1' },
    { id: 'c:out', label: 'Sign out', kind: 'command', run: signOut },
  ]
  renderWithApp(<JumpBox opened onClose={onClose} items={items} kinds={kinds} onNavigate={onNavigate} {...extra} />)
  return { onNavigate, onClose, signOut }
}

describe('JumpBox', () => {
  it('shows recent things and the pages before anything is typed', async () => {
    setup({ recent: [{ id: 'h:web1', label: 'web-1', kind: 'host', href: '/hosts/web-1' }] })
    const options = await screen.findAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['Recentweb-1', 'PageHosts', 'PageSettings'])
  })

  it('matches loosely and goes with Enter', async () => {
    const { onNavigate, onClose } = setup()
    const box = await screen.findByRole('combobox', { name: 'Jump to' })
    fireEvent.change(box, { target: { value: 'zuri' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(onClose).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('/hosts/web-1', expect.objectContaining({ id: 'h:web1' }))
  })

  it('moves with the arrows and runs a command', async () => {
    const { signOut, onNavigate } = setup()
    const box = await screen.findByRole('combobox')
    fireEvent.change(box, { target: { value: 's' } })
    const labels = screen.getAllByRole('option').map((o) => o.textContent)
    const target = labels.indexOf('DoSign out')
    for (let i = 0; i < target; i++) fireEvent.keyDown(box, { key: 'ArrowDown' })
    expect(screen.getAllByRole('option')[target]).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(signOut).toHaveBeenCalledOnce()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('says when nothing matches', async () => {
    setup()
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: 'qqq' } })
    expect(screen.getByText('Nothing matches')).toBeInTheDocument()
  })

  it('speaks German', async () => {
    renderWithApp(<JumpBox opened onClose={() => {}} items={[]} />, '/', 'de')
    expect(await screen.findByPlaceholderText('Zu einer Seite springen oder einen Befehl ausführen')).toBeInTheDocument()
    expect(screen.getByText('Nichts passt')).toBeInTheDocument()
  })
})
