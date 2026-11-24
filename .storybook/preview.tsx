import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '../packages/tokens/dist/tokens.css'
import '../packages/ui/src/styles.css'
import '../packages/widgets/src/styles.css'
import { useMantineColorScheme } from '@mantine/core'
import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect, useRef, type ReactNode } from 'react'
import { BnbProvider, createBnbTheme, tokens } from '../packages/ui/src'
import { sampleAccents } from './accents'

const themes = Object.fromEntries(
  Object.entries(sampleAccents).map(([name, accent]) => [name, createBnbTheme({ accent: accent ?? tokens.defaultAccent })]),
)

// Applies the toolbar's Theme only when it changes. setColorScheme is a new function on every
// render, so depending on it reset the scheme after each click on a story's own theme switch.
function Scheme({ scheme, children }: { scheme: 'light' | 'dark'; children: ReactNode }) {
  const { setColorScheme } = useMantineColorScheme()
  const applied = useRef<string | null>(null)
  useEffect(() => {
    if (applied.current === scheme) return
    applied.current = scheme
    setColorScheme(scheme)
  }, [scheme, setColorScheme])
  return <>{children}</>
}

const withApp: Decorator = (Story, context) => {
  const { accent = 'labdex', scheme = 'light', locale = 'en' } = context.globals as Record<string, string>
  return (
    <BnbProvider theme={themes[accent]} locale={locale as 'en' | 'de'} defaultColorScheme="light">
      <Scheme scheme={scheme as 'light' | 'dark'}>
        <div style={{ padding: 24, background: 'var(--bnb-bg)', minHeight: '100vh' }}>
          <Story />
        </div>
      </Scheme>
    </BnbProvider>
  )
}

const preview: Preview = {
  decorators: [withApp],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  globalTypes: {
    accent: {
      description: 'Sample accent (the real ones live in the apps)',
      toolbar: { title: 'Accent', icon: 'paintbrush', items: Object.keys(sampleAccents), dynamicTitle: true },
    },
    scheme: {
      description: 'Light or dark',
      toolbar: { title: 'Theme', icon: 'contrast', items: ['light', 'dark'], dynamicTitle: true },
    },
    locale: {
      description: 'Language',
      toolbar: { title: 'Language', icon: 'globe', items: ['en', 'de'], dynamicTitle: true },
    },
  },
  initialGlobals: { accent: 'labdex', scheme: 'light', locale: 'en' },
}
export default preview
