import { fireEvent, screen, within } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { LinkContext } from './SidePanel'
import { LinkTabs, PageTabs } from './Tabs'

describe('PageTabs alert', () => {
  it('marks a tab that needs a look with a status bit', () => {
    renderWithApp(<PageTabs label="Agents" active="a" onChange={vi.fn()}
      tabs={[{ id: 'a', label: 'Hall A', count: null }, { id: 'b', label: 'Hall B', count: 3, alert: 'down' }]} />)
    const tab = screen.getByRole('tab', { name: /Hall B/ })
    expect(tab.querySelector('.bnb-bit.is-err')).not.toBeNull()
    expect(screen.getByRole('tab', { name: 'Hall A' }).querySelector('.bnb-bit')).toBeNull()
  })
})

describe('LinkTabs', () => {
  const tabs = [
    { id: 'problems', label: 'Problems', href: '/problems', count: 4, alert: 'warn' as const },
    { id: 'handover', label: 'Handover', href: '/handover' },
    { id: 'drafts', label: 'Drafts', href: '/drafts', hidden: 'Only leads see this' },
  ]

  it('draws each tab as a link to its page and marks the one shown', () => {
    renderWithApp(<LinkTabs label="Helpdesk" tabs={tabs} active="handover" />)
    const nav = screen.getByRole('navigation', { name: 'Helpdesk' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/problems', '/handover', '/drafts'])
    expect(screen.getByRole('link', { name: 'Handover' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Problems/ })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: /Problems/ }).querySelector('.bnb-bit.is-warn')).not.toBeNull()
  })

  it('says why a tab is hidden from most people', () => {
    renderWithApp(<LinkTabs label="Helpdesk" tabs={tabs} active="problems" />)
    expect(screen.getByRole('link', { name: 'Drafts, Only leads see this' })).toHaveClass('bnb-tab-hidden')
  })

  it("uses the app's router link when there is one", () => {
    const Link = ({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => <a data-router href={to} {...rest} />
    renderWithApp(<LinkContext.Provider value={Link}><LinkTabs label="Helpdesk" tabs={tabs} active="problems" /></LinkContext.Provider>)
    expect(screen.getByRole('link', { name: 'Handover' })).toHaveAttribute('data-router')
  })
})

describe('tabs that do not fit', () => {
  const six = ['Overview', 'Ports', 'Seats', 'Telemetry', 'Logs', 'Config'].map((l) => ({ id: l.toLowerCase(), label: l }))
  // jsdom has no layout: every tab and the More button are 100 px wide, the row 350 px.
  const layout = (fn: () => void) => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect)
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(350)
    try { fn() } finally { rect.mockRestore(); width.mockRestore() }
  }

  it('keeps one row and puts the rest under More, never scrolling sideways', async () => {
    const onChange = vi.fn()
    layout(() => { renderWithApp(<PageTabs label="Switch" active="overview" onChange={onChange} tabs={six} />) })
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Overview', 'Ports'])
    fireEvent.click(screen.getByRole('button', { name: 'More 4' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Logs' }))
    expect(onChange).toHaveBeenCalledWith('logs')
  })

  it('keeps the tab being shown in the row', () => {
    layout(() => { renderWithApp(<LinkTabs label="Switch" active="logs" tabs={six.map((t) => ({ ...t, href: `/${t.id}` }))} />) })
    const nav = screen.getByRole('navigation', { name: 'Switch' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Overview', 'Logs'])
    expect(screen.getByRole('link', { name: 'Logs' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows every tab when they fit', () => {
    renderWithApp(<PageTabs label="Switch" active="overview" onChange={vi.fn()} tabs={six} />)
    expect(screen.getAllByRole('tab')).toHaveLength(6)
    expect(screen.queryByRole('button', { name: /^More/ })).toBeNull()
  })
})
