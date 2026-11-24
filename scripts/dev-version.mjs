// Sets every published package to a dev version of the next patch, for the dev build of a main
// commit: 0.2.0 -> 0.2.1-dev.20261124134900.sha-abc1234 (commit time in UTC, short sha). Run only in
// the dev workflow, never committed. The time comes first so later commits sort higher; the sha
// gets a prefix because a numeric prerelease part may not start with 0.
// Usage: node scripts/dev-version.mjs <commit sha> <commit time, ISO 8601>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [sha = '', time = ''] = process.argv.slice(2)
if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new Error(`not a commit sha: "${sha}"`)
const date = new Date(time)
if (Number.isNaN(date.getTime())) throw new Error(`not a time: "${time}"`)
const stamp = date.toISOString().replace(/\D/g, '').slice(0, 14)

const packages = readdirSync('packages')
  .map((dir) => join('packages', dir, 'package.json'))
  .map((file) => ({ file, pkg: JSON.parse(readFileSync(file, 'utf8')) }))
  .filter(({ pkg }) => !pkg.private)

// The packages share one version (changesets "fixed"), so one dev version for all of them.
const versions = new Set(packages.map(({ pkg }) => pkg.version))
if (versions.size !== 1) throw new Error(`packages differ in version: ${[...versions].join(', ')}`)
const [current] = versions
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current)
if (!match) throw new Error(`main has a prerelease version ${current}; no dev build`)
const dev = `${match[1]}.${match[2]}.${Number(match[3]) + 1}-dev.${stamp}.sha-${sha.slice(0, 7)}`

for (const { file, pkg } of packages) {
  pkg.version = dev
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`)
}
console.log(dev)
