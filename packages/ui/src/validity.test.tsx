import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../test/render'
import { createT } from './i18n'
import { texts } from './validity.texts'
import { useValidityText, validityMessage } from './validity'

function Form() {
  useValidityText()
  return (
    <form>
      <input aria-label="Name" required />
      <input aria-label="Email" type="email" defaultValue="nope" />
      <input aria-label="Seats" type="number" min={2} defaultValue={1} />
    </form>
  )
}

describe('useValidityText', () => {
  it('says what is wrong in the app language and clears on typing', () => {
    renderWithApp(<Form />, '/', 'de')
    const name = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement
    name.checkValidity()
    expect(name.validationMessage).toBe('Bitte fülle dieses Feld aus.')
    fireEvent.input(name, { target: { value: 'Ada' } })
    expect(name.validationMessage).toBe('')
    const email = screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement
    email.checkValidity()
    expect(email.validationMessage).toBe('Gib eine E-Mail-Adresse ein, z. B. name@example.com.')
    const seats = screen.getByRole('spinbutton', { name: 'Seats' }) as HTMLInputElement
    seats.checkValidity()
    expect(seats.validationMessage).toBe('Gib 2 oder mehr ein.')
  })

  it('stops when the app unmounts', () => {
    const { unmount } = renderWithApp(<Form />)
    unmount()
    render(<input aria-label="Other" required />)
    const other = screen.getByRole('textbox', { name: 'Other' }) as HTMLInputElement
    other.checkValidity()
    expect(other.validationMessage).not.toBe('Fill in this field.')
  })
})

describe('validityMessage', () => {
  it('counts characters in English', () => {
    const t = createT('en', undefined, {}, texts)
    const el = document.createElement('input')
    Object.defineProperty(el, 'validity', { value: { tooShort: true } })
    el.minLength = 1
    expect(validityMessage(el, t)).toBe('Use at least 1 character.')
    el.minLength = 8
    expect(validityMessage(el, t)).toBe('Use at least 8 characters.')
  })
})
