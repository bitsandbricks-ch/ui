// Builds the package in the current directory: tsc emits ESM and types to dist/, CSS is copied.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
rmSync(dist, { recursive: true, force: true })
const tsc = join(import.meta.dirname, '../node_modules/typescript/bin/tsc')
execFileSync(process.execPath, [tsc, '-p', join(root, 'tsconfig.build.json')], { stdio: 'inherit' })

function copyCss(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) copyCss(path)
    else if (entry.name.endsWith('.css')) cpSync(path, join(dist, relative(join(root, 'src'), path)))
  }
}
copyCss(join(root, 'src'))

// tsc keeps import paths as written ('./theme'); Node's ESM loader (Vitest in an app, SSR) needs
// the file: './theme.js', or './kinds/index.js' for a folder.
const SPEC = /((?:from|import)\s*\(?\s*['"])(\.{1,2}\/[^'"]+)(['"])/g
function fixImports(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) { fixImports(path); continue }
    if (!/\.(js|d\.ts)$/.test(entry.name)) continue
    const text = readFileSync(path, 'utf8').replace(SPEC, (all, head, spec, tail) => {
      if (/\.(js|css|json)$/.test(spec)) return all
      const target = resolve(dirname(path), spec)
      if (existsSync(`${target}.js`)) return `${head}${spec}.js${tail}`
      if (existsSync(target) && statSync(target).isDirectory()) return `${head}${spec}/index.js${tail}`
      return all
    })
    writeFileSync(path, text)
  }
}
fixImports(dist)
console.log(`${relative(join(root, '../..'), root)}: dist/ written`)
