import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { NotificationDetail, NotificationLinks, NotificationsBell, NotificationsPanel, type NotificationItem } from './Notifications'

const items: NotificationItem[] = [
  { id: 'd1', state: 'down', group: 'down', title: 'sw-c-02 is offline', where: 'Hall C', time: '2 min ago' },
  { id: 'w1', state: 'warn', group: 'warn', title: 'Circuit B close', where: 'Hall B' },
  { id: 's1', state: 'warn', group: 'seats', title: 'Seat A-6 duplex', where: 'Hall A', search: 'seat a-6 sw-a-03' },
]
const filters = [{ value: 'down', label: 'Down' }, { value: 'warn', label: 'Warnings' }, { value: 'seats', label: 'Seats' }]
const detail = (it: NotificationItem) => <NotificationDetail title={`Detail of ${it.title as string}`} state={it.state} />

const rowNames = () => within(screen.getByRole('list', { name: 'Notifications' })).getAllByRole('button').map((b) => b.textContent)

describe('NotificationsBell', () => {
  it('says the count in its name and paints it red when something is down', () => {
    const click = vi.fn()
    renderWithApp(<NotificationsBell count={4} alarm onClick={click} />)
    const bell = screen.getByRole('button', { name: 'Notifications (4)' })
    expect(bell.querySelector('.bnb-bell-count')).toHaveClass('is-alarm')
    fireEvent.click(bell)
    expect(click).toHaveBeenCalled()
  })

  it('has no count when nothing is open, in German too', () => {
    renderWithApp(<NotificationsBell onClick={() => {}} />, '/', 'de')
    const bell = screen.getByRole('button', { name: 'Benachrichtigungen' })
    expect(bell.querySelector('.bnb-bell-count')).toBeNull()
  })
})

// jsdom matches no media query, so the panel thinks it is on a phone. A computer's window:
function onComputer() {
  const plain = window.matchMedia
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({ ...plain(query), matches: /min-width/.test(query) })) as typeof window.matchMedia
  })
  afterEach(() => { window.matchMedia = plain })
}

describe('NotificationsPanel on a phone', () => {
  it('shows the details in place of the list until Back', async () => {
    renderWithApp(<NotificationsPanel items={items} onClose={() => {}} renderDetail={detail} />)
    expect(screen.queryByText(/Detail of/)).toBeNull()
    fireEvent.click(await screen.findByRole('button', { name: /Circuit B close/ }))
    expect(screen.getByText('Detail of Circuit B close')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Notifications' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back to the list' }))
    expect(rowNames()).toHaveLength(3)
  })
})

describe('NotificationsPanel', () => {
  onComputer()

  it('lists the items in order and shows the first one beside the list', async () => {
    renderWithApp(<NotificationsPanel items={items} onClose={() => {}} renderDetail={detail} />)
    expect(await screen.findByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
    expect(rowNames()).toEqual(['sw-c-02 is offlineHall C2 min ago', 'Circuit B closeHall B', 'Seat A-6 duplexHall A'])
    expect(screen.getByText('Detail of sw-c-02 is offline')).toBeInTheDocument()
  })

  it('picks a row, and steps with the arrows in the header', async () => {
    renderWithApp(<NotificationsPanel items={items} onClose={() => {}} renderDetail={detail} />)
    fireEvent.click(await screen.findByRole('button', { name: /Circuit B close/ }))
    expect(screen.getByText('Detail of Circuit B close')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Circuit B close/ })).toHaveAttribute('aria-current', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'The one below in the list' }))
    expect(screen.getByText('Detail of Seat A-6 duplex')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'The one below in the list' })).toBeNull()
  })

  it('filters by group with counts and searches every word', async () => {
    renderWithApp(<NotificationsPanel items={items} filters={filters} onClose={() => {}} />)
    fireEvent.change(await screen.findByRole('textbox', { name: 'Search' }), { target: { value: 'SW-A-03' } })
    expect(rowNames()).toEqual(['Seat A-6 duplexHall A'])
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'hall nothing' } })
    expect(screen.getByText('Nothing matches this filter.')).toBeInTheDocument()
  })

  it('says nothing needs a look when the list is empty', async () => {
    renderWithApp(<NotificationsPanel items={[]} onClose={() => {}} />, '/', 'de')
    expect(await screen.findByText('Nichts braucht einen Blick.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('pages at 50', async () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ id: `n${i}`, state: 'warn', title: `Item ${i}` }))
    renderWithApp(<NotificationsPanel items={many} onClose={() => {}} />)
    await screen.findByRole('dialog')
    expect(rowNames()).toHaveLength(50)
    expect(screen.getByText('1–50 of 120')).toBeInTheDocument()
  })

  it('links to every notification and to settings, and closes on the way', async () => {
    const close = vi.fn()
    const settings = vi.fn()
    renderWithApp(<NotificationsPanel items={items} onClose={close} allHref="/problems" onSettings={settings} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Notification settings' }))
    expect(settings).toHaveBeenCalled()
    const all = screen.getByRole('link', { name: 'Show all' })
    expect(all).toHaveAttribute('href', '/problems')
    fireEvent.click(all)
    expect(close).toHaveBeenCalled()
  })
})

describe('NotificationDetail', () => {
  it('shows the state, title, place and the places to look next', () => {
    renderWithApp(
      <NotificationDetail state="down" title="sw-c-02 is offline" where="Hall C" time="2 min ago">
        <NotificationLinks links={[{ href: '/plan', label: 'Show on the plan' }]} />
      </NotificationDetail>,
    )
    expect(screen.getByText('Down')).toBeInTheDocument()
    expect(screen.getByText('sw-c-02 is offline')).toBeInTheDocument()
    expect(screen.getByText('Where to look next')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Show on the plan' })).toHaveAttribute('href', '/plan')
  })

  it('says when there is nowhere to go and when it is over, in German', () => {
    renderWithApp(<><NotificationLinks links={[]} /><NotificationDetail gone /></>, '/', 'de')
    expect(screen.getByText('Hier gibt es nichts weiter zu öffnen.')).toBeInTheDocument()
    expect(screen.getByText('Das ist vorbei')).toBeInTheDocument()
  })
})
