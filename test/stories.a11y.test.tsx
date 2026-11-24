/// <reference types="vite/client" />
// Runs axe on every Storybook story, so a missing label, a wrong role or an unnamed control fails
// the unit tests. jsdom has no layout, so colour contrast is checked by the tokens' contrast tests
// (packages/tokens/test), not here.
import { composeStories } from '@storybook/react-vite'
import { act } from '@testing-library/react'
import axe from 'axe-core'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from './render'

type StoryModule = Parameters<typeof composeStories>[0]
const modules = import.meta.glob<StoryModule>('../packages/*/src/**/*.stories.tsx', { eager: true })

// Rules that need a real browser or a whole page, not one story in jsdom.
const off = Object.fromEntries(
  ['color-contrast', 'color-contrast-enhanced', 'link-in-text-block', 'region', 'page-has-heading-one', 'landmark-one-main', 'scrollable-region-focusable']
    .map((id) => [id, { enabled: false }]),
)

describe.each(Object.entries(modules))('%s', (_file, mod) => {
  const stories = Object.entries(composeStories(mod)) as [string, ComponentType][]
  it.each(stories)('%s has no axe violations', async (_name, Story) => {
    const { container } = renderWithApp(<Story />)
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })
    const { violations } = await axe.run(container, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      rules: off,
    })
    expect(violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html.slice(0, 200)).join('\n  ')}`)).toEqual([])
  })
})
