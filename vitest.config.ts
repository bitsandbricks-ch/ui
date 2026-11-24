import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Tests run against the sources, so no build is needed first.
    // The showcase (apps/demo) imports the subpath entries and widgets too.
    alias: [
      { find: /^@bitsandbricks\/tokens$/, replacement: src('./packages/tokens/src/index.js') },
      { find: /^@bitsandbricks\/ui$/, replacement: src('./packages/ui/src/index.ts') },
      { find: /^@bitsandbricks\/ui\/(.+)$/, replacement: src('./packages/ui/src/$1') },
      { find: /^@bitsandbricks\/widgets$/, replacement: src('./packages/widgets/src/index.ts') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['packages/*/src/**/*.test.{ts,tsx}', 'packages/*/test/**/*.test.{js,ts}', 'test/**/*.test.{ts,tsx}', 'apps/*/src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
