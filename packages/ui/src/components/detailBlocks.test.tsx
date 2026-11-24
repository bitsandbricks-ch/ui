import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { ActionList } from './ActionList'
import { LinkedText } from './LinkedText'
import { StatusHeader } from './StatusHeader'
import { Timeline } from './Timeline'

describe('StatusHeader', () => {
  it('names the thing, its states, what stops it and what to do next', () => {
    const merge = vi.fn()
    renderWithApp(<StatusHeader title="Add the jump box" href="https://github.com/acme/web/pull/7" subtitle="acme/web#7"
      badges={[{ label: 'checks', value: '2 failed', tone: 'err' }, { label: 'review', value: 'approved', tone: 'ok' }]}
      blockers={['build fails on main']} next={{ text: 'Fix the build, then merge', action: { label: 'Merge', onClick: merge, key: 'm' } }}
      facts={[{ id: 'base', label: 'Base', value: 'main', mono: true }]} />)
    expect(screen.getByRole('heading', { name: /Add the jump box/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Add the jump box/ })).toHaveAttribute('target', '_blank')
    expect(screen.getByText('2 failed').closest('li')).toHaveAttribute('data-tone', 'err')
    expect(within(screen.getByRole('list', { name: 'What stops it' })).getByText('build fails on main')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Merge/ }))
    expect(merge).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Merge/ })).toHaveAttribute('aria-keyshortcuts', 'm')
    expect(screen.getByText('main')).toBeInTheDocument()
  })
})

describe('ActionList', () => {
  const actions = [
    { id: 'merge', label: 'Merge', onClick: vi.fn(), key: 'm', group: 'Change', primary: true },
    { id: 'close', label: 'Close', onClick: vi.fn(), group: 'Change' },
    { id: 'rerun', label: 'Run again', onClick: vi.fn(), key: 'R', group: 'Checks', disabled: true },
  ]
  it('shows the buttons in groups, with how they ended', () => {
    renderWithApp(<ActionList actions={actions} ended={{ close: 'ok' }} />)
    const change = screen.getByRole('region', { name: 'Change' })
    fireEvent.click(within(change).getByRole('button', { name: /Merge/ }))
    expect(actions[0].onClick).toHaveBeenCalled()
    expect(within(change).getByLabelText('worked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Run again/ })).toBeDisabled()
  })
  it('folds into one menu when compact, in German too', async () => {
    renderWithApp(<ActionList actions={actions} compact />, '/', 'de')
    fireEvent.click(screen.getByRole('button', { name: 'Aktionen' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /Close/ }))
    expect(actions[1].onClick).toHaveBeenCalled()
  })
})

describe('Timeline', () => {
  const events = [
    { id: '1', at: new Date(Date.now() - 3_600_000), what: 'merged', who: 'ann', source: 'github', tone: 'ok' as const, href: 'https://github.com/acme/web/pull/7' },
    { id: '2', at: new Date(Date.now() - 7_200_000), what: 'you approved it', source: 'mason', more: 'LGTM, ship it' },
  ]
  it('lists events newest first, filters by source and opens more', () => {
    renderWithApp(<Timeline events={events} sources={{ mason: 'Yours' }} />)
    expect(screen.getByText('1 hour ago')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Yours' }))
    expect(screen.queryByText('merged')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(screen.getByText('LGTM, ship it')).toBeInTheDocument()
  })
  it('says when there is nothing, and reads again on a click, in German', () => {
    const refresh = vi.fn()
    renderWithApp(<Timeline events={[]} onRefresh={refresh} />, '/', 'de')
    expect(screen.getByText('Noch nichts.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Neu laden' }))
    expect(refresh).toHaveBeenCalled()
  })
})

describe('LinkedText', () => {
  it('links what looks like a link and renders nothing as HTML', () => {
    renderWithApp(<LinkedText text={'<b>hi</b> see https://example.com/x\nnext line'} />)
    expect(screen.getByRole('link', { name: 'example.com/x' })).toHaveAttribute('href', 'https://example.com/x')
    expect(screen.getByText('<b>hi</b> see')).toBeInTheDocument()
  })
})
