import { fireEvent, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import type { NavPrefs, NavSection } from '../navPrefs'
import { SideNav } from './AppShell'
import { NavCustomizer, useCustomNav } from './NavCustomizer'

const item = (id: string, label: string) => ({ id, label, href: `/${id}` })
const sections: NavSection[] = [
  { id: 'top', items: [item('home', 'Overview')] },
  { id: 'inv', label: 'Inventory', items: [item('hosts', 'Hosts'), item('nets', 'Networks')] },
  { id: 'me', label: 'Account', locked: true, items: [item('profile', 'Profile')] },
]

function App({ initial = {}, onSave }: { initial?: NavPrefs; onSave?: (p: NavPrefs) => void }) {
  const [prefs, setPrefs] = useState<NavPrefs>(initial)
  const { nav, more } = useCustomNav(sections, prefs)
  return (
    <>
      <SideNav groups={nav} />
      <p data-testid="more">{more.map((i) => i.label).join(',')}</p>
      <NavCustomizer opened onClose={() => {}} sections={sections} prefs={prefs} onChange={(p) => { setPrefs(p); onSave?.(p) }} />
    </>
  )
}

const sidebar = () => screen.getByRole('navigation')

describe('NavCustomizer', () => {
  it('pins, puts away and moves entries, and the sidebar follows at once', async () => {
    const save = vi.fn()
    renderWithApp(<App onSave={save} />)
    const dialog = await screen.findByRole('dialog', { name: 'Customise sidebar' })
    // The first group has no heading in the sidebar, only in the dialog.
    expect(within(sidebar()).queryByText('Top')).not.toBeInTheDocument()
    expect(within(dialog).getByRole('region', { name: 'Top' })).toBeInTheDocument()
    // Locked groups are not in the dialog.
    expect(within(dialog).queryByText('Profile')).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Pin to favourites: Networks' }))
    expect(within(sidebar()).getByText('Favourites')).toBeInTheDocument()
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ pinned: ['nets'] }))
    expect(within(dialog).getByRole('button', { name: 'Unpin from favourites: Networks' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Put away under More: Hosts' }))
    expect(screen.getByTestId('more')).toHaveTextContent('Hosts')
    expect(within(sidebar()).queryByText('Hosts')).not.toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Show in the sidebar: Hosts' }))
    expect(within(sidebar()).getByText('Hosts')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Move down: Overview' }))
    const inventory = within(dialog).getByRole('region', { name: 'Inventory' })
    expect(within(inventory).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Overview', 'Hosts'])

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset to default' }))
    expect(save).toHaveBeenLastCalledWith({})
  })

  it('adds a category to rename and fill, in German too', async () => {
    renderWithApp(<App />, '/', 'de')
    const dialog = await screen.findByRole('dialog', { name: 'Seitenleiste anpassen' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kategorie hinzufügen' }))
    const name = within(dialog).getByRole('textbox', { name: 'Name der Überschrift' })
    fireEvent.change(name, { target: { value: 'Täglich' } })
    fireEvent.keyDown(name, { key: 'Enter' })
    const own = within(dialog).getByRole('region', { name: 'Täglich' })
    expect(within(own).getByText(/Noch leer/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nach unten: Networks' }))
    expect(within(within(dialog).getByRole('region', { name: 'Täglich' })).getByText('Networks')).toBeInTheDocument()
    expect(within(sidebar()).getByText('Täglich')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kategorie entfernen: Täglich' }))
    expect(within(sidebar()).queryByText('Täglich')).not.toBeInTheDocument()
  })
})
