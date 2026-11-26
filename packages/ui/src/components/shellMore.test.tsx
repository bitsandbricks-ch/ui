// Mantine hides a popover's dropdown in jsdom (no layout), so its buttons are found with hidden: true.
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { IconHome, IconServer } from '@tabler/icons-react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import type { SavedView } from '../savedViews'
import { PhoneDock } from './PhoneDock'
import { SaveViewButton } from './SaveViewButton'
import { SidePanel } from './SidePanel'

describe('PhoneDock', () => {
  const items = [
    { id: 'home', label: 'Overview', href: '/', icon: <IconHome size={20} /> },
    { id: 'hosts', label: 'Hosts', href: '/hosts', icon: <IconServer size={20} />, badge: 3 },
  ]
  it('says More, lit with a dot, when the page shown is under it, and shows the status line in its sheet', async () => {
    const { container } = renderWithApp(<PhoneDock items={items} current="Settings" status={<span>5 down</span>}
      more={[{ items: [{ id: 'settings', label: 'Settings', href: '/settings', active: true }] }]} />)
    expect(screen.getByRole('link', { name: /Hosts/ })).toHaveAttribute('href', '/hosts')
    const more = screen.getByRole('button', { name: /^More.*Settings$/ })
    expect(more).toHaveClass('is-active')
    expect(container.querySelector('.bnb-dock-here')).not.toBeNull()
    expect(container.querySelector('.bnb-dock')).toHaveClass('has-status')
    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('dialog', { name: 'Every page' })).toBeInTheDocument()
    expect(screen.getByText('5 down')).toBeInTheDocument()
  })
  it('says More when the page is in the bar, in German', () => {
    renderWithApp(<PhoneDock items={[{ ...items[0], active: true }, items[1]]} current="Overview" more={[{ items: [] }]} />, '/', 'de')
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Mehr' })).toBeInTheDocument()
  })
})

describe('SaveViewButton', () => {
  function Host({ onChange }: { onChange: (v: SavedView[]) => void }) {
    const [views, setViews] = useState<SavedView[]>([])
    return <SaveViewButton views={views} path="/hosts?state=down" suggest="Hosts · down" onChange={(v) => { setViews(v); onChange(v) }} />
  }
  it('saves the page under a name, then removes it', async () => {
    const onChange = vi.fn()
    renderWithApp(<Host onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save this view' }))
    const field = await screen.findByLabelText('Save this page, with its filter, as')
    expect(field).toHaveValue('Hosts · down')
    fireEvent.change(field, { target: { value: 'Down hosts' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Save', hidden: true }))
    expect(onChange).toHaveBeenLastCalledWith([{ name: 'Down hosts', path: '/hosts?state=down' }])
    const star = screen.getByRole('button', { name: 'Saved as Down hosts' })
    expect(star).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(star)
    fireEvent.click(await screen.findByRole('button', { name: 'Remove', hidden: true }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})

describe('SidePanel extras', () => {
  it('steps through the list, copies its link and resizes with the keys', async () => {
    const prev = vi.fn()
    const next = vi.fn()
    const write = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: write } })
    localStorage.clear()
    renderWithApp(<SidePanel title="web-1" onClose={() => {}} onPrev={prev} onNext={next} copyHref="https://app.example/hosts/web-1"
      resizable={{ storageKey: 'test-side' }}>body</SidePanel>)
    fireEvent.click(await screen.findByRole('button', { name: 'The one above in the list' }))
    fireEvent.click(screen.getByRole('button', { name: 'The one below in the list' }))
    expect(prev).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Copy a link to its page' }))
    expect(write).toHaveBeenCalledWith('https://app.example/hosts/web-1')
    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument()
    const grip = screen.getByRole('separator', { name: /Panel width/ })
    expect(grip).toHaveAttribute('aria-valuenow', '440')
    fireEvent.keyDown(grip, { key: 'ArrowLeft' })
    await waitFor(() => expect(grip).toHaveAttribute('aria-valuenow', '480'))
    expect(localStorage.getItem('test-side')).toBe('480')
  })
})
