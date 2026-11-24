import { fireEvent, screen, within } from '@testing-library/react'
import { forwardRef, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { GlanceList } from './GlanceList'
import { SectionLayout, type SectionDef } from './SectionLayout'
import { Segmented } from './Segmented'
import { LinkContext } from './SidePanel'
import { PageTabs } from './Tabs'

const sections: SectionDef[] = [
  { id: 'overview', label: 'Overview', href: '?tab=overview' },
  { id: 'costs', label: 'Costs', href: '?tab=costs', status: 'You owe CHF 12', dot: true },
  { id: 'travel', label: 'Travel', href: '?tab=travel', status: '3 cars' },
]

describe('SectionLayout', () => {
  it('lists the other sections as rows on the hub, and marks the open one in the sidebar', () => {
    renderWithApp(<SectionLayout label="Sections" sections={sections} active="overview"><p>Hub</p></SectionLayout>)
    // The hub's rows for phones; wide screens show the sidebar (navigation) instead.
    const rows = within(screen.getByRole('list', { name: 'Sections' })).getAllByRole('link')
    expect(rows.map((r) => r.getAttribute('href'))).toEqual(['?tab=costs', '?tab=travel'])
    expect(within(rows[0]).getByText('You owe CHF 12')).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Sections' })).getByRole('link', { name: 'Overview' }))
      .toHaveAttribute('aria-current', 'page')
  })

  it('shows a back link to the hub inside a section, and calls onSelect for buttons', () => {
    const onSelect = vi.fn()
    const plain = sections.map((s) => ({ ...s, href: undefined }))
    renderWithApp(<SectionLayout label="Sections" sections={plain} active="costs" onSelect={onSelect}><p>Costs</p></SectionLayout>)
    expect(screen.queryByRole('list', { name: 'Sections' })).toBeNull()
    const back = screen.getAllByRole('button', { name: 'Overview' }).find((b) => b.className === 'bnb-sections-back')!
    fireEvent.click(back)
    expect(onSelect).toHaveBeenCalledWith('overview')
  })

  it("uses the app's link component", () => {
    const Link = forwardRef<HTMLAnchorElement, { to: string; children: ReactNode }>(({ to, children, ...rest }, ref) => (
      <a ref={ref} data-router="yes" href={`/app${to}`} {...rest}>{children}</a>
    ))
    renderWithApp(<LinkContext.Provider value={Link}><SectionLayout label="Sections" sections={sections} active="overview">x</SectionLayout></LinkContext.Provider>)
    expect(screen.getAllByRole('link', { name: /Travel/ })[0]).toHaveAttribute('href', '/app?tab=travel')
  })
})

describe('GlanceList', () => {
  it('shows one row per part, with its status, dot and hidden reason', () => {
    renderWithApp(<GlanceList title="At a glance" rows={[
      { id: 'costs', label: 'Costs', href: '?tab=costs', status: 'You owe CHF 12', dot: true },
      { id: 'seats', label: 'Seats', href: '?tab=seats', status: 'Draft', hidden: 'Only organisers see this for now' },
      { id: 'games', label: 'Games', status: 'Opens later' },
    ]} />)
    expect(screen.getByRole('link', { name: /Costs/ })).toHaveAttribute('href', '?tab=costs')
    expect(screen.getByText('You owe CHF 12')).toHaveClass('is-due')
    expect(screen.getByRole('link', { name: /Seats, Only organisers see this for now/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Games/ })).toBeNull()
    expect(screen.getByText('Opens later')).toBeInTheDocument()
  })

  it('shows nothing without rows', () => {
    const { container } = renderWithApp(<GlanceList title="At a glance" rows={[]} />)
    expect(container.querySelector('.bnb-glance')).toBeNull()
  })
})

describe('PageTabs hidden', () => {
  it('says why a tab is hidden from others', () => {
    renderWithApp(<PageTabs label="Event" active="a" onChange={vi.fn()}
      tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Seats', hidden: 'Only organisers see this for now' }]} />)
    const tab = screen.getByRole('tab', { name: 'Seats, Only organisers see this for now' })
    expect(tab).toHaveAttribute('title', 'Only organisers see this for now')
  })
})

describe('Segmented', () => {
  it('switches views and shows counts and dots', () => {
    const onChange = vi.fn()
    renderWithApp(<Segmented label="View" value="car" onChange={onChange} options={[
      { value: 'car', label: 'Carpool', count: 3 },
      { value: 'sleep', label: 'Sleeping', count: 0, dot: true, dotLabel: '2 to confirm' },
    ]} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/Sleeping/))
    expect(onChange).toHaveBeenCalledWith('sleep')
    expect(screen.getByText(', 2 to confirm')).toBeInTheDocument()
  })
})
