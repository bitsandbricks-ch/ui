import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { Card, EmptyState, ErrorBanner, LoadingState } from './feedback'

describe('page states', () => {
  it('shows an empty state with its next step', () => {
    const add = vi.fn()
    renderWithApp(<EmptyState title="No hosts yet" description="Add the first one." action={{ label: 'Add host', onClick: add }} />)
    expect(screen.getByText('No hosts yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add host' }))
    expect(add).toHaveBeenCalled()
  })

  it('shows an error that can be retried, in German too', () => {
    const retry = vi.fn()
    renderWithApp(<ErrorBanner message="Server down" onRetry={retry} />, '/', 'de')
    expect(screen.getByRole('alert')).toHaveTextContent('Server down')
    fireEvent.click(screen.getByRole('button', { name: 'Nochmals versuchen' }))
    expect(retry).toHaveBeenCalled()
  })

  it('takes the error from a query, and draws nothing without one', () => {
    const { container } = renderWithApp(<ErrorBanner error={null} />)
    expect(container.querySelector('[role="alert"]')).toBeNull()
    renderWithApp(<ErrorBanner error={new Error('Server down')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong: Server down')
  })

  it('draws the shape of a page while it loads, without a spinner', () => {
    const { container } = renderWithApp(<LoadingState rows={3} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('.mantine-Skeleton-root')).toHaveLength(3)
    expect(container.querySelector('.mantine-Loader-root')).toBeNull()
  })

  it('says it is loading', () => {
    renderWithApp(<LoadingState />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })

  it('draws a card with a header', () => {
    renderWithApp(<Card title="Members" actions={<button type="button">Add</button>}>body</Card>)
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })
})
