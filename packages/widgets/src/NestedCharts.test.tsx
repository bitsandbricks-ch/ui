import { screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { LinkContext } from '@bitsandbricks/ui'
import { renderWithApp } from '../../../test/render'
import { NestedBars, NestedColumns, nestedShade } from './NestedCharts'

const columns = Array.from({ length: 14 }, (_, i) => ({ key: `w${i}`, label: `${i + 1}.11.`, title: `Week ${i + 1}`, values: [20 + i, 5 + i] }))

describe('NestedColumns', () => {
  it('says every column\'s numbers and labels every second column when there are many', () => {
    renderWithApp(<NestedColumns series={['Accounts', 'Active']} columns={[...columns.slice(0, 13), { ...columns[13], note: 'Holidays' }]} />)
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('max 33')).toBeInTheDocument()
    expect(screen.getByText('Week 1: Accounts 20, Active 5')).toBeInTheDocument()
    expect(screen.getByText('Week 14: Accounts 33, Active 18, Holidays')).toBeInTheDocument()
    const tips = screen.getAllByRole('tooltip', { hidden: true })
    expect(tips).toHaveLength(14)
    expect(tips[0]).toHaveTextContent('Active: 5 · Accounts: 20')
    // 14 columns: every second label, counted from the newest.
    expect(screen.getByText('14.11.')).toBeInTheDocument()
    expect(screen.queryByText('13.11.')).toBeNull()
    expect(screen.getByText('12.11.')).toBeInTheDocument()
  })

  it('reads in German and draws one plain series', () => {
    const { container } = renderWithApp(<NestedColumns series={['Aktiv']} columns={columns.slice(0, 3).map((c) => ({ ...c, values: [c.values[1]] }))} />, '/', 'de')
    expect(screen.getByText('max. 7')).toBeInTheDocument()
    expect(container.querySelectorAll('.bnb-nested-colfill')).toHaveLength(3)
  })

  it('shades the whole faintest and the last part in full colour', () => {
    expect(nestedShade(0, 1)).toBe('var(--bnb-accent)')
    expect(nestedShade(0, 3)).toContain('28%')
    expect(nestedShade(1, 3)).toContain('64%')
    expect(nestedShade(2, 3, 'red')).toBe('red')
  })
})

describe('NestedBars', () => {
  const rows = [
    { id: 'a', label: 'Spring LAN', sub: '14.03.2026', href: '/events/a', values: [14, 11, 8] },
    { id: 'b', label: 'Summer LAN', values: [10, 4, 2], srText: '10 asked, 4 answered, 2 coming', tip: <span>Upcoming</span> },
  ]

  it('shows the numbers part first, links rows through the app router and says them to screen readers', () => {
    const Link = ({ to, children, ...rest }: { to: string; children: ReactNode }) => <a href={`#${to}`} data-router {...rest}>{children}</a>
    renderWithApp(
      <LinkContext.Provider value={Link}>
        <NestedBars series={['Asked', 'Answered', 'Came']} rows={rows} foot="Details in the table below." />
      </LinkContext.Provider>,
    )
    const link = screen.getByRole('link', { name: /Spring LAN/ })
    expect(link).toHaveAttribute('href', '#/events/a')
    expect(link).toHaveAttribute('data-router')
    expect(within(link).getByText('Asked 14, Answered 11, Came 8')).toBeInTheDocument()
    expect(link.querySelector('.bnb-nested-nums')).toHaveTextContent('8 / 11 / 14')
    expect(within(link).getByRole('tooltip', { hidden: true })).toHaveTextContent('Came: 8Answered: 11Asked: 14')
    expect(screen.getByText('10 asked, 4 answered, 2 coming')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText('Details in the table below.')).toBeInTheDocument()
  })

  it('uses a plain link without a router and scales bars to the largest number', () => {
    const { container } = renderWithApp(<NestedBars series={['Asked', 'Came']} rows={[{ id: 'a', label: 'A', href: '/a', values: [20, 5] }, { id: 'b', label: 'B', values: [10, 10] }]} />)
    expect(screen.getByRole('link', { name: /A/ })).toHaveAttribute('href', '/a')
    const fills = [...container.querySelectorAll<HTMLElement>('.bnb-nested-barfill')].map((f) => f.style.width)
    expect(fills).toEqual(['100%', '25%', '50%', '50%'])
  })
})
