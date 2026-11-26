import { Button } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconPlus } from '@tabler/icons-react'
import { PageHead } from './PageHead'

const meta: Meta = { title: 'Components/PageHead' }
export default meta

const desc = 'Problems during the event, at a seat, a switch or a power circuit. Attendees report them from the QR code on their seat; your teams work them here, and the board keeps who took which.'

/** The main action stays a button; the page's other actions go under ⋯. */
export const WithMenu: StoryObj = {
  render: () => (
    <PageHead title="Incidents" desc={desc} actions={<Button leftSection={<IconPlus size={16} />}>New incident</Button>}
      menu={[{ label: 'Seat QR codes', onClick: () => {} }, { label: 'Download as CSV', onClick: () => {} }]} />
  ),
}

/** On a phone a long sentence shows two lines and "More", so the page starts on the first screen. */
export const PhoneIntro: StoryObj = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: WithMenu.render,
}
