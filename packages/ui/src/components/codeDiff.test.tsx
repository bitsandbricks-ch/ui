import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { CodeDiff } from './CodeDiff'
import { FieldDiff } from './FieldDiff'

describe('CodeDiff', () => {
  it('numbers the lines, colours YAML and says what changed', () => {
    const { container } = renderWithApp(<CodeDiff file="zh.yaml" before={'name: web-01\nvlan: 10\n'} after={'name: web-01\nvlan: 20\n'} />)
    const table = screen.getByRole('table', { name: 'zh.yaml' })
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveClass('is-del')
    expect(rows[1]).toHaveTextContent('removed')
    expect(rows[2]).toHaveClass('is-add')
    expect(rows[2].querySelector('.bnb-code-n')).toHaveTextContent('2')
    expect(screen.getByText('1 lines added, 1 removed')).toHaveClass('bnb-sr-only')
    expect(container.querySelector('.bnb-tk-key')).toHaveTextContent('name')
  })

  it('shows a file alone, plain, and says when nothing changed', () => {
    const { container, unmount } = renderWithApp(<CodeDiff after={'a: 1\n'} language="text" label="Compose file" />)
    expect(screen.getByRole('table', { name: 'Compose file' })).toHaveTextContent('a: 1')
    expect(container.querySelector('.bnb-code-head')).toBeNull()
    expect(container.querySelector('.bnb-tk-key')).toBeNull()
    unmount()
    renderWithApp(<CodeDiff before="a: 1" after="a: 1" />, '/', 'de')
    expect(screen.getByText('Keine Änderung.')).toBeInTheDocument()
  })
})

describe('FieldDiff', () => {
  it('shows before and after per field, with objects as JSON and empty values named', () => {
    renderWithApp(<FieldDiff rows={[
      { path: 'vlan', before: 10, after: 20 },
      { path: 'tags', label: 'Tags', before: null, after: ['web'] },
    ]} />)
    const rows = within(screen.getByRole('table', { name: 'Changes' })).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('vlan1020')
    expect(rows[2]).toHaveTextContent('Tagsempty["web"]')
  })

  it('says when no field changed', () => {
    renderWithApp(<FieldDiff rows={[]} />, '/', 'de')
    expect(screen.getByText('Keine Feldänderungen erfasst.')).toBeInTheDocument()
  })
})
