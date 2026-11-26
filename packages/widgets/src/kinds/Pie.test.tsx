import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Widget } from '@bitsandbricks/ui'
import { renderWithApp } from '../../../../test/render'
import { PieKind } from './Pie'

const base = { id: 'w', label: 'Traffic by kind', size: 'small', refresh: 60, sub: '', link: '' } as const
const items = [
  { label: 'Web', value: '444 GB', number: 444e9, tone: '' },
  { label: 'Gaming', value: '367 GB', number: 367e9, tone: '' },
  { label: 'Downloads', value: '689 GB', number: 689e9, tone: '' },
] as const

describe('PieKind', () => {
  it("names the list's unit in the centre", () => {
    const widget: Widget = { ...base, type: 'list', unit: 'B', items: [...items] }
    renderWithApp(<PieKind widget={widget} level="m" box={{ w: 400, h: 200 }} />)
    expect(screen.getByText('1.5 TB')).toBeInTheDocument()
  })

  it('keeps a short bare number without a unit', () => {
    const widget: Widget = { ...base, type: 'list', items: [...items] }
    renderWithApp(<PieKind widget={widget} level="m" box={{ w: 400, h: 200 }} />)
    expect(screen.getByText('1.5T')).toBeInTheDocument()
  })
})
