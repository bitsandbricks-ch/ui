import { notifications } from '@mantine/notifications'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { ActionForm, actionFailure, ActionSettingsProvider, useRunAction } from './ActionForm'
import { Notice } from './Notice'

let shown: { color?: string; message: unknown }[] = []
beforeEach(() => {
  shown = []
  vi.spyOn(notifications, 'show').mockImplementation((n) => { shown.push(n); return 't' })
})
afterEach(() => vi.restoreAllMocks())
const toasted = () => shown.map((n) => `${n.color}: ${String(n.message)}`)

describe('actionFailure', () => {
  it('reads { error } and { ok: false, message } as failures', () => {
    expect(actionFailure({ error: 'Name taken' })).toBe('Name taken')
    expect(actionFailure({ ok: false, message: 'Full' })).toBe('Full')
    expect(actionFailure({ ok: true, message: 'Sent' })).toBeNull()
    expect(actionFailure(undefined)).toBeNull()
  })
})

function Runner({ fn, success }: { fn: () => Promise<unknown>; success?: string | false }) {
  const run = useRunAction()
  return <button onClick={() => void run(fn, success)}>Go</button>
}

describe('useRunAction', () => {
  it('toasts "Saved." or the own text, the failure text, and a generic text for a throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = renderWithApp(<Runner fn={async () => ({ ok: true })} />)
    await userEvent.click(screen.getByRole('button'))
    rerender(<Runner fn={async () => ({ ok: true, message: 'Invite sent.' })} />)
    await userEvent.click(screen.getByRole('button'))
    rerender(<Runner fn={async () => ({ error: 'Name taken' })} />)
    await userEvent.click(screen.getByRole('button'))
    rerender(<Runner fn={async () => { throw new Error('boom') }} />)
    await userEvent.click(screen.getByRole('button'))
    rerender(<Runner fn={async () => ({ ok: true })} success={false} />)
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(toasted()).toEqual([
      'ok: Saved.', 'ok: Invite sent.', 'err: Name taken', "err: That didn't work. Please try again.",
    ]))
  })

  it("lets the app's navigation errors count as success and pass on", async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;/x' })
    let thrown: unknown
    function Nav() {
      const run = useRunAction()
      return <button onClick={() => run(async () => { throw redirect }, 'Created.').catch((e) => { thrown = e })}>Go</button>
    }
    renderWithApp(
      <ActionSettingsProvider isNavigation={(e) => (e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT') ?? false}>
        <Nav />
      </ActionSettingsProvider>,
    )
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(thrown).toBe(redirect))
    expect(toasted()).toEqual(['ok: Created.'])
  })
})

describe('ActionForm', () => {
  it('sends the form, toasts, and keeps typed values when it failed', async () => {
    const action = vi.fn(async () => ({ error: 'Name taken' }))
    renderWithApp(
      <ActionForm action={action}>
        <input name="name" aria-label="Name" />
        <button>Save</button>
      </ActionForm>,
    )
    const field = screen.getByLabelText('Name') as HTMLInputElement
    await userEvent.type(field, 'Anna')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(toasted()).toEqual(['err: Name taken']))
    expect((action.mock.calls[0] as unknown as [FormData])[0].get('name')).toBe('Anna')
    // React resets the form after its action; the failed one gets its values back.
    await new Promise((r) => setTimeout(r, 20))
    expect(field.value).toBe('Anna')
  })

  it('clears after a success, as React does', async () => {
    renderWithApp(
      <ActionForm action={async () => ({ ok: true })}>
        <input name="name" aria-label="Name" />
        <button>Add</button>
      </ActionForm>,
    )
    const field = screen.getByLabelText('Name') as HTMLInputElement
    await userEvent.type(field, 'Anna')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(field.value).toBe(''))
  })

  it('asks first when it has confirm, and only sends on yes', async () => {
    const action = vi.fn(async () => ({ ok: true }))
    renderWithApp(
      <ActionForm action={action} done="deleted" confirm={{ title: 'Delete the event?', confirmLabel: 'Delete' }}>
        <button>Delete event</button>
      </ActionForm>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete event' }))
    expect(action).not.toHaveBeenCalled()
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(toasted()).toEqual(['ok: Deleted.']))
  })

  it('saves toggles on change with auto', async () => {
    const action = vi.fn(async () => ({ ok: true }))
    renderWithApp(
      <ActionForm action={action} auto="toggles" done={false}>
        <input type="checkbox" name="mail" aria-label="Mail me" />
      </ActionForm>,
    )
    fireEvent.click(screen.getByLabelText('Mail me'))
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    expect(toasted()).toEqual([])
  })
})

describe('Notice', () => {
  it('speaks as a status, or as an alert for err, and closes', async () => {
    const onClose = vi.fn()
    const { rerender } = renderWithApp(<Notice tone="warn" onClose={onClose}>Tickets sell out soon.</Notice>)
    expect(screen.getByRole('status')).toHaveTextContent('Tickets sell out soon.')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
    rerender(<Notice tone="err">This event was cancelled.</Notice>)
    expect(screen.getByRole('alert')).toHaveTextContent('cancelled')
  })
})
