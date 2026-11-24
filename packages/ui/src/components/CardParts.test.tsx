import { Button, TextInput } from '@mantine/core'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { CardGrid } from './CardGrid'
import { Card } from './feedback'
import { FormDialog } from './FormDialog'

describe('Card parts', () => {
  it('writes a line under the title', () => {
    renderWithApp(<Card title="Members" desc="Everyone who paid this year." actions={<button type="button">Add</button>}>body</Card>)
    expect(screen.getByText('Everyone who paid this year.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('takes its header row on its own in an unpadded card', () => {
    const { container } = renderWithApp(
      <Card padded={false}><Card.Header title="Members"><input aria-label="Search" /></Card.Header><p>rows</p></Card>,
    )
    expect(container.querySelector('.bnb-card-head')).toHaveTextContent('Members')
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    expect(container.querySelector('.bnb-card-body')).toBeNull()
  })

  it('lays cards out in a grid', () => {
    renderWithApp(<CardGrid columns={2}><Card>a</Card><Card>b</Card></CardGrid>)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })
})

describe('FormDialog', () => {
  it('sends the form with Enter and the submit button, and closes', async () => {
    const submit = vi.fn()
    const close = vi.fn()
    renderWithApp(
      <FormDialog open onClose={close} title="New group" subtitle="Members can join it later." onSubmit={submit}
        footer={<><Button variant="default" onClick={close}>Cancel</Button><Button type="submit">Create</Button></>}>
        <TextInput label="Name" />
      </FormDialog>,
    )
    expect(await screen.findByRole('dialog', { name: /New group/ })).toHaveTextContent('Members can join it later.')
    fireEvent.submit(screen.getByRole('textbox', { name: 'Name' }).closest('form')!)
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(submit).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(close).toHaveBeenCalled()
  })

  it('is no form without onSubmit', async () => {
    renderWithApp(<FormDialog open onClose={() => {}} title="About">Text</FormDialog>)
    expect((await screen.findByRole('dialog')).querySelector('form')).toBeNull()
  })
})
