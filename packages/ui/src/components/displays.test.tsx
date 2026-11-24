import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { AttentionList } from './AttentionList'
import { DetailItem, DetailList } from './DetailList'
import { StateStrip } from './StateStrip'
import { Steps } from './Steps'
import { UsageBar, usageTone } from './UsageBar'

describe('DetailList', () => {
  it('pairs labels and values, with a dash for a missing one and your own rows after', () => {
    const { container } = renderWithApp(
      <DetailList columns={3} items={[
        { id: 'ip', label: 'Address', value: '192.0.2.10', mono: true, hint: 'from DHCP' },
        { id: 'os', label: 'System', value: '' },
      ]}>
        <DetailItem label="Tags" wide>web, prod</DetailItem>
      </DetailList>,
    )
    const dl = container.querySelector('dl')!
    expect(dl).toHaveStyle('--bnb-details-cols: 3')
    expect(screen.getByText('Address').tagName).toBe('DT')
    expect(screen.getByText('192.0.2.10').closest('dd')).toHaveClass('is-mono')
    expect(screen.getByText('from DHCP')).toBeInTheDocument()
    expect(screen.getByTitle('Not set')).toHaveTextContent('—')
    expect(screen.getByText('web, prod').closest('.bnb-detail')).toHaveClass('is-wide')
  })
})

describe('UsageBar', () => {
  it('turns amber and red as it fills', () => {
    expect(usageTone(40)).toBe('ok')
    expect(usageTone(75)).toBe('warn')
    expect(usageTone(95)).toBe('err')
    expect(usageTone(60, 50, 80)).toBe('warn')
  })

  it('is a meter with its number, or a dash when nothing was reported', () => {
    renderWithApp(<><UsageBar value={93.6} label="Disk" /><UsageBar value={null} label="memory" /></>)
    const meter = screen.getByRole('meter', { name: 'Disk' })
    expect(meter).toHaveAttribute('aria-valuenow', '94')
    expect(meter).toHaveAttribute('data-tone', 'err')
    expect(meter).toHaveTextContent('94%')
    expect(screen.getByTitle('No memory reported')).toHaveTextContent('—')
  })
})

describe('StateStrip', () => {
  it('draws one cell per stretch and says it in words', () => {
    const { container } = renderWithApp(
      <StateStrip label="1 hour with an outage" cells={[{ tone: 'none' }, { tone: 'ok' }, { tone: 'err', title: 'this hour: down' }]} />,
    )
    expect(screen.getByRole('img', { name: '1 hour with an outage' })).toBeInTheDocument()
    expect(container.querySelectorAll('.bnb-strip-cell')).toHaveLength(3)
    expect(screen.getByTitle('this hour: down')).toHaveClass('is-err')
  })
})

describe('Steps', () => {
  it('marks the current step and says each state for screen readers', () => {
    renderWithApp(<Steps label="Where this change stands" steps={[
      { id: 'plan', label: 'Plan', state: 'done', detail: '5 min ago' },
      { id: 'review', label: 'Review', state: 'current', detail: '1 of 2 approvals' },
      { id: 'apply', label: 'Apply', state: 'todo' },
    ]} />)
    const list = screen.getByRole('list', { name: 'Where this change stands' })
    const items = within(list).getAllByRole('listitem')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[0]).toHaveTextContent('(done)')
    expect(items[2]).toHaveTextContent('3')
  })
})

describe('AttentionList', () => {
  it('puts the worst first, each with its one action', () => {
    const fix = vi.fn()
    renderWithApp(<AttentionList items={[
      { id: 'u', tone: 'info', title: '3 unknown devices', action: { label: 'Add', href: '/discovery' } },
      { id: 'd', tone: 'err', title: 'web-01 is down', detail: 'not reachable', time: '3 min ago', action: { label: 'Fix', onClick: fix } },
    ]} />)
    const rows = within(screen.getByRole('list', { name: 'Needs attention' })).getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent('Broken: web-01 is down')
    expect(rows[0]).toHaveTextContent('not reachable · 3 min ago')
    fireEvent.click(within(rows[0]).getByRole('button', { name: 'Fix' }))
    expect(fix).toHaveBeenCalled()
    expect(within(rows[1]).getByRole('link', { name: 'Add' })).toHaveAttribute('href', '/discovery')
  })

  it('says all is well when nothing needs a look', () => {
    renderWithApp(<AttentionList items={[]} />, '/', 'de')
    expect(screen.getByText('Alles gut: nichts zu prüfen.')).toBeInTheDocument()
  })

})
