import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { Breadcrumbs } from './Breadcrumbs'
import { ScopeSwitcher } from './ScopeSwitcher'
import { StatusLine } from './StatusLine'

describe('Breadcrumbs', () => {
  it('links every crumb but the last, which is the page shown now', () => {
    renderWithApp(<Breadcrumbs items={[{ label: 'Inventory' }, { label: 'Hosts', href: '/hosts' }, { label: 'web-01' }]} />)
    const nav = screen.getByRole('navigation', { name: 'Where you are' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveAttribute('href', '/hosts')
    expect(screen.queryByRole('link', { name: 'Inventory' })).toBeNull()
    expect(screen.getByText('web-01')).toHaveAttribute('aria-current', 'page')
  })

  it('names itself in German', () => {
    renderWithApp(<Breadcrumbs items={[{ label: 'Hosts' }]} />, '/', 'de')
    expect(screen.getByRole('navigation', { name: 'Wo du bist' })).toBeInTheDocument()
  })
})

describe('ScopeSwitcher', () => {
  const sites = [{ value: 'zh', label: 'Zürich' }, { value: 'be', label: 'Bern', description: '12 hosts' }]

  it('shows the pick, offers all and every option, and reports a choice', async () => {
    const onChange = vi.fn()
    renderWithApp(<ScopeSwitcher label="Site" value="zh" options={sites} onChange={onChange} />)
    const button = screen.getByRole('button', { name: 'Site: Zürich' })
    fireEvent.click(button)
    // All, then the options in their order; the pick is marked.
    const [all, zurich, bern] = await screen.findAllByRole('menuitem')
    expect(all).toHaveTextContent('All')
    expect(all).not.toHaveAttribute('aria-current')
    expect(zurich).toHaveTextContent('Zürich')
    expect(zurich).toHaveAttribute('aria-current', 'true')
    expect(bern).toHaveTextContent('Bern12 hosts')
    fireEvent.click(all)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('shows all for a value that is no longer offered', () => {
    renderWithApp(<ScopeSwitcher label="Site" value="gone" options={sites} onChange={() => {}} allLabel="All sites" />)
    expect(screen.getByRole('button', { name: 'Site: All sites' })).toBeInTheDocument()
  })

  it('draws nothing with only one option', () => {
    const { container } = renderWithApp(<ScopeSwitcher label="Site" value="" options={[sites[0]]} onChange={() => {}} />)
    expect(container.querySelector('.bnb-scope')).toBeNull()
  })
})

describe('StatusLine', () => {
  it('shows items with their tone, links and the end', () => {
    const { container } = renderWithApp(
      <StatusLine end="v1.2.0" items={[
        { id: 'live', label: 'live', tone: 'ok' },
        { id: 'agents', label: 'agents 3/4', href: '/agents', title: 'Agents linked now', hideOnPhone: true },
      ]} />,
    )
    expect(container.querySelector('.bnb-bit.is-ok')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'agents 3/4' })
    expect(link).toHaveAttribute('href', '/agents')
    expect(link).toHaveAttribute('title', 'Agents linked now')
    expect(link).toHaveClass('is-phone-hidden')
    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
  })
})
