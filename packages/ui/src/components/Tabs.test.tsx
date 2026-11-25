import { screen, within } from '@testing-library/react'
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
