import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { isStaleCode, PageError } from './PageError'

function Boom({ error }: { error: Error | null }): React.ReactNode {
  if (error) throw error
  return <p>Page content</p>
}

describe('PageError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('shows the page while nothing fails', () => {
    renderWithApp(<PageError><Boom error={null} /></PageError>)
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('shows what happened, the error and a way on instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()
    renderWithApp(<PageError onError={onError} reportHref="/support?from=/hosts"><Boom error={new Error('x is undefined')} /></PageError>)
    expect(screen.getByRole('alert')).toHaveTextContent('This page hit an error')
    expect(screen.getByText('x is undefined')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Report the problem' })).toHaveAttribute('href', '/support?from=/hosts')
    expect(onError).toHaveBeenCalledOnce()
  })

  it('tries again, and starts over on another page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Host() {
      const [error, setError] = useState<Error | null>(new Error('first'))
      const [page, setPage] = useState('/a')
      return (
        <>
          <button type="button" onClick={() => setError(null)}>fix</button>
          <button type="button" onClick={() => { setError(new Error('again')); setPage('/b') }}>go</button>
          <PageError resetKey={page}><Boom error={error} /></PageError>
        </>
      )
    }
    renderWithApp(<Host />)
    fireEvent.click(screen.getByText('fix'))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('Page content')).toBeInTheDocument()
    fireEvent.click(screen.getByText('go'))
    expect(screen.getByRole('alert')).toHaveTextContent('again')
  })

  it('says a new version is out when old code is gone, after one reload', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sessionStorage.setItem('bnb-reloaded-for-update', '1')   // the reload already happened
    renderWithApp(<PageError><Boom error={new TypeError('Failed to fetch dynamically imported module: /assets/Hosts-abc.js')} /></PageError>, '/', 'de')
    expect(screen.getByRole('alert')).toHaveTextContent('Es gibt eine neue Version')
    expect(screen.queryByRole('button', { name: 'Nochmals versuchen' })).not.toBeInTheDocument()
  })

  it('knows stale code from other errors', () => {
    expect(isStaleCode(new Error('Loading chunk 12 failed.'))).toBe(true)
    expect(isStaleCode(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleCode(new Error('x is undefined'))).toBe(false)
  })
})
