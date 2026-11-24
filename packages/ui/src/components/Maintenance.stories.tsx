import { Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MaintenanceBanner, MaintenanceScreen } from './Maintenance'

const meta: Meta = { title: 'Shell/Maintenance' }
export default meta

const now = new Date(2026, 10, 14, 12, 0).getTime()

/** Planned (a quiet strip, can be hidden) and going on now (warn). */
export const Banners: StoryObj = {
  render: () => (
    <Stack gap="md">
      <MaintenanceBanner startsAt={new Date(2026, 10, 14, 22)} endsAt={new Date(2026, 10, 14, 23, 30)} now={now} onDismiss={() => {}} />
      <MaintenanceBanner startsAt={new Date(2026, 10, 14, 11)} endsAt={new Date(2026, 10, 14, 13)} message="We move to the new database." now={now} />
    </Stack>
  ),
}

/** The cover over the whole app while the API answers 503. */
export const Screen: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => <MaintenanceScreen until={new Date(2026, 10, 14, 14, 5)} statusHref="#status" stillDown={() => true} every={60_000} />,
}
