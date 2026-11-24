import { notifications } from '@mantine/notifications'
import { describe, expect, it, vi } from 'vitest'
import { toastWorking } from './toast'

describe('toastWorking', () => {
  it('shows a working toast and turns it into the result in place', () => {
    const show = vi.spyOn(notifications, 'show').mockReturnValue('t1')
    const update = vi.spyOn(notifications, 'update').mockReturnValue('t1')
    const hide = vi.spyOn(notifications, 'hide').mockReturnValue('t1')
    const job = toastWorking('Saving the host')
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ loading: true, message: 'Saving the host', autoClose: false }))
    job.done('Saved')
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ id: 't1', loading: false, color: 'ok', message: 'Saved' }))
    job.failed(new Error('Server down'))
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ id: 't1', color: 'err', message: 'Server down' }))
    job.drop()
    expect(hide).toHaveBeenCalledWith('t1')
    vi.restoreAllMocks()
  })
})
