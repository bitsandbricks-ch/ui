// Writes dist/: the JS modules with their types, tokens.css and tokens.json.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderCss } from '../src/css.js'
import tokens from '../src/tokens.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

cpSync(join(root, 'src'), dist, { recursive: true })
execFileSync(process.execPath, [join(root, '../../node_modules/typescript/bin/tsc'), '-p', join(root, 'tsconfig.build.json')], { stdio: 'inherit' })

writeFileSync(join(dist, 'tokens.css'), renderCss())
writeFileSync(join(dist, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`)
console.log('tokens: dist/ written')
