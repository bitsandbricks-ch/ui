import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { InPanel, TitleLevel } from './context'
import { PageHead } from './PageHead'

describe('PageHead title level', () => {
  it('starts at h2 under a shell that has the h1', () => {
    renderWithApp(<TitleLevel.Provider value={2}><PageHead title="Agents" /></TitleLevel.Provider>)
    expect(screen.getByRole('heading', { level: 2, name: 'Agents' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('heads a section one level lower inside a panel', () => {
    renderWithApp(
      <TitleLevel.Provider value={2}><InPanel.Provider value><PageHead title="Storage" /></InPanel.Provider></TitleLevel.Provider>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Storage' })).toBeInTheDocument()
  })
})
