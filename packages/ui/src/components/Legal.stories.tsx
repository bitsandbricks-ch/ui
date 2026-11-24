import { Button, Paper, Stack, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LegalConsent, LegalLinks } from './Legal'

const meta: Meta = { title: 'Shell/Legal links' }
export default meta

const hrefs = { privacy: '#privacy', terms: '#terms', imprint: 'https://example.com/imprint' }

/** In a footer, and under a sign-in form. */
export const Legal: StoryObj = {
  render: () => (
    <Stack gap="xl" maw={380}>
      <LegalLinks hrefs={hrefs} />
      <Paper withBorder p="lg">
        <Stack gap="sm">
          <TextInput label="Email" placeholder="name@example.com" />
          <Button fullWidth>Continue</Button>
          <LegalConsent hrefs={hrefs} />
        </Stack>
      </Paper>
    </Stack>
  ),
}
