import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type Plugin } from 'vite'

// The package's theme script, served next to index.html: it paints the saved light or dark scheme
// before the app loads, as it does in the apps.
const themeScript = (): Plugin => {
  const read = () => readFileSync(createRequire(import.meta.url).resolve('@bitsandbricks/ui/theme-script.js'), 'utf8')
  return {
    name: 'theme-script',
    configureServer(server) {
      server.middlewares.use('/theme-script.js', (_req, res) => {
        res.setHeader('content-type', 'text/javascript')
        res.end(read())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'theme-script.js', source: read() })
    },
  }
}

// The showcase builds against the packages' dist/ (run `pnpm build` first), the way Hubra and
// Floorbit get them from npm, so a missing export or stylesheet shows up here. `base: './'` lets
// the same build run at https://bitsandbricks-ch.github.io/ui/ and anywhere else.
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [react(), themeScript()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
})
