import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { AppShell } from './AppShell'
import { PageHead } from './PageHead'

const nav = [
  { items: [{ id: 'home', label: 'Overview', href: '/' }] },
  { label: 'Inventory', items: [{ id: 'hosts', label: 'Hosts', href: '/hosts', active: true, badge: 3 }] },
]

describe('AppShell', () => {
  it('draws the grouped sidebar with the active page marked, and the page', () => {
    renderWithApp(<AppShell brand="Labdex" nav={nav} title="Hosts"><PageHead title="Hosts" actions={<button type="button">Add</button>} /></AppShell>)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Hosts/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('bnb-dot-grid')
    expect(screen.getByRole('heading', { level: 1, name: 'Hosts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#bnb-main')
  })

  it("puts the app's own part above the links and folds a group from its heading", () => {
    const onToggle = vi.fn()
    const groups = [
      { id: 'inv', label: 'Inventory', collapsible: true, open: false, onToggle, items: [{ id: 'hosts', label: 'Hosts', href: '/hosts' }] },
      { id: 'admin', label: 'Admin', collapsible: true, open: false, items: [{ id: 'users', label: 'Users', href: '/users', active: true }] },
    ]
    renderWithApp(<AppShell brand="Labdex" nav={groups} navTop={<button type="button">Event: Spring</button>}><p>page</p></AppShell>)
    expect(screen.getByRole('button', { name: 'Event: Spring' })).toBeInTheDocument()
    // Folded away, but the group with the page on screen keeps its links.
    expect(screen.queryByRole('link', { name: 'Hosts' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Inventory' }))
    expect(onToggle).toHaveBeenCalled()
  })

  it("folds the sidebar to icons and shows a link's button", () => {
    function Shell() {
      const [folded, setFolded] = useState(false)
      const items = [{ id: 'hosts', label: 'Hosts', href: '/hosts', icon: <span>H</span>, action: <button type="button">Pin Hosts</button> }]
      return <AppShell brand="Labdex" nav={[{ items }]} folded={folded} onFoldedChange={setFolded}><p>page</p></AppShell>
    }
    renderWithApp(<Shell />)
    expect(screen.getByRole('button', { name: 'Pin Hosts' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fold the sidebar' }))
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveAttribute('title', 'Hosts')
    expect(screen.queryByRole('button', { name: 'Pin Hosts' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unfold the sidebar' })).toBeInTheDocument()
  })

  it('opens another site in a new tab', () => {
    renderWithApp(<AppShell brand="Labdex" nav={[{ items: [{ id: 'wiki', label: 'Wiki', href: 'https://example.com', external: true }] }]}><p>page</p></AppShell>)
    expect(screen.getByRole('link', { name: 'Wiki' })).toHaveAttribute('target', '_blank')
  })
})
