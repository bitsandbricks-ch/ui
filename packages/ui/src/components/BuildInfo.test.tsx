import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { BuildInfo } from './BuildInfo'

const source = 'https://github.com/example/app'
const built = new Date(2026, 10, 18, 14, 5)

describe('BuildInfo', () => {
  it('links the release and the commit, and says when it was built', () => {
    renderWithApp(<BuildInfo source={source} build={{ app: 'Floorbit', release: '1.4.0', commit: 'abcdef1234567', built }} />)
    expect(screen.getByRole('link', { name: 'Floorbit 1.4.0' })).toHaveAttribute('href', `${source}/releases/tag/v1.4.0`)
    const hash = screen.getByRole('link', { name: 'abcdef1' })
    expect(hash).toHaveAttribute('href', `${source}/commit/abcdef1234567`)
    expect(hash).toHaveAttribute('title', 'Commit abcdef1234567 on GitHub')
    expect(screen.getByText(/^built 18 Nov 2026$/)).toBeInTheDocument()
  })

  it('marks a dev build without a release, in German', () => {
    renderWithApp(<BuildInfo build={{ app: 'Hubra', commit: 'abcdef1234567', dev: true, built: built.getTime() / 1000 }} />, '/', 'de')
    expect(screen.getByText('Hubra')).toBeInTheDocument()
    expect(screen.getByText('Entwicklungsversion')).toBeInTheDocument()
    expect(screen.getByText('abcdef1')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText(/^erstellt am 18\.11\.2026$/)).toBeInTheDocument()
  })
})
