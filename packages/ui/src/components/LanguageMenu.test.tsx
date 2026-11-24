import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { LanguageLinks, LanguageMenu } from './LanguageMenu'

const languages = [{ code: 'en', label: 'English' }, { code: 'de-CH', label: 'Deutsch' }]

describe('LanguageMenu', () => {
  it('shows the short form and picks another language', async () => {
    const pick = vi.fn()
    renderWithApp(<LanguageMenu languages={languages} value="de-CH" onChange={pick} />, '/', 'de')
    const button = screen.getByRole('button', { name: 'Sprache: Deutsch' })
    expect(button).toHaveTextContent('DE')
    fireEvent.click(button)
    const [en, de] = await screen.findAllByRole('menuitem', { hidden: true })
    expect(de).toHaveAttribute('aria-current', 'true')
    expect(en).toHaveAttribute('lang', 'en')
    fireEvent.click(en)
    expect(pick).toHaveBeenCalledWith('en')
  })
})

describe('LanguageLinks', () => {
  it('marks the current language and picks another', () => {
    const pick = vi.fn()
    renderWithApp(<LanguageLinks languages={languages} value="en" onChange={pick} />)
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(pick).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Deutsch' }))
    expect(pick).toHaveBeenCalledWith('de-CH')
  })
})
