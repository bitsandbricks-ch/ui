import { Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BuildInfo } from './BuildInfo'

const meta: Meta = { title: 'Shell/Build info' }
export default meta

/** A release with its commit and build date, and a dev build with an extra note. */
export const Builds: StoryObj = {
  render: () => (
    <Stack gap="md">
      <BuildInfo source="https://github.com/example/app" build={{ app: 'Example', release: '1.4.0', commit: 'abcdef1234567890', built: new Date(2026, 10, 18) }} />
      <BuildInfo build={{ app: 'Example', commit: '0123456789abcdef', dev: true, built: new Date(2026, 10, 24) }} extra={<span>Agent 0.9.2</span>} />
    </Stack>
  ),
}
