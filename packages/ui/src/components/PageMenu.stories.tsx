import { Button } from '@mantine/core'
import { IconDeviceTv, IconPencil, IconPin, IconPlus, IconTrash } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHead } from './PageHead'

const meta: Meta = { title: 'Components/Page menu' }
export default meta
type Story = StoryObj

/** One primary action; the rest behind "⋯", so the head fits a phone. */
export const HeadWithMenu: Story = {
  render: () => (
    <PageHead eyebrow="Inventory" title="Hosts" desc="Every machine in the lab, with its zone and address."
      actions={<Button leftSection={<IconPlus size={16} />}>Add host</Button>}
      menu={[
        { label: 'Pin to sidebar', icon: <IconPin size={16} />, onClick: () => {} },
        { label: 'Edit', icon: <IconPencil size={16} />, onClick: () => {} },
        { label: 'Big screen', icon: <IconDeviceTv size={16} />, href: '#' },
        { label: 'Delete all', icon: <IconTrash size={16} />, danger: true, onClick: () => {} },
      ]} />
  ),
}
