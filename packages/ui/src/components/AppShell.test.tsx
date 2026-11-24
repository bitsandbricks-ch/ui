import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
