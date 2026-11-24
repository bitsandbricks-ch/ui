import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import type { ChooseOptions, PromptOptions, TellOptions } from './Ask'
import { useChoose, useConfirm, usePrompt, useTell } from './useConfirm'

const bump: ChooseOptions = {
  title: 'Bump web',
  choices: [
    { value: 'patch', label: 'Patch → 1.2.4', key: 'p', hint: 'fixes', group: 'Next version' },
    { value: 'minor', label: 'Minor → 1.3.0', key: 'm', group: 'Next version' },
    { value: 'other', label: 'Another version…', key: 'v' },
  ],
}

function Chooser({ onAnswer }: { onAnswer: (v: string | null) => void }) {
  const choose = useChoose()
  return <button type="button" onClick={async () => onAnswer(await choose(bump))}>Bump</button>
}
function Prompter({ options, onAnswer }: { options: PromptOptions; onAnswer: (v: string | null) => void }) {
  const prompt = usePrompt()
  return <button type="button" onClick={async () => onAnswer(await prompt(options))}>Save view</button>
}
function Teller({ options, onDone }: { options: TellOptions; onDone: () => void }) {
  const tell = useTell()
  return <button type="button" onClick={async () => { await tell(options); onDone() }}>Disconnect</button>
}

describe('useChoose', () => {
  it('picks with a click, grouped, and with its key', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Chooser onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bump' }))
    expect(await screen.findByRole('group', { name: 'Next version' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Minor → 1.3.0/ }))
    await waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith('minor'))
    fireEvent.click(screen.getByRole('button', { name: 'Bump' }))
    fireEvent.keyDown(await screen.findByRole('button', { name: /Patch/ }), { key: 'v' })
    await waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith('other'))
  })

  it('answers null on cancel', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Chooser onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bump' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(null))
  })
})

describe('usePrompt', () => {
  it('waits for text and answers it with Enter', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Prompter options={{ title: 'Save this view as', placeholder: 'Hosts in Zurich' }} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save view' }))
    const field = await screen.findByPlaceholderText('Hosts in Zurich')
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled()
    fireEvent.change(field, { target: { value: 'Zurich' } })
    fireEvent.submit(field.closest('form') as HTMLFormElement)
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith('Zurich'))
  })

  it('starts afresh each time, in German too', async () => {
    const onAnswer = vi.fn()
    renderWithApp(<Prompter options={{ title: 'Umbenennen', label: 'Name', defaultValue: 'web' }} onAnswer={onAnswer} />, '/', 'de')
    fireEvent.click(screen.getByRole('button', { name: 'Save view' }))
    const field = await screen.findByLabelText('Name')
    fireEvent.change(field, { target: { value: 'changed' } })
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    await waitFor(() => expect(onAnswer).toHaveBeenCalledWith(null))
    fireEvent.click(screen.getByRole('button', { name: 'Save view' }))
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('web'))
  })
})

describe('useTell', () => {
  it('shows the notice with safe links and is done on OK', async () => {
    const onDone = vi.fn()
    renderWithApp(<Teller onDone={onDone} options={{ title: 'Revoke it at GitHub', body: 'The copy here is gone.',
      links: [{ href: 'https://github.com/settings/applications', label: 'GitHub applications' }, { href: 'javascript:alert(1)', label: 'Bad' }] }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }))
    expect(await screen.findByText('The copy here is gone.')).toBeInTheDocument()
    expect(screen.getByText('GitHub applications').closest('a')).toHaveAttribute('href', 'https://github.com/settings/applications')
    expect(screen.getByText('Bad').closest('a')).not.toHaveAttribute('href')
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })
})

describe('a new question', () => {
  it('cancels the one still open', async () => {
    const first = vi.fn()
    function Both() {
      const confirm = useConfirm()
      const prompt = usePrompt()
      return <>
        <button type="button" onClick={async () => first(await confirm({ title: 'Delete?' }))}>One</button>
        <button type="button" onClick={() => { void prompt({ title: 'Name?' }) }}>Two</button>
      </>
    }
    renderWithApp(<Both />)
    fireEvent.click(screen.getByRole('button', { name: 'One' }))
    await screen.findByText('Delete?')
    fireEvent.click(screen.getByRole('button', { name: 'Two', hidden: true }))
    await waitFor(() => expect(first).toHaveBeenCalledWith(false))
  })
})
