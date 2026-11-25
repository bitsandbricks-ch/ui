import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { CommandPalette, createCommandPalette, filterGroups, type PaletteGroup } from './CommandPalette'

const theme = vi.fn()
const groups: PaletteGroup[] = [
  { id: 'pages', label: 'Pages', items: [
    { id: 'hosts', label: 'Hosts', href: '/hosts' },
    { id: 'settings', label: 'Settings', href: '/settings', keywords: ['preferences'] },
  ] },
  { id: 'appearance', label: 'Appearance', commands: true, items: [
    { id: 'theme', label: 'Switch the theme', description: 'now light', keywords: ['dark', 'night'], onSelect: theme },
    { id: 'bigger', label: 'Bigger text', onSelect: () => {} },
  ] },
]

describe('filterGroups', () => {
  it('ranks within groups, finds keywords and drops empty groups', () => {
    expect(filterGroups(groups, 'night').map((g) => g.items.map((i) => i.id))).toEqual([['theme']])
    expect(filterGroups(groups, 'preferences')[0].items[0].id).toBe('settings')
    expect(filterGroups(groups, 'zzz')).toEqual([])
  })
  it('narrows to commands with a leading ">"', () => {
    expect(filterGroups(groups, '>').map((g) => g.id)).toEqual(['appearance'])
    expect(filterGroups(groups, '> big').map((g) => g.items.map((i) => i.id))).toEqual([['bigger']])
  })
})

// Spotlight draws a group's heading in CSS; the group carries it as its accessible name.
const groupLabels = () => screen.queryAllByRole('group').map((g) => g.getAttribute('aria-label'))

function setup(props: Partial<Parameters<typeof CommandPalette>[0]> = {}, locale: 'en' | 'de' = 'en') {
  const [store, palette] = createCommandPalette()
  const onNavigate = vi.fn()
  renderWithApp(<CommandPalette store={store} groups={groups} onNavigate={onNavigate} {...props} />, '/', locale)
  act(() => palette.open())
  return { onNavigate, palette }
}

describe('CommandPalette', () => {
  it('shows recent things and every group before anything is typed, and goes on a click', async () => {
    const { onNavigate } = setup({ recent: [{ id: 'web1', label: 'web-1', href: '/hosts/web-1' }] })
    await screen.findByRole('button', { name: /web-1/ })
    expect(groupLabels()).toEqual(['Recent', 'Pages', 'Appearance'])
    fireEvent.click(screen.getByRole('button', { name: /web-1/ }))
    expect(onNavigate).toHaveBeenCalledWith('/hosts/web-1', expect.objectContaining({ id: 'web1' }))
  })

  it('runs a command found by a keyword', async () => {
    setup()
    fireEvent.change(await screen.findByPlaceholderText('Jump to a page or run a command'), { target: { value: 'dark' } })
    expect(screen.queryByText('Hosts')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Switch the theme/ }))
    expect(theme).toHaveBeenCalled()
  })

  it('adds the app results as they come, and never an old answer', async () => {
    const search = vi.fn(async (q: string) => [{ id: 'hosts-found', label: 'Hosts found', items: [{ id: `h:${q}`, label: `${q}-db`, href: `/hosts/${q}-db` }] }])
    setup({ search, debounce: 0 })
    const box = await screen.findByPlaceholderText('Jump to a page or run a command')
    fireEvent.change(box, { target: { value: 'zu' } })
    expect(await screen.findByText('zu-db')).toBeInTheDocument()
    expect(groupLabels()).toContain('Hosts found')
    fireEvent.change(box, { target: { value: '>' } })
    expect(screen.queryByText('zu-db')).not.toBeInTheDocument()
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1))
  })

  it('picks the first of the app results when only they match, so Enter goes there', async () => {
    const onNavigate = vi.fn()
    const search = vi.fn(async (q: string) => [{ id: 'hosts-found', label: 'Hosts found', items: [{ id: `h:${q}`, label: `${q}-db`, href: `/hosts/${q}-db` }] }])
    setup({ search, debounce: 0, onNavigate })
    const box = await screen.findByPlaceholderText('Jump to a page or run a command')
    fireEvent.change(box, { target: { value: 'qx' } })
    const row = (await screen.findByText('qx-db')).closest('[data-action]')
    await waitFor(() => expect(row).toHaveAttribute('data-selected', 'true'))
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter' })
    expect(onNavigate).toHaveBeenCalledWith('/hosts/qx-db', expect.objectContaining({ id: 'h:qx' }))
  })

  it('says when nothing matches, in German', async () => {
    setup({}, 'de')
    fireEvent.change(await screen.findByPlaceholderText('Zu einer Seite springen oder einen Befehl ausführen'), { target: { value: 'qqq' } })
    expect(screen.getByText('Nichts passt')).toBeInTheDocument()
  })
})
