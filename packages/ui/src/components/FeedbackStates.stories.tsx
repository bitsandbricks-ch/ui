import { Button, Group, Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { toastWorking } from '../toast'
import { Card, ErrorBanner, NoMatches, OfflineBanner } from './feedback'

const meta: Meta = { title: 'Feedback/States' }
export default meta

export const ErrorWithDetails: StoryObj = {
  render: () => (
    <ErrorBanner message="Your account isn't allowed to do this here." onRetry={() => {}}
      details={'gh api -X PUT repos/acme/web/branches/main/protection: HTTP 403\nResource not accessible by integration'} />
  ),
}

export const NothingMatches: StoryObj = {
  render: () => <Card><NoMatches filters={['state: closed', 'mine', 'label: bug']} onClear={() => {}} /></Card>,
}

export const Offline: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: function Render() {
    const [at, setAt] = useState(() => Date.now() + 8000)
    return <OfflineBanner retryAt={at} onRetry={() => setAt(Date.now() + 8000)} />
  },
}

export const WorkingToast: StoryObj = {
  render: () => (
    <Stack gap="sm">
      <Group gap="xs">
        <Button onClick={() => { const job = toastWorking('Saving the host'); setTimeout(() => job.done('Saved web-1'), 1500) }}>Save (works)</Button>
        <Button variant="default" onClick={() => { const job = toastWorking('Restarting web-1'); setTimeout(() => job.failed(new Error('web-1 did not answer')), 1500) }}>Restart (fails)</Button>
      </Group>
    </Stack>
  ),
}
