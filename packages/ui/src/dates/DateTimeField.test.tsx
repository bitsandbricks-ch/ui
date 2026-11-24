import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { DateTimeField } from './DateTimeField'

describe('DateTimeField', () => {
  it('shows the value Swiss style and posts it from a hidden input', () => {
    const { container } = renderWithApp(<DateTimeField label="Starts" name="starts" defaultValue="2026-11-14T18:00" />)
    expect(screen.getByLabelText('Starts')).toHaveValue('Sat 14.11.2026, 18:00')
    expect(container.querySelector('input[type=hidden][name=starts]')).toHaveValue('2026-11-14T18:00')
  })

  it('reads a typed date when the field is left', async () => {
    const onChange = vi.fn()
    renderWithApp(<DateTimeField label="Starts" onChange={onChange} />)
    const field = screen.getByLabelText('Starts')
    await userEvent.click(field)
    await userEvent.type(field, '05.03.2030 9:30')
    fireEvent.blur(field)
    expect(onChange).toHaveBeenCalledWith('2030-03-05T09:30')
    expect(field).toHaveValue('Tue 05.03.2030, 09:30')
  })

  it("says how to write it when it can't read the text, and keeps the old value", async () => {
    const onChange = vi.fn()
    renderWithApp(<DateTimeField label="Starts" defaultValue="2026-11-14T18:00" onChange={onChange} />)
    const field = screen.getByLabelText('Starts')
    await userEvent.click(field)
    await userEvent.clear(field)
    await userEvent.type(field, 'next friday')
    fireEvent.blur(field)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Write it like 14.11.2026 18:00')).toBeInTheDocument()
  })

  // jsdom lays nothing out, so Mantine's popover takes its zero-sized target for scrolled away and
  // hides itself after the first update (hideDetached). Its contents are queried with hidden: true.
  const hidden = true

  it('picks a day and a quick time in the calendar', async () => {
    const onChange = vi.fn()
    renderWithApp(<DateTimeField label="Starts" defaultValue="2026-11-14T18:00" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Open calendar: Starts' }))
    const dialog = await screen.findByRole('dialog', { name: 'Choose date and time', hidden })
    await userEvent.click(within(dialog).getByRole('button', { name: '20.11.2026', hidden }))
    expect(onChange).toHaveBeenLastCalledWith('2026-11-20T18:00')
    await userEvent.click(within(dialog).getByRole('button', { name: '12:00', hidden }))
    expect(onChange).toHaveBeenLastCalledWith('2026-11-20T12:00')
    expect(within(dialog).getByRole('combobox', { name: 'Hour', hidden })).toBeInTheDocument()
  })

  it('speaks German', async () => {
    renderWithApp(<DateTimeField label="Beginn" defaultValue="2026-11-14T18:00" />, '/', 'de')
    expect(screen.getByLabelText('Beginn')).toHaveValue('Sa 14.11.2026, 18:00')
    await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen: Beginn' }))
    const dialog = await screen.findByRole('dialog', { name: 'Datum und Zeit wählen', hidden })
    expect(within(dialog).getByRole('button', { name: 'Fertig', hidden })).toBeInTheDocument()
    expect(within(dialog).getByText('Di')).toBeInTheDocument()
  })
})
