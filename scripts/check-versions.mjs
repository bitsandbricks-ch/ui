// Fails unless every published package's version equals the release tag (v0.2.0 -> 0.2.0).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const tag = process.argv[2] ?? ''
const want = tag.replace(/^v/, '')
let bad = 0
for (const dir of readdirSync('packages')) {
  const pkg = JSON.parse(readFileSync(join('packages', dir, 'package.json'), 'utf8'))
  if (pkg.private) continue
  if (pkg.version !== want) {
    console.error(`${pkg.name} is ${pkg.version}, the tag says ${want}`)
    bad++
  }
}
if (bad) process.exit(1)
console.log(`all packages at ${want}`)
