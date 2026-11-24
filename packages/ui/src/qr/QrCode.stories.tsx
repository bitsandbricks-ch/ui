import { Group, Stack, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QrCode } from './QrCode'

const meta: Meta<typeof QrCode> = {
  title: 'QR/QrCode',
  component: QrCode,
  args: { value: 'https://example.ch/hosts/web-01', size: 160 },
}
export default meta
type Story = StoryObj<typeof QrCode>

export const Link: Story = {}

export const Levels: Story = {
  name: 'Correction levels',
  render: () => (
    <Group align="flex-start">
      {(['L', 'M', 'Q', 'H'] as const).map((level) => (
        <Stack key={level} gap={4} align="center">
          <QrCode value="https://example.ch/hosts/web-01" level={level} size={120} />
          <Text size="xs" c="dimmed">{level}</Text>
        </Stack>
      ))}
    </Group>
  ),
}

export const TooLong: Story = { name: 'Too long', args: { value: 'x'.repeat(4000) } }
