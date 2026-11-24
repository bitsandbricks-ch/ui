import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { DangerZone, ItemPage } from './ItemPage'

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
