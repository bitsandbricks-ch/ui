import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../../../test/render'
import { InlineMarkdown, Markdown } from './Markdown'

describe('Markdown', () => {
  it('draws headings, lists, bold, code and safe links only', () => {
    const { container } = renderWithApp(<Markdown source={'## Steps\n1. Check the **cable**\n2. Run `show int`\n\n- [docs](https://example.com)\n- [bad](javascript:alert(1))\n- [hosts](/hosts)\n\n<b>raw</b>'} />)
    expect(screen.getByRole('heading', { name: 'Steps' })).toBeInTheDocument()
    expect(container.querySelectorAll('ol li')).toHaveLength(2)
    expect(container.querySelector('strong')?.textContent).toBe('cable')
    expect(container.querySelector('code')?.textContent).toBe('show int')
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'hosts' })).toHaveAttribute('href', '/hosts')
    expect(screen.queryByRole('link', { name: 'bad' })).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(screen.getByText('<b>raw</b>')).toBeInTheDocument()
  })

  it('joins lines into a paragraph, or keeps each line with breaks', () => {
    expect(renderWithApp(<Markdown source={'one\ntwo'} />).container.querySelectorAll('p')).toHaveLength(1)
    const { container } = renderWithApp(<Markdown source={'one\ntwo'} breaks />)
    expect(container.querySelectorAll('p')).toHaveLength(2)
  })

  it('keeps an indented line with its list item', () => {
    const { container } = renderWithApp(<Markdown source={'- first\n  goes on\n- second'} />)
    expect(container.querySelectorAll('li')[0]).toHaveTextContent('first goes on')
  })

  it('draws one line inline', () => {
    const { container } = renderWithApp(<p><InlineMarkdown text="**Faster lists**: `pager` pages at 50" /></p>)
    expect(container.querySelector('strong')).toHaveTextContent('Faster lists')
    expect(container.querySelector('code')).toHaveTextContent('pager')
  })
})
