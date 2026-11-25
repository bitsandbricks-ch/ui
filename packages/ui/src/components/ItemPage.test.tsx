import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { BnbProvider } from '../BnbProvider'
import { createBnbTheme } from '../theme'
import { BackLink, DangerZone, ItemPage } from './ItemPage'

const back = { href: '/hosts', label: 'Hosts' }

describe('ItemPage', () => {
  it('shows the item with the way back', () => {
    renderWithApp(<ItemPage title="web-01" eyebrow="Server" back={back}><p>Parts</p></ItemPage>)
    expect(screen.getByRole('heading', { name: 'web-01' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveAttribute('href', '/hosts')
    expect(screen.getByText('Parts')).toBeInTheDocument()
  })

  it('shows its shape while it loads', () => {
    const { container } = renderWithApp(<ItemPage back={back} loading><p>Parts</p></ItemPage>)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.queryByText('Parts')).not.toBeInTheDocument()
  })

  it('says when the item is gone and offers the way back', () => {
    renderWithApp(<ItemPage title="web-01" back={back} missing={{ title: 'This host is gone', desc: 'Someone deleted it.' }} />)
    expect(screen.getByText('This host is gone')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveAttribute('href', '/hosts')
    expect(screen.queryByRole('heading', { name: 'web-01' })).not.toBeInTheDocument()
  })
})

describe('DangerZone', () => {
  it('asks before it removes', async () => {
    const remove = vi.fn()
    renderWithApp(<DangerZone label="Delete host" question="Delete web-01?" desc="Its addresses go back to the pool." onConfirm={remove} />, '/', 'de')
    expect(screen.getByText('Entfernen')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete host' }))
    expect(remove).not.toHaveBeenCalled()
    expect(await screen.findByText('Delete web-01?')).toBeInTheDocument()
  })
})

describe('BackLink', () => {
  it('is a plain link without a router', () => {
    renderWithApp(<BackLink href="/hosts" label="Hosts" />)
    expect(screen.getByRole('link', { name: 'Hosts' })).toHaveAttribute('href', '/hosts')
  })

  it("goes through the app's router link when there is one", () => {
    const RouterLink = ({ to, ...props }: { to: string } & Record<string, unknown>) => <a data-router="yes" href={`#${to}`} {...props} />
    render(<BnbProvider theme={createBnbTheme({ accent: '#7441e0' })} link={RouterLink} notifications={false}><BackLink href="/hosts" label="Hosts" /></BnbProvider>)
    const link = screen.getByRole('link', { name: 'Hosts' })
    expect(link).toHaveAttribute('data-router', 'yes')
    expect(link).toHaveAttribute('href', '#/hosts')
  })
})
