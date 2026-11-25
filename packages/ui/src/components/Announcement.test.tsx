import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { AnnouncementBadge, AnnouncementEditor, type Announcement } from './Announcement'

const notice: Announcement = { text: 'Hall B power off at 22:00', level: 'warn', at: Date.UTC(2026, 2, 16, 9, 30), by: 'Mike' }

describe('AnnouncementBadge', () => {
  beforeEach(() => localStorage.clear())

  it('shows nothing without an announcement', () => {
    const { container } = renderWithApp(<AnnouncementBadge notice={null} />)
    expect(container.querySelector('.bnb-notice-badge')).toBeNull()
  })

  it('opens the full text, and goes quiet once read until a new one goes up', async () => {
    const { rerender } = renderWithApp(<AnnouncementBadge notice={notice} storageKey="test-read" />)
    const badge = screen.getByRole('button', { name: 'Announcement: Hall B power off at 22:00' })
    expect(badge).toHaveClass('is-warn')
    fireEvent.click(badge)
    expect(await screen.findByText(/^Mike, /)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read', hidden: true }))
    expect(badge).toHaveClass('is-quiet')
    rerender(<AnnouncementBadge notice={{ ...notice, text: 'Doors open', at: notice.at as number + 60000 }} storageKey="test-read" />)
    expect(screen.getByRole('button', { name: 'Announcement: Doors open' })).toHaveClass('is-warn')
  })

  it('offers Change and Take down when the app allows it', async () => {
    const edit = vi.fn(), down = vi.fn()
    renderWithApp(<AnnouncementBadge notice={notice} onEdit={edit} onTakeDown={down} />)
    fireEvent.click(screen.getByRole('button', { name: /^Announcement:/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Take down', hidden: true }))
    expect(down).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Change', hidden: true }))
    expect(edit).toHaveBeenCalledOnce()
  })
})

describe('AnnouncementEditor', () => {
  it('saves the text, level and how long it stays up', () => {
    const save = vi.fn()
    renderWithApp(<AnnouncementEditor opened onSave={save} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Put up' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: '  Doors open at 18:00 ' } })
    expect(screen.getByText('258 characters left')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Warning'))
    fireEvent.click(screen.getByRole('button', { name: 'Put up' }))
    expect(save).toHaveBeenCalledWith({ text: 'Doors open at 18:00', level: 'warn', hours: 0 })
  })

  it('speaks German', () => {
    renderWithApp(<AnnouncementEditor opened current={notice} onSave={vi.fn()} onTakeDown={vi.fn()} onClose={vi.fn()} />, '/', 'de')
    expect(screen.getByRole('button', { name: 'Entfernen' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nachricht' })).toHaveValue('Hall B power off at 22:00')
  })
})
