import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { createColorSchemeManager, readColorScheme } from '../colorScheme'
import { PageHead } from './PageHead'
import { PageTabs } from './Tabs'
import { ThemeToggle } from './ThemeSwitch'

describe('PageTabs', () => {
  it('switches tabs and shows counts', () => {
    const onChange = vi.fn()
    renderWithApp(<PageTabs label="Views" active="a" onChange={onChange} tabs={[{ id: 'a', label: 'Hosts', count: 4 }, { id: 'b', label: 'Zones' }]} />)
    expect(screen.getByRole('tab', { name: /Hosts/ })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Zones' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('PageHead', () => {
  it('heads the page with its eyebrow, sentence and buttons', () => {
    renderWithApp(<PageHead eyebrow="Inventory" title="Hosts" desc="All machines." actions={<button type="button">Add</button>} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Hosts' })).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })
})

describe('theme choice', () => {
  it('cycles light, dark and the device with one button', () => {
    renderWithApp(<ThemeToggle />)
    const button = screen.getByRole('button')
    const first = button.getAttribute('aria-label')
    fireEvent.click(button)
    expect(button.getAttribute('aria-label')).not.toBe(first)
  })

  it('keeps the choice in a cookie that sibling apps read', () => {
    localStorage.clear()
    const onSave = vi.fn()
    const manager = createColorSchemeManager({ cookie: 'test_theme', onSave })
    expect(manager.get('auto')).toBe('auto')
    manager.set('dark')
    expect(document.cookie).toContain('test_theme=dark')
    expect(readColorScheme('test_theme')).toBe('dark')
    expect(onSave).toHaveBeenCalledWith('dark')
    manager.clear()
    expect(readColorScheme('test_theme')).toBe('auto')
  })
})
