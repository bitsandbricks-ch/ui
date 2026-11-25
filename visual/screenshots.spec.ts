import { expect, test } from '@playwright/test'
import { openStory, stories } from './story'

// One picture per story and project (light, dark, phone), compared with visual/__screenshots__.
// CI only reports differences (visual/README.md); it never blocks a merge on them.
for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }, info) => {
    await openStory(page, story.id, info)
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true })
  })
}
