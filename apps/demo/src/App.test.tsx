import { act, render, screen } from '@testing-library/react'
import { App } from './App'

// Every page of the showcase renders, in English and in German, so a change in a package that
// breaks the showcase fails here and not only on GitHub Pages.
const PAGES = [
  ['/', 'Overview', 'Übersicht'],
  ['/hosts', 'Hosts', 'Hosts'],
  ['/hosts/h3', 'db-01', 'db-01'],
  ['/hosts/nope', 'No such host', 'Diesen Host gibt es nicht'],
  ['/forms', 'Forms and dialogs', 'Formulare und Dialoge'],
  ['/states', 'States and feedback', 'Zustände und Rückmeldungen'],
  ['/tokens', 'Tokens', 'Tokens'],
] as const

describe.each(['en', 'de'] as const)('showcase in %s', (locale) => {
  beforeEach(() => localStorage.setItem('demo-locale', locale))
  afterEach(() => { localStorage.clear(); window.location.hash = '' })

  it.each(PAGES)('renders %s', async (path, en, de) => {
    window.location.hash = path
    render(<App />)
    await act(async () => {})
    const name = locale === 'en' ? en : de
    // A missing item shows its empty state instead of a page title.
    if (path === '/hosts/nope') expect(screen.getByText(name)).toBeInTheDocument()
    else expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument()
  })
})
