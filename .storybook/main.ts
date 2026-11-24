import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'node:url'

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// The visual reference for every app, published to GitHub Pages. Stories run on the sources.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
  core: { disableTelemetry: true },
  viteFinal: (vite) => {
    vite.resolve ??= {}
    vite.resolve.alias = {
      ...(vite.resolve.alias as Record<string, string>),
      '@bitsandbricks/tokens': src('../packages/tokens/src/index.js'),
      '@bitsandbricks/ui': src('../packages/ui/src/index.ts'),
    }
    return vite
  },
}
export default config
