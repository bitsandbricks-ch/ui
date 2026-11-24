import { Switch, TextInput } from '@mantine/core'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { HelpTip } from './HelpTip'

describe('HelpTip', () => {
  it('opens its text on click and closes on a second click', async () => {
    renderWithApp(<TextInput label={<HelpTip label="Title" help="Plan panes name themselves." />} />)
    const button = screen.getByRole('button', { name: 'Help: Title' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Plan panes name themselves.')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'))
  })

  it('opens while the mouse is on it', async () => {
    renderWithApp(<HelpTip name="Time shown" help="Every graph that can." />)
    const button = screen.getByRole('button', { name: 'Help: Time shown' })
    fireEvent.pointerEnter(button, { pointerType: 'mouse' })
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Every graph that can.')
    fireEvent.pointerLeave(button, { pointerType: 'mouse' })
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'))
  })

  it('does not flip the switch its label belongs to', async () => {
    renderWithApp(<Switch label={<HelpTip label="Public" help="Opens without signing in." />} />)
    fireEvent.click(screen.getByRole('button', { name: 'Help: Public' }))
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('names itself in German', () => {
    renderWithApp(<HelpTip label="Titel" help="…" />, '/', 'de')
    expect(screen.getByRole('button', { name: 'Hilfe: Titel' })).toBeInTheDocument()
  })
})
