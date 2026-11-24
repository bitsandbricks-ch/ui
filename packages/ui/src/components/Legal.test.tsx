import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { LegalConsent, LegalLinks } from './Legal'

describe('LegalLinks', () => {
  it('links the policies that are set, other sites in a new tab', () => {
    renderWithApp(<LegalLinks hrefs={{ privacy: 'https://example.com/privacy', terms: '/terms', imprint: null }} />)
    const nav = screen.getByRole('navigation', { name: 'Legal' })
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'Terms of service' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Terms of service' })).not.toHaveAttribute('target')
    expect(nav).not.toHaveTextContent('Imprint')
  })

  it('draws nothing without links', () => {
    renderWithApp(<LegalLinks hrefs={{}} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('LegalConsent', () => {
  it('puts both links into the sentence, in German too', () => {
    renderWithApp(<LegalConsent hrefs={{ terms: '/terms', privacy: '/privacy' }} />, '/', 'de')
    expect(screen.getByText(/Mit dem Fortfahren akzeptierst du die/)).toHaveTextContent(
      'Mit dem Fortfahren akzeptierst du die Nutzungsbedingungen und die Datenschutzerklärung.')
    expect(screen.getByRole('link', { name: 'Nutzungsbedingungen' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Datenschutzerklärung' })).toHaveAttribute('href', '/privacy')
  })

  it('waits until both are known', () => {
    const { container } = renderWithApp(<LegalConsent hrefs={{ terms: '/terms' }} />)
    expect(container.querySelector('.bnb-legal')).toBeNull()
  })
})
