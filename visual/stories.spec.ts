import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// One screenshot per story and project (light, dark, phone), plus an axe accessibility check in light
// and dark: contrast and names need a real browser, which the Vitest axe tests (jsdom) don't have. The story list comes from the built
// Storybook, so a new story is checked without touching this file. A story tagged `!visual`
// (`tags: ['!visual']`) is left out, for the rare story that can't hold still.
type Entry = { id: string; title: string; name: string; type: string; tags?: string[] }

const index = JSON.parse(readFileSync(new URL('../storybook-static/index.json', import.meta.url), 'utf8')) as {
  entries: Record<string, Entry>
}
const stories = Object.values(index.entries).filter((e) => e.type === 'story' && !e.tags?.includes('!visual'))

// Stories that show "today" or "5 minutes ago" read this time, so the pictures don't change daily.
const now = new Date('2026-03-16T10:30:00+01:00')

const axeScript = createRequire(import.meta.url).resolve('axe-core/axe.min.js')
const axeRules = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

type Violation = { id: string; help: string; nodes: { target: string[] }[] }

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }, info) => {
    const scheme = info.project.metadata.scheme as 'light' | 'dark'
    await page.clock.setFixedTime(now)
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=scheme:${scheme}`)
    await page.locator('html').and(page.locator(`[data-mantine-color-scheme="${scheme}"]`)).waitFor()
    // Storybook marks the body once the story has rendered, or once it threw.
    await page.locator('body.sb-show-main, body.sb-show-errordisplay').waitFor({ state: 'attached' })
    await expect(page.locator('body'), 'the story throws').not.toHaveClass(/sb-show-errordisplay/)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')
    // Soft, so an accessibility finding still leaves the picture to compare (or to take).
    await expect.soft(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true })

    if (info.project.name === 'phone') return
    await page.addScriptTag({ path: axeScript })
    const violations = await page.evaluate(async (tags) => {
      const { violations } = await (window as unknown as { axe: { run: (c: string, o: object) => Promise<{ violations: Violation[] }> } }).axe.run(
        '#storybook-root',
        { runOnly: { type: 'tag', values: tags } },
      )
      return violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target })) }))
    }, axeRules)
    const found = violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${v.help} (${n.target.join(' ')})`))
    expect(found, 'axe accessibility findings').toEqual([])
  })
}
