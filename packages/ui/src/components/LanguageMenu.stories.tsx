import { Group, Stack, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { LanguageLinks, LanguageMenu } from './LanguageMenu'

const meta: Meta = { title: 'Shell/Language' }
export default meta

const languages = [
  { code: 'en', label: 'English' },
  { code: 'de-CH', label: 'Deutsch (Schweiz)', short: 'DE' },
  { code: 'de', label: 'Deutsch (Deutschland, Österreich)', short: 'DE' },
]

/** The top bar's button, and the footer's links. */
export const Language: StoryObj = {
  render: function Render() {
    const [lang, setLang] = useState('de-CH')
    return (
      <Stack gap="lg">
        <Group justify="flex-end" maw={480}><LanguageMenu languages={languages} value={lang} onChange={setLang} /></Group>
        <Stack gap={4}>
          <Text size="xs" c="dimmed">Footer</Text>
          <LanguageLinks languages={languages} value={lang} onChange={setLang} />
        </Stack>
      </Stack>
    )
  },
}
