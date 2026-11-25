import { expect, test } from '@playwright/test'
import { createRequire } from 'node:module'
import { openStory, stories } from './story'

// axe on every story in light and dark. Contrast and names need a real browser, which the Vitest
// axe tests (jsdom) don't have. Any finding fails CI.
const axeScript = createRequire(import.meta.url).resolve('axe-core/axe.min.js')
const axeRules = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

type Violation = { id: string; help: string; nodes: { target: string[] }[] }
type Axe = { run: (context: string, options: object) => Promise<{ violations: Violation[] }> }

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }, info) => {
    await openStory(page, story.id, info)
    await page.addScriptTag({ path: axeScript })
    const violations = await page.evaluate(async (tags) => {
      const { violations } = await (window as unknown as { axe: Axe }).axe.run('#storybook-root', {
        runOnly: { type: 'tag', values: tags },
      })
      return violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target })) }))
    }, axeRules)
    const found = violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${v.help} (${n.target.join(' ')})`))
    expect(found, 'axe accessibility findings').toEqual([])
  })
}
