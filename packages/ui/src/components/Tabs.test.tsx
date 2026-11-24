import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { PageTabs } from './Tabs'

describe('PageTabs alert', () => {
  it('marks a tab that needs a look with a status bit', () => {
    renderWithApp(<PageTabs label="Agents" active="a" onChange={vi.fn()}
      tabs={[{ id: 'a', label: 'Hall A', count: null }, { id: 'b', label: 'Hall B', count: 3, alert: 'down' }]} />)
    const tab = screen.getByRole('tab', { name: /Hall B/ })
    expect(tab.querySelector('.bnb-bit.is-err')).not.toBeNull()
    expect(screen.getByRole('tab', { name: 'Hall A' }).querySelector('.bnb-bit')).toBeNull()
  })
})
