import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { KeysSheet } from './KeysSheet'

describe('KeysSheet', () => {
  it('lists the page keys read from its buttons, then the keys everywhere', async () => {
    renderWithApp(<>
      <main>
        <button aria-keyshortcuts="r">Reload</button>
        <button aria-keyshortcuts="n" disabled>New host</button>
      </main>
      <KeysSheet opened onClose={() => {}} everywhere={[{ key: 'ctrl+k', label: 'Jump to a page' }, { key: '?', label: 'These keys' }]} />
    </>)
    const sheet = await screen.findByRole('dialog', { name: 'Keys' })
    expect(within(sheet).getByText('On this page')).toBeInTheDocument()
    expect(within(sheet).getByText('Reload')).toBeInTheDocument()
    expect(within(sheet).getByText('(not now)')).toBeInTheDocument()
    expect(within(sheet).getByText('Everywhere')).toBeInTheDocument()
    expect(within(sheet).getByText('Jump to a page')).toBeInTheDocument()
  })

  it('speaks German and says when there are none', async () => {
    renderWithApp(<KeysSheet opened onClose={() => {}} scope={false} />, '/', 'de')
    const sheet = await screen.findByRole('dialog', { name: 'Tasten' })
    expect(within(sheet).getByText('Hier gibt es keine Tasten.')).toBeInTheDocument()
  })
})
