// Runs the screenshot checks in the same Playwright image CI uses, so pictures taken locally match
// CI's to the pixel. Needs Docker and a built Storybook (`pnpm build && pnpm build-storybook`).
//   pnpm visual:docker                        check
//   pnpm visual:docker --update-snapshots=changed   rewrite the pictures that changed
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const { version } = createRequire(import.meta.url)('@playwright/test/package.json')
const repo = resolve(import.meta.dirname, '..')
const args = [
  'run', '--rm', '--ipc=host', '-e', 'CI=1',
  '-v', `${repo}:/work`, '-w', '/work',
  `mcr.microsoft.com/playwright:v${version}-noble`,
  'npx', 'playwright', 'test', '-c', 'visual', ...process.argv.slice(2),
]
const { status } = spawnSync('docker', args, { stdio: 'inherit' })
process.exit(status ?? 1)
